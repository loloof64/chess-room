<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { notify } from "@kyvg/vue3-notification";
import { sleep } from "../utils";

import { noGiveUp, hostGaveUp, guestGaveUp } from "@/constants.js";
import ChessHistory from "@/components/ChessHistory.vue";

import start from "@/assets/images/start.svg";
import stop from "@/assets/images/stop.svg";
import reverse from "@/assets/images/reverse.svg";
import user from "@/assets/images/user.svg";

import NewGameDialog from "@/components/dialogs/NewGameDialog.vue";
import GiveUpGameDialog from "@/components/dialogs/GiveUpGameDialog.vue";

import { openDialog } from "vue3-promise-dialog";
import { tryUpdatingRoom, tryReadingRoom } from "@/lib/roomHandler.js";

import { useRoomStore } from "@/stores/RoomStore.js";
import { useGameStore } from "@/stores/GameStore.js";

import { storeToRefs } from "pinia";

const { t } = useI18n();
const roomStore = useRoomStore();
const gameStore = useGameStore();

const boardSize = ref("100");
const board = ref();
const history = ref();
const boardReversed = ref(false);

const atLeastAGameStarted = ref(false);

const weAreHost = computed(() => roomStore.roomOwner === true);
const gameStarted = computed(() => roomStore.gameStarted === true);
const {
  currentPosition,
  whitePlayerIsHuman,
  blackPlayerIsHuman,
  whiteNickname,
  blackNickname,
  weHaveWhite,
} = storeToRefs(gameStore);

const whiteTurn = computed(() => currentPosition.value.split(' ')[1] === 'w');

import { client, databaseId, collectionId } from "@/lib/appwrite.js";
const unsubscribeCheckNewGameStarted = ref();

function resizeBoard() {
  const minSize =
    window.innerWidth < window.innerHeight
      ? window.innerWidth
      : window.innerHeight;
  boardSize.value = `${minSize * 0.88}`;
}

async function startNewGame() {
  const roomId = roomStore.roomId;
  const result = await tryReadingRoom({ roomId });
  const hasError = result.hasOwnProperty("error");
  if (hasError) {
    alert(t(result.error));
    return;
  }
  const { startPosition, hostHasWhite, hostUser, guestUser } =
    result.matchingDocument;
  const startPositionParts = startPosition.split(" ");
  const moveNumber = parseInt(startPositionParts[5]);
  const whiteTurn = startPositionParts[1] === "w";
  history.value.reset(moveNumber, whiteTurn);
  gameStore.setHistoryNodes(history.value.getNodes());

  roomStore.setStartPosition(startPosition);
  board.value.newGame(startPosition);
  gameStore.setCurrentPosition(startPosition);
  const hostPlaysWithWhiteSide = [true, "true"].includes(hostHasWhite);
  const weHaveWhite =
    (hostPlaysWithWhiteSide && weAreHost.value) ||
    (!hostPlaysWithWhiteSide && !weAreHost.value);
  gameStore.setWeHaveWhiteStatus(weHaveWhite);
  gameStore.setWhitePlayerIsHuman(weHaveWhite);
  gameStore.setBlackPlayerIsHuman(!weHaveWhite);
  gameStore.setWhiteNickname(hostHasWhite ? hostUser : guestUser);
  gameStore.setBlackNickname(hostHasWhite ? guestUser : hostUser);
  atLeastAGameStarted.value = true;
  roomStore.setAtLeastAGameStartedStatus(true);

  gameStore.setLastMoveArrow({
    start: {
      file: -Infinity,
      rank: -Infinity,
    },
    end: {
      file: -Infinity,
      rank: -Infinity,
    },
  });
}

async function openNewGameOptionsDialog() {
  const result = await openDialog(NewGameDialog, {});
  const { startPosition, withWhiteSide } = result;
  if (result) {
    const newValues = {
      gameStarted: true,
      giveUpSide: noGiveUp,
      startPosition,
      hostHasWhite: withWhiteSide,
    };
    const roomId = roomStore.roomId;
    const result = await tryUpdatingRoom({ roomId, newValues });
    const hasError = result.hasOwnProperty("error");
    if (hasError) {
      alert(t(result.error));
      return;
    }
    roomStore.setGameStartedStatus(true);
    roomStore.setStartPosition(startPosition);
    const weAreHost = roomStore.roomOwner;
    const boardShouldBeReversed =
      (withWhiteSide && !weAreHost) || (!withWhiteSide && weAreHost);
    gameStore.setBoardReversedStatus(boardShouldBeReversed);
    boardReversed.value = boardShouldBeReversed;
    startNewGame();
  }
}

async function openGiveUpGameDialog() {
  const result = await openDialog(GiveUpGameDialog, {});
  const weAreHost = [true, "true"].includes(roomStore.roomOwner);
  if (result) {
    const newValues = {
      gameStarted: false,
      giveUpSide: weAreHost ? hostGaveUp : guestGaveUp,
    };
    const roomId = roomStore.roomId;
    const result = await tryUpdatingRoom({ roomId, newValues });
    const hasError = result.hasOwnProperty("error");
    if (hasError) {
      alert(t(result.error));
      return;
    }
    roomStore.setGameStartedStatus(false);
    gameStore.setWhitePlayerIsHuman(false);
    gameStore.setBlackPlayerIsHuman(false);
  }
}

function moveCoordinatesToLongUciNotation(coodinates) {
  const firstFile = String.fromCharCode(
    "a".charCodeAt(0) + coodinates.startFile
  );
  const firstRank = String.fromCharCode(
    "1".charCodeAt(0) + coodinates.startRank
  );
  const endFile = String.fromCharCode("a".charCodeAt(0) + coodinates.endFile);
  const endRank = String.fromCharCode("1".charCodeAt(0) + coodinates.endRank);
  return `${firstFile}${firstRank}${endFile}${endRank}`;
}

function handleEventInDb(response) {
  const payload = response.payload;
  const localDatabaseId = payload.$databaseId;
  const localCollectionId = payload.$collectionId;
  const localDocumentId = payload.id;
  const gameHasStarted = ["true", true].includes(payload.gameStarted);
  const roomId = roomStore.roomId;

  const isMatchingDocument =
    databaseId == localDatabaseId &&
    collectionId == localCollectionId &&
    roomId == localDocumentId;
  const weAreGuest = !weAreHost.value;

  if (isMatchingDocument) {
    if (gameHasStarted) {
      const gameStartHandlerAlreadyProcessed = roomStore.gameStarted;
      if (weAreGuest && !gameStartHandlerAlreadyProcessed) {
        const boardShouldBeReversed =
          (payload.hostHasWhite && !payload.roomOwner) ||
          (!payload.hostHasWhite && payload.roomOwner);
        roomStore.setGameStartedStatus(true);
        gameStore.setBoardReversedStatus(boardShouldBeReversed);
        boardReversed.value = boardShouldBeReversed;
        startNewGame();
      }
      // try to play lastMoveSan
      const success = board.value.playManualMove(
        moveCoordinatesToLongUciNotation({
          startFile: payload.lastMoveStartFile,
          startRank: payload.lastMoveStartRank,
          endFile: payload.lastMoveEndFile,
          endRank: payload.lastMoveEndRank,
          promotion: payload.lastMovePromotion,
        })
      );
      if (!success) {
        console.log(`Illegal move ${payload.lastMoveSan}`);
        console.log(`Board position is ${board.value.getCurrentPosition()}`);
        return;
      }
      gameStore.setLastMoveArrow({
        start: {
          file: payload.lastMoveStartFile,
          rank: payload.lastMoveStartRank,
        },
        end: {
          file: payload.lastMoveEndFile,
          rank: payload.lastMoveEndRank,
        },
      });
      const resultingPosition = board.value.getCurrentPosition();
      currentPosition.value = resultingPosition;
    }
    // !gameHasStarted
    else {
      const giveUpSide = payload.giveUpSide;
      const otherPeerInitiatedGiveUp = weAreHost.value
        ? giveUpSide >= guestGaveUp
        : giveUpSide <= hostGaveUp;
      if (otherPeerInitiatedGiveUp) {
        roomStore.setGameStartedStatus(false);
        gameStore.setWhitePlayerIsHuman(false);
        gameStore.setBlackPlayerIsHuman(false);
        notify({
          text: t("pages.game.outcomes.gaveUp"),
        });
      }
    }
  }
}

function toggleBoardOrientation() {
  boardReversed.value = !boardReversed.value;
}

async function handleMoveDone(
  moveNumber,
  whiteTurn,
  moveSan,
  moveFan,
  resultingPosition,
  move,
  promotion
) {
  history.value.addNodeOrCompleteFirst({
    number: moveNumber,
    whiteTurn,
    fan: moveFan,
    fen: resultingPosition,
    fromFileIndex: move.start.file,
    fromRankIndex: move.start.rank,
    toFileIndex: move.end.file,
    toRankIndex: move.end.rank,
  });
  const historyNodesCount = history.value.getNodesCount();
  const lastHistoryNode = history.value.getLastNode;
  if (historyNodesCount > 1 && lastHistoryNode.fan) {
    gameStore.addHistoryNode(history.value.getLastNode());
  } else {
    gameStore.setHistoryNodes(history.value.getNodes());
  }
  gameStore.setLastMoveArrow(move);
  currentPosition.value = resultingPosition;

  // Notify about move done in database
  const newValues = {
    lastMoveSan: moveSan,
    lastMoveFan: moveFan,
    lastMoveStartFile: move.start.file,
    lastMoveStartRank: move.start.rank,
    lastMoveEndFile: move.end.file,
    lastMoveEndRank: move.end.rank,
    lastMovePromotion: promotion,
  };
  const roomId = roomStore.roomId;
  const result = await tryUpdatingRoom({ roomId, newValues });
  const hasError = result.hasOwnProperty("error");
  if (hasError) {
    alert(t(result.error));
    return;
  }
}

async function handleCheckmate(byWhite) {
  if (!gameStarted.value) return;

  // let the board and interface update
  await sleep(50);

  const newValues = {
    gameStarted: false,
  };
  const roomId = roomStore.roomId;
  const result = await tryUpdatingRoom({ roomId, newValues });
  const hasError = result.hasOwnProperty("error");

  if (hasError) {
    console.error(result.error);
  }

  roomStore.setGameStartedStatus(false);
  const message = t("pages.game.outcomes.checkmate");
  notify({
    text: message,
  });
}

async function handleStalemate() {
  if (!gameStarted.value) return;

  // let the board and interface update
  await sleep(50);

  const newValues = {
    gameStarted: false,
  };
  const roomId = roomStore.roomId;
  const result = await tryUpdatingRoom({ roomId, newValues });
  const hasError = result.hasOwnProperty("error");

  if (hasError) {
    console.error(result.error);
  }

  roomStore.setGameStartedStatus(false);
  const message = t("pages.game.outcomes.stalemate");
  notify({
    text: message,
  });
}

async function handlePerpetualDraw() {
  if (!gameStarted.value) return;

  // let the board and interface update
  await sleep(50);

  const newValues = {
    gameStarted: false,
  };
  const roomId = roomStore.roomId;
  const result = await tryUpdatingRoom({ roomId, newValues });
  const hasError = result.hasOwnProperty("error");

  if (hasError) {
    console.error(result.error);
  }

  roomStore.setGameStartedStatus(false);
  const message = t("pages.game.outcomes.perpetualDraw");
  notify({
    text: message,
  });
}

async function handleMissingMaterial() {
  if (!gameStarted.value) return;

  // let the board and interface update
  await sleep(50);

  const newValues = {
    gameStarted: false,
  };
  const roomId = roomStore.roomId;
  const result = await tryUpdatingRoom({ roomId, newValues });
  const hasError = result.hasOwnProperty("error");

  if (hasError) {
    console.error(result.error);
  }

  roomStore.setGameStartedStatus(false);
  const message = t("pages.game.outcomes.missingMaterial");
  notify({
    text: message,
  });
}

async function handleFiftyMovesDraw() {
  if (!gameStarted.value) return;

  // let the board and interface update
  await sleep(50);

  const newValues = {
    gameStarted: false,
  };
  const roomId = roomStore.roomId;
  const result = await tryUpdatingRoom({ roomId, newValues });
  const hasError = result.hasOwnProperty("error");

  if (hasError) {
    console.error(result.error);
  }

  roomStore.setGameStartedStatus(false);
  const message = t("pages.game.outcomes.fiftyMovesDraw");
  notify({
    text: message,
  });
}

onMounted(() => {
  const roomId = roomStore.roomId;
  if (roomId) {
    const realDbChannel = `databases.${databaseId}.collections.${collectionId}.documents.${roomId}"`;
    unsubscribeCheckNewGameStarted.value = client.subscribe(
      [realDbChannel, "documents"],
      handleEventInDb
    );
  }
});

onBeforeUnmount(() => {
  if (unsubscribeCheckNewGameStarted.value) {
    unsubscribeCheckNewGameStarted.value();
  }
});

onMounted(() => {
  window.addEventListener("resize", resizeBoard);
  resizeBoard();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeBoard);
});

onMounted(() => {
  board.value.newGame(currentPosition.value);
  atLeastAGameStarted.value = roomStore.atLeastAGameStarted;
  boardReversed.value = gameStore.boardReversed;

  history.value.setNodes(gameStore.historyNodes);
  board.value.setLastMoveArrow(gameStore.lastMoveArrow);
});
</script>

<template>
  <div id="pageRoot">
    <div id="gameZone">
      <ChessHistory ref="history" />
      <ChessboardVue
        id="board"
        ref="board"
        :size="boardSize"
        :whitePlayerHuman="whitePlayerIsHuman"
        :blackPlayerHuman="blackPlayerIsHuman"
        :reversed="boardReversed"
        @moveDone="handleMoveDone"
        @checkmate="handleCheckmate"
        @stalemate="handleStalemate"
        @perpetualDraw="handlePerpetualDraw"
        @missingMaterialDraw="handleMissingMaterial"
        @fiftyMovesDraw="handleFiftyMovesDraw"
      />
    </div>
    <div id="miscZone">
      <!-- buttons -->
      <div id="buttons">
        <button @click="toggleBoardOrientation">
          <img :src="reverse" />
        </button>
        <button
          v-if="weAreHost && !gameStarted"
          @click="openNewGameOptionsDialog"
        >
          <img :src="start" />
        </button>
        <button v-if="gameStarted" @click="openGiveUpGameDialog">
          <img :src="stop" />
        </button>
      </div>
      <!-- buttons -->
      <table id="nicknames" v-if="atLeastAGameStarted">
        <tr class="nickname" :class="[whiteTurn ? 'highlight' : '']">
          <td><div class="color white" /></td>
          <td>
            <p>{{ whiteNickname }}</p>
          </td>
          <td><img :src="user" v-if="weHaveWhite === true" /></td>
        </tr>
        <tr class="nickname" :class="[whiteTurn ? '' : 'highlight']">
          <td><div class="color black" /></td>
          <td>
            <p>{{ blackNickname }}</p>
          </td>
          <td><img :src="user" v-if="weHaveWhite === false" /></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
#pageRoot {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

#gameZone {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}

#miscZone {
  margin: 0 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#buttons {
  margin: 6px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

#buttons > button {
  border: 1px solid blue;
  margin: 0px 8px;
}

#buttons > button > img {
  width: 40px;
  height: 40px;
}

#nicknames {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 20vh;
  border: 1px solid blue;
  border-radius: 10px;
}

.nickname {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 2px;
}

.nickname.highlight {
  background-color: coral;
}

.nickname > td:nth-child(1) {
  width: 6vw;
}

.nickname > td:nth-child(2) {
  width: 12vw;
}

.nickname > td:nth-child(3) {
  width: 3vw;
}

.nickname > td > .color {
  width: 3vw;
  margin: 0 8px;
  height: 3vw;
  border: 1px solid black;
  border-radius: 4px;
}

.nickname > td > .color.white {
  background-color: white;
}

.nickname > td > .color.black {
  background-color: black;
}

.nickname > td > p {
  font-family: "Courier New", Courier, monospace;
  font-weight: bold;
  font-size: large;
}

.nickname > td > img {
  width: 3vw;
  height: 3vw;
}

@media (max-width: 1000px) {
  #root {
    flex-direction: column;
  }

  #buttons > button {
    padding: 2px;
  }

  #buttons > button > img {
    width: 6vw;
    height: 6vw;
  }
}
</style>

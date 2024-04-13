<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { notify } from "@kyvg/vue3-notification";

import { noGiveUp, hostGaveUp, guestGaveUp } from "@/constants.js";
import ChessHistory from "@/components/ChessHistory.vue";

import start from "@/assets/images/start.svg";
import stop from "@/assets/images/stop.svg";

import NewGameDialog from "@/components/dialogs/NewGameDialog.vue";
import GiveUpGameDialog from "@/components/dialogs/GiveUpGameDialog.vue";

import { openDialog } from "vue3-promise-dialog";
import { tryUpdatingRoom, tryReadingRoom } from "@/lib/roomHandler.js";

import { useRoomStore } from "@/stores/RoomStore.js";
import { useGameStore } from "@/stores/GameStore.js";

import { createPinia, storeToRefs } from "pinia";

const { t } = useI18n();
const roomStore = useRoomStore();
const gameStore = useGameStore();

const boardSize = ref("100");
const board = ref();
const history = ref();
const router = useRouter();

const atLeastAGameStarted = ref(false);

const weAreHost = computed(() => ["true", true].includes(roomStore.roomOwner));
const gameStarted = computed(() =>
  ["true", true].includes(roomStore.gameStarted)
);
const {
  currentPosition,
  whitePlayerIsHuman,
  blackPlayerIsHuman,
  whiteNickname,
  blackNickname,
} = storeToRefs(gameStore);

import { client, databaseId, collectionId } from "@/lib/appwrite.js";
const unsubscribeCheckNewGameStarted = ref();

function resizeBoard() {
  const minSize =
    window.innerWidth < window.innerHeight
      ? window.innerWidth
      : window.innerHeight;
  boardSize.value = `${minSize * 0.9}`;
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
  roomStore.setStartPosition(startPosition);
  board.value.newGame(startPosition);
  gameStore.setCurrentPosition(startPosition);
  const hostPlaysWithWhiteSide = [true, "true"].includes(hostHasWhite);
  const weHaveWhite =
    (hostPlaysWithWhiteSide && weAreHost.value) ||
    (!hostPlaysWithWhiteSide && !weAreHost.value);
  gameStore.setWhitePlayerIsHuman(weHaveWhite);
  gameStore.setBlackPlayerIsHuman(!weHaveWhite);
  gameStore.setWhiteNickname(hostHasWhite ? hostUser : guestUser);
  gameStore.setBlackNickname(hostHasWhite ? guestUser : hostUser);
  atLeastAGameStarted.value = true;
  roomStore.setAtLeastAGameStartedStatus(true);
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
        roomStore.setGameStartedStatus(true);
        startNewGame();
      }
    }
    // !gameHasStarted
    else {
      const giveUpSide = payload.giveUpSide;
      const weDidNotInitiateGiveUp = weAreHost.value
        ? giveUpSide !== hostGaveUp
        : giveUpSide !== guestGaveUp;
      if (weDidNotInitiateGiveUp) {
        roomStore.setGameStartedStatus(false);
        gameStore.setWhitePlayerIsHuman(false);
        gameStore.setBlackPlayerIsHuman(false);
        gameStore.setWhiteNickname("");
        gameStore.setBlackNickname("");
        notify({
          text: t("pages.game.outcomes.gaveUp"),
        });
      }
    }
  }
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
});
</script>

<template>
  <div id="pageRoot">
    <div id="gameZone">
      <chess-history ref="history" />
      <ChessboardVue
        id="board"
        ref="board"
        size="300"
        :whitePlayerHuman="whitePlayerIsHuman"
        :blackPlayerHuman="blackPlayerIsHuman"
      />
    </div>
    <div id="miscZone">
      <!-- buttons -->
      <div id="buttons">
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
      <div id="nicknames" v-if="atLeastAGameStarted">
        <div class="nickname">
          <div class="color white" />
          <p>{{ whiteNickname }}</p>
        </div>
        <div class="nickname">
          <div class="color black" />
          <p>{{ blackNickname }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#pageRoot {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
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

.nickname > .color {
  width: 3vw;
  margin: 0 8px;
  height: 3vw;
  border: 1px solid black;
  border-radius: 4px;
}

.nickname > .color.white {
  background-color: white;
}

.nickname > .color.black {
  background-color: black;
}

.nickname > p {
  font-family: "Courier New", Courier, monospace;
  font-weight: bold;
  font-size: large;
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

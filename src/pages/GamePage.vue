<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useIntervalFn } from "@vueuse/core";
import { notify } from "@kyvg/vue3-notification";
import { sleep } from "../utils";
import { Chess } from "chess.js";
import { format } from "date-fns";

import {
  noGiveUp,
  hostGaveUp,
  guestGaveUp,
  noLossOnTime,
  hostLostOnTime,
  guestLostOnTime,
} from "@/constants.js";
import ChessHistory from "@/components/ChessHistory.vue";

import start from "@/assets/images/start.svg";
import stop from "@/assets/images/stop.svg";
import reverse from "@/assets/images/reverse.svg";
import user from "@/assets/images/user.svg";
import save from "@/assets/images/save.svg";

import NewGameDialog from "@/components/dialogs/NewGameDialog.vue";
import GiveUpGameDialog from "@/components/dialogs/GiveUpGameDialog.vue";

import { openDialog } from "vue3-promise-dialog";
import {
  tryUpdatingRoom,
  tryReadingRoom,
  tryDeletingFieldsInRoom,
  subscribeToSingleRoomChange,
} from "@/lib/roomHandler.js";

import { useRoomStore } from "@/stores/RoomStore.js";
import { useGameStore } from "@/stores/GameStore.js";

import { storeToRefs } from "pinia";

const { t } = useI18n();
const roomStore = useRoomStore();
const gameStore = useGameStore();

let pgnLogic = new Chess();

const roomSubscription = ref();

const boardSize = ref("100");
const board = ref();
const history = ref();
const boardReversed = ref(false);
const pauseWhiteTimer = ref();
const pauseBlackTimer = ref();
const resumeWhiteTimer = ref();
const resumeBlackTimer = ref();

const atLeastAGameStarted = ref(false);

const boardSizePx = computed(() => boardSize.value + "px");
const weAreHost = computed(() => roomStore.roomOwner === true);
const gameStarted = computed(() => roomStore.gameStarted === true);
const {
  startPosition,
  currentPosition,
  whitePlayerIsHuman,
  blackPlayerIsHuman,
  whiteNickname,
  blackNickname,
  weHaveWhite,
  withClock,
  whiteClockSide,
  timeMinutes,
  timeSeconds,
  remainingWhiteTicks,
  remainingBlackTicks,
} = storeToRefs(gameStore);

const whiteTurn = computed(() => currentPosition.value.split(" ")[1] === "w");

const unsubscribeCheckNewGameStarted = ref();

function ticksToTime(ticks) {
  const totalSeconds = Math.floor(ticks / 2);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  let minutesStr = "" + minutes;
  if (minutesStr.length < 2) {
    minutesStr = "0" + minutesStr;
  }

  let secondsStr = "" + seconds;
  if (secondsStr.length < 2) {
    secondsStr = "0" + secondsStr;
  }

  return minutesStr + ":" + secondsStr;
}

const whiteTime = computed(() => ticksToTime(remainingWhiteTicks.value));
const blackTime = computed(() => ticksToTime(remainingBlackTicks.value));

function toggleClockSide() {
  if (!gameStarted.value) return;
  if (!withClock.value) return;

  if (whiteTurn.value) {
    pauseWhiteTimer.value();
    resumeBlackTimer.value();
  } else {
    pauseBlackTimer.value();
    resumeWhiteTimer.value();
  }

  whiteClockSide.value = !whiteClockSide.value;
}

function updatePgnLogic() {
  pgnLogic = new Chess(startPosition.value);
  const historyNodes = history.value.getNodes();
  const dateString = format(new Date(), "yyyy.MM.dd");
  for (let currentNode of historyNodes) {
    try {
      pgnLogic.move(currentNode.san);
    } catch (e) {
      console.log(`Failed to play ${currentNode.san} in pgn history`);
    }
  }
  pgnLogic.header(
    "White",
    whiteNickname.value,
    "Black",
    blackNickname.value,
    "Date",
    dateString
  );
}

async function setGameOverByTime() {
  if (pauseWhiteTimer.value) pauseWhiteTimer.value();
  if (pauseBlackTimer.value) pauseBlackTimer.value();
  pauseWhiteTimer.value = undefined;
  pauseBlackTimer.value = undefined;
  resumeWhiteTimer.value = undefined;
  resumeBlackTimer.value = undefined;

  notify({ text: t("pages.game.outcomes.userLostOnTime") });

  const newValues = {
    gameStarted: false,
    lostOnTimeoutSide: weAreHost.value ? hostLostOnTime : guestLostOnTime,
  };
  const roomId = roomStore.roomId;
  const result = await tryUpdatingRoom({ roomId, newValues });
  const hasError = result.hasOwnProperty("error");
  if (hasError) {
    alert(t(result.error));
    return;
  }
  roomStore.setGameStartedStatus(false);
  board.value.stop();
  gameStore.setWhitePlayerIsHuman(false);
  gameStore.setBlackPlayerIsHuman(false);

  updatePgnLogic();
  history.value.activateNavigationMode();
}

function handleTimerTick() {
  const currentRemainingTicks = whiteClockSide.value
    ? gameStore.remainingWhiteTicks
    : gameStore.remainingBlackTicks;
  const newRemainingTicks = currentRemainingTicks - 1;
  whiteClockSide
    ? gameStore.setRemainingWhiteTicks(newRemainingTicks)
    : gameStore.setRemainingBlackTicks(newRemainingTicks);

  // we only handle game lost on time for us, letting the other peer notifying us for his game lost on time
  const weHaveNoMoreTime =
    (weHaveWhite.value && gameStore.remainingWhiteTicks <= 0) ||
    (!weHaveWhite.value && gameStore.remainingBlackTicks <= 0);

  if (weHaveNoMoreTime) setGameOverByTime();
}

function resizeBoard() {
  const minSize =
    window.innerWidth < window.innerHeight
      ? window.innerWidth
      : window.innerHeight;
  boardSize.value = `${minSize * 0.8}`;
}

function startClockIfNeeded() {
  if (!withClock.value) return;
  const startsWithWhiteSide = currentPosition.value.split(" ")[1] === "w";
  const totalTimeSeconds = timeMinutes.value * 60 + timeSeconds.value;
  gameStore.setRemainingWhiteTicks(totalTimeSeconds * 2);
  gameStore.setRemainingBlackTicks(totalTimeSeconds * 2);
  gameStore.setWhiteClockSideStatus(startsWithWhiteSide);

  const { pause: pauseWhite, resume: resumeWhite } = useIntervalFn(
    handleTimerTick,
    500,
    { immediate: false }
  );
  const { pause: pauseBlack, resume: resumeBlack } = useIntervalFn(
    handleTimerTick,
    500,
    { immediate: false }
  );

  // starts the right timer
  if (whiteTurn.value) {
    resumeWhite();
  } else {
    resumeBlack();
  }

  pauseWhiteTimer.value = pauseWhite;
  pauseBlackTimer.value = pauseBlack;
  resumeWhiteTimer.value = resumeWhite;
  resumeBlackTimer.value = resumeBlack;
}

async function startNewGame() {
  const roomId = roomStore.roomId;
  const result = await tryReadingRoom({ roomId });
  const hasError = result.hasOwnProperty("error");
  if (hasError) {
    alert(t(result.error));
    return;
  }
  const {
    startPosition,
    hostHasWhite,
    hostUser,
    guestUser,
    withClock,
    clockMinutes,
    clockSeconds,
  } = result.matchingDocument;
  const startPositionParts = startPosition.split(" ");
  const moveNumber = parseInt(startPositionParts[5]);
  const whiteTurn = startPositionParts[1] === "w";
  history.value.reset(moveNumber, whiteTurn);
  gameStore.setHistoryNodes(history.value.getNodes());

  gameStore.setStartPosition(startPosition);
  gameStore.setWithClock(withClock);
  gameStore.setTimeMinutes(clockMinutes);
  gameStore.setTimeSeconds(clockSeconds);
  board.value.newGame(startPosition);
  gameStore.setCurrentPosition(startPosition);
  const hostPlaysWithWhiteSide = [true, "true"].includes(hostHasWhite);
  const wePlayWithWhiteSide =
    (hostPlaysWithWhiteSide && weAreHost.value) ||
    (!hostPlaysWithWhiteSide && !weAreHost.value);
  gameStore.setWeHaveWhiteStatus(wePlayWithWhiteSide);
  gameStore.setWhitePlayerIsHuman(wePlayWithWhiteSide);
  gameStore.setBlackPlayerIsHuman(!wePlayWithWhiteSide);
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

  startClockIfNeeded();
}

async function openNewGameOptionsDialog() {
  const result = await openDialog(NewGameDialog, {});
  const {
    startPosition,
    withWhiteSide,
    withClock,
    clockMinutes,
    clockSeconds,
  } = result;
  if (result) {
    const newValues = {
      gameStarted: true,
      giveUpSide: noGiveUp,
      lostOnTimeoutSide: noLossOnTime,
      startPosition,
      hostHasWhite: withWhiteSide,
      withClock,
      clockMinutes,
      clockSeconds,
    };
    const roomId = roomStore.roomId;
    let result = await tryUpdatingRoom({ roomId, newValues });
    let hasError = result.hasOwnProperty("error");
    if (hasError) {
      alert(t(result.error));
      return;
    }

    const fieldsNames = [
      "lastMoveSan",
      "lastMoveFan",
      "lastMoveStartFile",
      "lastMoveStartRank",
      "lastMoveEndFile",
      "lastMoveEndRank",
    ];
    result = await tryDeletingFieldsInRoom({ roomId, fieldsNames });
    hasError = result.hasOwnProperty("error");
    if (hasError) {
      alert(t(result.error));
      return;
    }

    roomStore.setGameStartedStatus(true);
    gameStore.setStartPosition(startPosition);
    gameStore.setWithClock(withClock);
    gameStore.setTimeMinutes(clockMinutes);
    gameStore.setTimeSeconds(clockSeconds);
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
    if (pauseWhiteTimer.value) pauseWhiteTimer.value();
    if (pauseBlackTimer.value) pauseBlackTimer.value();
    pauseWhiteTimer.value = undefined;
    pauseBlackTimer.value = undefined;
    resumeWhiteTimer.value = undefined;
    resumeBlackTimer.value = undefined;

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
    board.value.stop();
    gameStore.setWhitePlayerIsHuman(false);
    gameStore.setBlackPlayerIsHuman(false);

    updatePgnLogic();
    history.value.activateNavigationMode();
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

function handleEventInDb(roomDocument) {
  const documentData = roomDocument.data();
  const localDocumentId = roomDocument.id;
  const gameHasStarted = ["true", true].includes(documentData.gameStarted);
  const roomId = roomStore.roomId;

  const isMatchingDocument = roomId == localDocumentId;
  const weAreGuest = !weAreHost.value;
  if (isMatchingDocument) {
    if (gameHasStarted) {
      const gameStartHandlerAlreadyProcessed = roomStore.gameStarted;
      if (weAreGuest && !gameStartHandlerAlreadyProcessed) {
        const boardShouldBeReversed =
          (documentData.hostHasWhite && !documentData.roomOwner) ||
          (!documentData.hostHasWhite && documentData.roomOwner);
        roomStore.setGameStartedStatus(true);
        gameStore.setBoardReversedStatus(boardShouldBeReversed);
        boardReversed.value = boardShouldBeReversed;
        startNewGame();
      }

      // try to play lastMoveSan
      const success = board.value.playManualMove(
        moveCoordinatesToLongUciNotation({
          startFile: documentData.lastMoveStartFile,
          startRank: documentData.lastMoveStartRank,
          endFile: documentData.lastMoveEndFile,
          endRank: documentData.lastMoveEndRank,
          promotion: documentData.lastMovePromotion,
        })
      );
      if (!success) {
        /*
        console.log(`Illegal move ${documentData.lastMoveSan}`);
        console.log(`Board position is ${board.value.getCurrentPosition()}`);
        */
        return;
      }
      if (withClock.value) {
        toggleClockSide();
      }
      gameStore.setLastMoveArrow({
        start: {
          file: documentData.lastMoveStartFile,
          rank: documentData.lastMoveStartRank,
        },
        end: {
          file: documentData.lastMoveEndFile,
          rank: documentData.lastMoveEndRank,
        },
      });
      const resultingPosition = board.value.getCurrentPosition();
      currentPosition.value = resultingPosition;
    }
    // !gameHasStarted
    else {
      const giveUpSide = documentData.giveUpSide;
      const lostOnTimeoutSide = documentData.lostOnTimeoutSide;
      const otherPeerInitiatedGiveUp = weAreHost.value
        ? giveUpSide === guestGaveUp
        : giveUpSide === hostGaveUp;
      const otherPeerLostOnTime = weAreHost.value
        ? lostOnTimeoutSide === guestLostOnTime
        : lostOnTimeoutSide === hostLostOnTime;
      if (otherPeerInitiatedGiveUp) {
        if (pauseWhiteTimer.value) pauseWhiteTimer.value();
        if (pauseBlackTimer.value) pauseBlackTimer.value();
        pauseWhiteTimer.value = undefined;
        pauseBlackTimer.value = undefined;
        resumeWhiteTimer.value = undefined;
        resumeBlackTimer.value = undefined;

        roomStore.setGameStartedStatus(false);
        gameStore.setWhitePlayerIsHuman(false);
        gameStore.setBlackPlayerIsHuman(false);
        updatePgnLogic();
        history.value.activateNavigationMode();
        notify({
          text: t("pages.game.outcomes.gaveUp"),
        });
      } else if (otherPeerLostOnTime) {
        if (pauseWhiteTimer.value) pauseWhiteTimer.value();
        if (pauseBlackTimer.value) pauseBlackTimer.value();
        pauseWhiteTimer.value = undefined;
        pauseBlackTimer.value = undefined;
        resumeWhiteTimer.value = undefined;
        resumeBlackTimer.value = undefined;

        roomStore.setGameStartedStatus(false);
        gameStore.setWhitePlayerIsHuman(false);
        gameStore.setBlackPlayerIsHuman(false);
        updatePgnLogic();
        history.value.activateNavigationMode();
        notify({
          text: t("pages.game.outcomes.opponentLostOnTime"),
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
  if (withClock.value) {
    toggleClockSide();
  }
  history.value.addNodeOrCompleteFirst({
    number: moveNumber,
    whiteTurn,
    san: moveSan,
    fan: moveFan,
    fen: resultingPosition,
    fromFileIndex: move.start.file,
    fromRankIndex: move.start.rank,
    toFileIndex: move.end.file,
    toRankIndex: move.end.rank,
  });

  // Wait for the history component to update
  await sleep(10);

  history.value.scrollToLastElement();
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

async function handleCheckmate() {
  if (!gameStarted.value) return;

  if (pauseWhiteTimer.value) pauseWhiteTimer.value();
  if (pauseBlackTimer.value) pauseBlackTimer.value();
  pauseWhiteTimer.value = undefined;
  pauseBlackTimer.value = undefined;
  resumeWhiteTimer.value = undefined;
  resumeBlackTimer.value = undefined;

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

  updatePgnLogic();
  history.value.activateNavigationMode();

  roomStore.setGameStartedStatus(false);
  const message = t("pages.game.outcomes.checkmate");
  notify({
    text: message,
  });
}

async function handleStalemate() {
  if (!gameStarted.value) return;

  if (pauseWhiteTimer.value) pauseWhiteTimer.value();
  if (pauseBlackTimer.value) pauseBlackTimer.value();
  pauseWhiteTimer.value = undefined;
  pauseBlackTimer.value = undefined;
  resumeWhiteTimer.value = undefined;
  resumeBlackTimer.value = undefined;

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

  updatePgnLogic();
  history.value.activateNavigationMode();

  roomStore.setGameStartedStatus(false);
  const message = t("pages.game.outcomes.stalemate");
  notify({
    text: message,
  });
}

async function handlePerpetualDraw() {
  if (!gameStarted.value) return;

  if (pauseWhiteTimer.value) pauseWhiteTimer.value();
  if (pauseBlackTimer.value) pauseBlackTimer.value();
  pauseWhiteTimer.value = undefined;
  pauseBlackTimer.value = undefined;
  resumeWhiteTimer.value = undefined;
  resumeBlackTimer.value = undefined;

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

  updatePgnLogic();
  history.value.activateNavigationMode();

  roomStore.setGameStartedStatus(false);
  const message = t("pages.game.outcomes.perpetualDraw");
  notify({
    text: message,
  });
}

async function handleMissingMaterial() {
  if (!gameStarted.value) return;

  if (pauseWhiteTimer.value) pauseWhiteTimer.value();
  if (pauseBlackTimer.value) pauseBlackTimer.value();
  pauseWhiteTimer.value = undefined;
  pauseBlackTimer.value = undefined;
  resumeWhiteTimer.value = undefined;
  resumeBlackTimer.value = undefined;

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

  updatePgnLogic();
  history.value.activateNavigationMode();

  roomStore.setGameStartedStatus(false);
  const message = t("pages.game.outcomes.missingMaterial");
  notify({
    text: message,
  });
}

async function handleFiftyMovesDraw() {
  if (!gameStarted.value) return;

  if (pauseWhiteTimer.value) pauseWhiteTimer.value();
  if (pauseBlackTimer.value) pauseBlackTimer.value();
  pauseWhiteTimer.value = undefined;
  pauseBlackTimer.value = undefined;
  resumeWhiteTimer.value = undefined;
  resumeBlackTimer.value = undefined;

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

  updatePgnLogic();
  history.value.activateNavigationMode();

  roomStore.setGameStartedStatus(false);
  const message = t("pages.game.outcomes.fiftyMovesDraw");
  notify({
    text: message,
  });
}

async function purposeSavePgn() {
  const accepted = confirm(t("pages.pgn.confirmationMessage"));
  if (accepted) {
    const content = pgnLogic.pgn({ newline: "\n", maxWidth: 80 });
    const link = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    link.href = URL.createObjectURL(file);
    link.download = "game.pgn";
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

function handleRequestStartPosition() {
  if (!gameStarted.value) {
    const success = board.value.setPositionAndLastMove(startPosition.value, {
      start: {
        file: -100,
        rank: -100,
      },
      end: {
        file: -100,
        rank: -100,
      },
    });
    if (success) {
      history.value.setSelectedNode(-1);
    }
  }
}

function handleRequestPosition({
  nodeIndex,
  fen,
  fromFileIndex,
  fromRankIndex,
  toFileIndex,
  toRankIndex,
}) {
  if (!gameStarted.value) {
    const success = board.value.setPositionAndLastMove(fen, {
      start: {
        file: fromFileIndex,
        rank: fromRankIndex,
      },
      end: {
        file: toFileIndex,
        rank: toRankIndex,
      },
    });
    if (success) {
      history.value.setSelectedNode(nodeIndex);
    }
  }
}

function handleRoomChanged(roomDocument) {
  handleEventInDb(roomDocument);
}

onMounted(async () => {
  const roomId = roomStore.roomId;
  if (roomId) {
    roomSubscription.value = await subscribeToSingleRoomChange(
      roomId,
      handleRoomChanged
    );
  }
});
onBeforeUnmount(() => {
  if (pauseWhiteTimer.value) pauseWhiteTimer.value();
  if (pauseBlackTimer.value) pauseBlackTimer.value();
  pauseWhiteTimer.value = undefined;
  pauseBlackTimer.value = undefined;
  resumeWhiteTimer.value = undefined;
  resumeBlackTimer.value = undefined;
  if (roomSubscription.value) {
    roomSubscription.value();
  }
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
  if (!gameStarted.value) {
    board.value.stop();
  }
  atLeastAGameStarted.value = roomStore.atLeastAGameStarted;
  boardReversed.value = gameStore.boardReversed;

  history.value.setNodes(gameStore.historyNodes);
  board.value.setLastMoveArrow(gameStore.lastMoveArrow);

  if (!gameStarted.value) {
    updatePgnLogic();
    history.value.activateNavigationMode();
  }

  const ourTurn =
    (whiteTurn.value && weHaveWhite.value) ||
    (!whiteTurn.value && !weHaveWhite.value);
  const ourRemainingTicks = weHaveWhite.value
    ? gameStore.remainingWhiteTicks
    : gameStore.remainingBlackTicks;

  if (gameStarted.value && withClock.value) {
    if (ourTurn) {
      if (ourRemainingTicks > 0) {
        // A compensation
        const newTicksValue = ourRemainingTicks - 2;
        weHaveWhite.value
          ? gameStore.setRemainingWhiteTicks(newTicksValue)
          : gameStore.setRemainingBlackTicks(newTicksValue);
        if (newTicksValue <= 0) {
          setGameOverByTime();
        } else {
          const { pause: pauseWhite, resume: resumeWhite } = useIntervalFn(
            handleTimerTick,
            500,
            { immediate: false }
          );
          const { pause: pauseBlack, resume: resumeBlack } = useIntervalFn(
            handleTimerTick,
            500,
            { immediate: false }
          );

          // starts the right timer
          if (whiteTurn.value) {
            resumeWhite();
          } else {
            resumeBlack();
          }

          pauseWhiteTimer.value = pauseWhite;
          pauseBlackTimer.value = pauseBlack;
          resumeWhiteTimer.value = resumeWhite;
          resumeBlackTimer.value = resumeBlack;
        }
      } else {
        setGameOverByTime();
      }
    }
    // we update the peer clock : we don't need compensation, as we'll be notified anyway if he lost on time
    else {
      const { pause: pauseWhite, resume: resumeWhite } = useIntervalFn(
        handleTimerTick,
        500,
        { immediate: false }
      );
      const { pause: pauseBlack, resume: resumeBlack } = useIntervalFn(
        handleTimerTick,
        500,
        { immediate: false }
      );

      // starts the right timer
      if (whiteTurn.value) {
        resumeWhite();
      } else {
        resumeBlack();
      }

      pauseWhiteTimer.value = pauseWhite;
      pauseBlackTimer.value = pauseBlack;
      resumeWhiteTimer.value = resumeWhite;
      resumeBlackTimer.value = resumeBlack;
    }
  }
});
</script>

<template>
  <div id="pageRoot">
    <div id="gameZone">
      <ChessHistory
        ref="history"
        @requestStartPosition="handleRequestStartPosition"
        @requestNodeSelected="handleRequestPosition"
      />
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
      <!--clock -->
      <div class="clock" v-if="withClock">
        <div class="side white">
          {{ whiteTime }}
        </div>
        <div class="side black">
          {{ blackTime }}
        </div>
      </div>
      <!--clock -->
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
        <button
          v-if="atLeastAGameStarted && !gameStarted"
          @click="purposeSavePgn"
        >
          <img :src="save" />
        </button>
      </div>
      <!-- buttons -->
      <!-- nicknames -->
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
      <!-- nicknames -->
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
  width: v-bind(boardSizePx);
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

.clock {
  display: flex;
  flex-direction: row;
  border: 1px solid black;
}

.clock > .side {
  padding: 5px;
  border: 1px solid black;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-family: "Courier New", Courier, monospace;
  font-size: xx-large;
}

.clock > .side.white {
  color: black;
  background-color: white;
}

.clock > .side.black {
  color: white;
  background-color: black;
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

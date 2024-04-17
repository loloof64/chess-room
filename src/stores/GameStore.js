import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";
import { emptyPosition } from "@/constants";

export const useGameStore = defineStore("GameStore", {
  state: () => {
    return {
      startPosition: useSessionStorage(
        "GameStore$startPosition",
        emptyPosition
      ),
      currentPosition: useSessionStorage(
        "GameStore$currentPosition",
        emptyPosition
      ),
      whitePlayerIsHuman: useSessionStorage(
        "GameStore$whitePlayerIsHuman",
        false
      ),
      blackPlayerIsHuman: useSessionStorage(
        "GameStore$blackPlayerIsHuman",
        false
      ),
      weHaveWhite: useSessionStorage("GameStore$weHaveWhite", undefined),
      whiteNickname: useSessionStorage("GameStore$whiteNickname", ""),
      blackNickname: useSessionStorage("GameStore$blackNickname", ""),
      boardReversed: useSessionStorage("GameStore$boardReversed", false),
      historyNodes: useSessionStorage("GameStore$historyNodes", []),
      lastMoveArrow: useSessionStorage("GameStore$lastMoveArrow", {
        start: {
          file: -Infinity,
          rank: -Infinity,
        },
        end: {
          file: -Infinity,
          rank: -Infinity,
        },
      }),
      withClock: useSessionStorage("GameStore$withClock", false),
      timeMinutes: useSessionStorage("GameStore$timeMinutes", 5),
      timeSeconds: useSessionStorage("GameStore$timeSeconds", 0),
      remainingWhiteTicks: useSessionStorage("GameStore$remainingWhiteTicks", 999),
      remainingBlackTicks: useSessionStorage("GameStore$remainingBlackTicks", 999),
      whiteClockSide: useSessionStorage("GameStore$whiteClockSide", true),
    };
  },
  actions: {
    setCurrentPosition(newFen) {
      this.currentPosition = newFen;
    },
    setWhitePlayerIsHuman(newStatus) {
      this.whitePlayerIsHuman = newStatus;
    },
    setBlackPlayerIsHuman(newStatus) {
      this.blackPlayerIsHuman = newStatus;
    },
    setWeHaveWhiteStatus(newStatus) {
      this.weHaveWhite = newStatus;
    },
    setWhiteNickname(newName) {
      this.whiteNickname = newName;
    },
    setBlackNickname(newName) {
      this.blackNickname = newName;
    },
    setBoardReversedStatus(newStatus) {
      this.boardReversed = newStatus;
    },
    setHistoryNodes(newArray) {
      // Clones the given array instead of getting references 
      this.historyNodes = newArray.map(e => e);
    },
    addHistoryNode(nodeToAdd) {
      this.historyNodes.push(nodeToAdd);
    },
    setLastMoveArrow(moveCoordinates) {
      this.lastMoveArrow = moveCoordinates;
    },
    setStartPosition(newPosition) {
      this.startPosition = newPosition;
    },
    setWithClock(newValue) {
      this.withClock = newValue;
    },
    setTimeMinutes(newValue) {
      this.timeMinutes = newValue;
    },
    setTimeSeconds(newValue) {
      this.timeSeconds = newValue;
    },
    setRemainingWhiteTicks(newValue) {
      this.remainingWhiteTicks = newValue;
    },
    setRemainingBlackTicks(newValue) {
      this.remainingBlackTicks = newValue;
    },
    setWhiteClockSideStatus(newValue) {
      this.whiteClockSide = newValue;
    }
  },
  persist: sessionStorage,
});

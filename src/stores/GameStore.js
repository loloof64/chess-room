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
      weHaveWhite: useSessionStorage("GameStore$weHaveWhite", true),
      whiteNickname: useSessionStorage("GameStore$whiteNickname", ""),
      blackNickname: useSessionStorage("GameStore$blackNickname", ""),
      boardReversed: useSessionStorage("GameStore$boardReversed", false),
      historyNodes: useSessionStorage("GameStore$historyNodes", []),
      lastMoveArrow: useSessionStorage("GameStore$lastMoveArrow", {
        start: {
          file: -100,
          rank: -100,
        },
        end: {
          file: -100,
          rank: -100,
        },
      }),
      withClock: useSessionStorage("GameStore$withClock", false),
      turnStartDate: useSessionStorage(
        "GameStore$turnStartDate",
        new Date().toISOString()
      ),
      remainingWhiteSecondsSinceLastMove: useSessionStorage(
        "GameStore$remainingWhiteSecondsSinceLastMove",
        0
      ),
      remainingBlackSecondsSinceLastMove: useSessionStorage(
        "GameStore$remainingBlackSecondsSinceLastMove",
        0
      ),
      remainingWhiteSeconds: useSessionStorage(
        "GameStore$remainingWhiteSeconds",
        0
      ),
      remainingBlackSeconds: useSessionStorage(
        "GameStore$remainingBlackSeconds",
        0
      ),
      increment: useSessionStorage("GameStore$increment", 0),
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
      this.historyNodes = newArray.map((e) => e);
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
    setTurnStartDate(newValue) {
      this.turnStartDate = newValue;
    },
    setRemainingWhiteSecondsSinceLastMove(newValue) {
      this.remainingWhiteSecondsSinceLastMove = newValue;
    },
    setRemainingBlackSecondsSinceLastMove(newValue) {
      this.remainingBlackSecondsSinceLastMove = newValue;
    },
    setRemainingWhiteSeconds(newValue) {
      this.remainingWhiteSeconds = newValue;
    },
    setRemainingBlackSeconds(newValue) {
      this.remainingBlackSeconds = newValue;
    },
    setIncrement(newValue) {
      this.increment = newValue;
    }
  },
  persist: sessionStorage,
});

import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";
import { emptyPosition } from "@/constants";

export const useGameStore = defineStore("GameStore", {
  state: () => {
    return {
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
    }
  },
  persist: sessionStorage,
});

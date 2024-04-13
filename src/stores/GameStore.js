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
      whiteNickname: useSessionStorage(
        "GameStore$whiteNickname",
        ""
      ),
      blackNickname: useSessionStorage(
        "GameStore$blackNickname",
        ""
      ),
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
    }
  },
  persist: sessionStorage,
});

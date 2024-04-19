import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";
import { DEFAULT_POSITION } from "chess.js";

export const useNewGameStore = defineStore("NewGameStore", {
  state: () => {
    return {
      startPosition: useSessionStorage(
        "NewGameStore$startPosition",
        DEFAULT_POSITION
      ),
      useClock: useSessionStorage("NewGameStore$useClock", false),
      startTimeMinutes: useSessionStorage("NewGameStore$startTimeMinutes", 5),
      startTimeSeconds: useSessionStorage("NewGameStore$startTimeSeconds", 0),
      increment: useSessionStorage("NewGameStore$increment", 0),
    };
  },
  actions: {
    setStartPosition(newValue) {
      this.startPosition = newValue;
    },
    setUseClockStatus(newValue) {
      this.useClock = newValue;
    },
    setStartTimeMinutes(newValue) {
      this.startTimeMinutes = newValue;
    },
    setStartTimeSeconds(newValue) {
      this.startTimeSeconds = newValue;
    },
    setIncrement(newValue) {
      this.increment = newValue;
    },
  },
  persist: sessionStorage,
});

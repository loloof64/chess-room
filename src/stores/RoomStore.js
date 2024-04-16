import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";

export const useRoomStore = defineStore("RoomStore", {
  state: () => {
    return {
      roomId: useSessionStorage("RoomStore$roomId", ""),
      roomOwner: useSessionStorage("RoomStore$roomOwner", false),
      gameStarted: useSessionStorage("RoomStore$gameStarted", false),
      atLeastAGameStarted: useSessionStorage(
        "RoomStore$atLeastAGameStarted",
        false
      ),
    };
  },
  actions: {
    setRoomId(newId) {
      if (!this.roomId) {
        this.roomId = newId;
      }
    },
    setRoomOwner(weAreOwner) {
      if (!this.roomOwner) {
        this.roomOwner = weAreOwner;
      }
    },
    setGameStartedStatus(newStatus) {
      this.gameStarted = newStatus;
    },
    setAtLeastAGameStartedStatus(newStatus) {
      this.atLeastAGameStarted = newStatus;
    },
  },
  persist: sessionStorage,
});

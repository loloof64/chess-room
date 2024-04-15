import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";
import { emptyPosition } from "@/constants";

export const useRoomStore = defineStore("RoomStore", {
  state: () => {
    return {
      docId: useSessionStorage("RoomStore$docId", ""),
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
    setDocId(newId) {
      if (!this.docId) {
        this.docId = newId;
      }
    },
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

import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";
import { emptyPosition } from "@/constants";

export const useRoomStore = defineStore("RoomStore", {
  state: () => {
    return {
      docId: useSessionStorage("RoomStore$docId", undefined),
      roomId: useSessionStorage("RoomStore$roomId", undefined),
      roomOwner: useSessionStorage("RoomStore$roomOwner", undefined),
      gameStarted: useSessionStorage("RoomStore$gameStarted", false),
      startPosition: useSessionStorage(
        "RoomStore$startPosition",
        emptyPosition
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
    setStartPosition(newPosition) {
      this.startPosition = newPosition;
    },
  },
  persist: sessionStorage,
});

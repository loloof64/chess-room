import { defineStore } from 'pinia'

export const useRoomStore = defineStore('RoomStore', {
    state: () => {
        return {
            roomId: undefined,
            roomOwner: undefined,
        }
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
        }
    }
});
import { defineStore } from 'pinia'
import { useSessionStorage } from '@vueuse/core'

export const useRoomStore = defineStore('RoomStore', {
    state: () => {
        return {
            roomId: useSessionStorage('RoomStore$roomId', undefined),
            roomOwner: useSessionStorage('RoomStore$roomOwner', undefined),
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
    },
    persist: sessionStorage,
});
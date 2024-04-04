import { defineStore } from 'pinia'
import { useSessionStorage } from '@vueuse/core'

export const useRoomStore = defineStore('RoomStore', {
    state: () => {
        return {
            docId: useSessionStorage('RoomStore$docId', undefined),
            roomId: useSessionStorage('RoomStore$roomId', undefined),
            roomOwner: useSessionStorage('RoomStore$roomOwner', undefined),
        }
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
        }
    },
    persist: sessionStorage,
});
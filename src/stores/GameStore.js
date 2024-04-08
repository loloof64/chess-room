import { defineStore } from 'pinia'
import { useSessionStorage } from '@vueuse/core'
import { emptyPosition } from '@/constants'

export const useGameStore = defineStore('GameStore', {
    state: () => {
        return {
            currentPosition: useSessionStorage('GameStore$currentPosition', emptyPosition),
            whitePlayerIsHuman: useSessionStorage('GameStore$whitePlayerHuman', false),
            blackPlayerIsHuman: useSessionStorage('GameStore$blackPlayerHuman', false),
        }
    },
    actions: {
        setCurrentPosition(newFen) {
            this.currentPosition = newFen;
        },
        setWhitePlayerHuman(newStatus) {
            this.whitePlayerIsHuman = newStatus;
        },
        setBlackPlayerHuman(newStatus) {
            this.blackPlayerIsHuman = newStatus;
        }
    },
    persist: sessionStorage,
});
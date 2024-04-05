<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router'
import History from '@/components/History.vue';

import start from '@/assets/images/start.svg'
import stop from '@/assets/images/stop.svg'

import NewGameDialog from '@/components/NewGameDialog.vue';
import GiveUpGameDialog from '@/components/GiveUpGameDialog.vue';

import { openDialog } from 'vue3-promise-dialog';
import { tryUpdatingRoom } from '@/lib/roomHandler.js';

import { useRoomStore } from '@/stores/RoomStore.js';
const roomStore = useRoomStore();

const boardSize = ref('300');
const board = ref();
const history = ref();
const router = useRouter();

const weAreHost = computed(() => ["true", true].includes(roomStore.roomOwner));
const gameStarted = computed(() => ["true", true].includes(roomStore.gameStarted));

import { client, databaseId, collectionId } from '@/lib/appwrite.js'
const unsubscribeCheckNewGameStarted = ref();

const resizeBoard = () => {
    const minSize = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
    boardSize.value = minSize * 0.82;
};

async function openNewGameOptionsDialog() {
    const result = await openDialog(NewGameDialog, {});
    if (result) {
        ///////////////////////////
        console.log("Starting new game as host.")
        ///////////////////////////
        const newValues = {
            gameStarted: true,
        };
        const roomId = roomStore.roomId;
        const result = await tryUpdatingRoom({ roomId, newValues });
        const hasError = result.hasOwnProperty('error');
        if (hasError) {
            alert(t(result.error));
            return;
        }
        roomStore.setGameStartedStatus(true);
        startNewGame();
    }
}

async function openGiveUpGameDialog() {
    const result = await openDialog(GiveUpGameDialog, {});
    if (result) {
        //////////////////////////
        console.log("Giving up game");
        //////////////////////////
        const newValues = {
            gameStarted: false,
        };
        const roomId = roomStore.roomId;
        const result = await tryUpdatingRoom({ roomId, newValues });
        const hasError = result.hasOwnProperty('error');
        if (hasError) {
            alert(t(result.error));
            return;
        }
        roomStore.setGameStartedStatus(false);
    }
}

function startNewGame() {
    console.log("starting new game");
}

function handleEventInDb(response) {
    const payload = response.payload;
    const localDatabaseId = payload.$databaseId;
    const localCollectionId = payload.$collectionId;
    const localDocumentId = payload.id;
    const gameHasStarted = ["true", true].includes(payload.gameStarted);
    const roomId = roomStore.roomId;

    const isMatchingDocument = (databaseId == localDatabaseId) && (collectionId == localCollectionId) && (roomId == localDocumentId);
    const weAreGuest = !weAreHost.value;

    
    /////////////////////
    console.log("handling db event")
    console.log("db payload", payload);
    console.log("weAreHost", weAreHost.value);
    /////////////////////

    if (isMatchingDocument && gameHasStarted) {
        const gameStartHandlerAlreadyProcessed = roomStore.gameStarted;
        if (weAreGuest && !gameStartHandlerAlreadyProcessed) {
            ///////////////////////////
            console.log("Starting new game as guest.")
            ///////////////////////////
            roomStore.setGameStartedStatus(true);
            startNewGame();
        }
        else if (!gameHasStarted) {
            console.log("Other peer has gave up game.");
        }
    }
}

onMounted(() => {
    const roomId = roomStore.roomId;
    if (roomId) {
        /////////////////////////////
        console.log('registering db channel')
        /////////////////////////////
        const realDbChannel = `databases.${databaseId}.collections.${collectionId}.documents.${roomId}"`
        unsubscribeCheckNewGameStarted.value = client.subscribe([realDbChannel, "documents"], handleEventInDb);
    }
});

onBeforeUnmount(() => {
    if (unsubscribeCheckNewGameStarted.value) {
        /////////////////////////////
        console.log('clearing db channel')
        /////////////////////////////
        unsubscribeCheckNewGameStarted.value();
    }
});

onMounted(() => {
    window.addEventListener("resize", resizeBoard);
    resizeBoard();
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeBoard);
});
</script>

<template>
    <div id="root">
        <div id="gameZone">
            <history ref="history" />
            <loloof64-chessboard ref="board" :size="boardSize" />
        </div>
        <div id="miscZone">
            <div id="buttons">
                <button v-if="weAreHost && !gameStarted" @click="openNewGameOptionsDialog">
                    <img :src="start" />
                </button>
                <button v-if="gameStarted" @click="openGiveUpGameDialog">
                    <img :src="stop" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
#root {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

#gameZone {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
}

#miscZone {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
}

#buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

#buttons>button {
    border: 1px solid blue;
    margin: 0px 8px;
}

#buttons>button>img {
    width: 40px;
    height: 40px;
}

@media (max-width: 1000px) {
    #root {
        flex-direction: column;
    }

    #buttons>button {
        padding: 2px;
    }

    #buttons>button>img {
        width: 6vw;
        height: 6vw;
    }
}
</style>
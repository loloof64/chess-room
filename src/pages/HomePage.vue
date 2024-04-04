<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { notify } from "@kyvg/vue3-notification";
const { t } = useI18n();
const router = useRouter();

import copySvg from '@/assets/copy.svg';

import { useRoomStore } from '@/stores/RoomStore.js';
const roomStore = useRoomStore();


function goToCreateRoomPage() {
    router.push({ path: '/create-room', replace: true });
}

function goToJoinRoomPage() {
    router.push({ path: '/join-room', replace: true });
}

async function copyIdToClipboard() {
    await navigator.clipboard.writeText(roomStore.roomId);
    notify({
        text: t('pages.home.roomIdCopied'),
    });
}

import {client, databaseId, collectionId} from '@/lib/appwrite.js'
const unsubscribeCheckOpponentFound = ref();

function checkForOpponentFoundAndGoToGamePageIfReady(response) {
    const payload = response.payload;
    const localDatabaseId = payload.$databaseId;
    const localCollectionId = payload.$collectionId;
    const localDocumentId = payload.$id;
    const guestUser = payload.guestUser;
    const roomId = roomStore.roomId;

    const isMatchingDocument = (databaseId == localDatabaseId) && (collectionId == localCollectionId) && (roomId == localDocumentId);
    const hasGuestUser = guestUser !== undefined;

    if (isMatchingDocument && hasGuestUser) {
        router.push({ path: '/game', replace: true });
    }

}

onMounted(() => {
    const roomId = roomStore.roomId;
    const weAreOnwer = roomStore.roomOwner;
    if (roomId && weAreOnwer) {
        const realDbChannel = `databases.${databaseId}.collections.${collectionId}.documents.${roomId}"`
        unsubscribeCheckOpponentFound.value = client.subscribe([realDbChannel, "documents"], checkForOpponentFoundAndGoToGamePageIfReady);
    }
});

onBeforeUnmount(() => {
    if (unsubscribeCheckOpponentFound.value) {
        unsubscribeCheckOpponentFound.value();
    }
});
</script>

<template>
    <div id="root">
        <h2>{{ t('pages.home.title') }}</h2>
        <div v-if="roomStore.roomId && roomStore.roomOwner">
            {{ t('pages.home.yourRoom') }} :
            #{{ roomStore.roomId }}
            <button @click="copyIdToClipboard"><img :src="copySvg" width="20" height="20" /></button>
        </div>
        <button v-if="!roomStore.roomId" @click="goToCreateRoomPage">
            {{ t('pages.home.createRoom') }}
        </button>
        <button v-if="!roomStore.roomId" @click="goToJoinRoomPage">
            {{ t('pages.home.joinRoom') }}
        </button>
    </div>
</template>

<style scoped>
#root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
}

button {
    border: 1px solid blue;
    border-radius: 10px;
}
</style>
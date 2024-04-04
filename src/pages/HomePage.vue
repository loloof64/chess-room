<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { notify } from "@kyvg/vue3-notification";
const { t } = useI18n();
const router = useRouter();

import copySvg from '@/assets/copy.svg';

import { useRoomStore } from '@/stores/RoomStore.js';
const { roomId, roomOwner } = storeToRefs(useRoomStore());


function goToCreateRoomPage() {
    router.push({ path: '/create-room', replace: true });
}

function goToJoinRoomPage() {
    router.push({ path: '/join-room', replace: true });
}

async function copyIdToClipboard() {
    await navigator.clipboard.writeText(roomId.value);
    notify({
        text: t('pages.home.roomIdCopied'),
    });
}
</script>

<template>
    <div id="root">
        <h2>{{ t('pages.home.title') }}</h2>
        <div v-if="roomId && roomOwner">
            {{ t('pages.home.yourRoom') }} :
            #{{ roomId }}
            <button @click="copyIdToClipboard"><img :src="copySvg" width="20" height="20" /></button>
        </div>
        <button v-if="!roomId" @click="goToCreateRoomPage">
            {{ t('pages.home.createRoom') }}
        </button>
        <button v-if="!roomId" @click="goToJoinRoomPage">
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
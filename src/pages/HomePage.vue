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

function copyIdToClipboard() {
    navigator.clipboard.writeText(roomId.value);
    notify({
        text: t('pages.home.roomIdCopied'),
    });
}
</script>

<template>
    <div id="root">
        <div v-if="roomId && roomOwner">
            {{ t('pages.home.yourRoom') }} :
            #{{ roomId }}
            <button @click="copyIdToClipboard"><img :src="copySvg" width="20" height="20" /></button>
        </div>
        <button v-if="!roomOwner" @click="goToCreateRoomPage">
            {{ t('pages.home.createRoom') }}
        </button>
    </div>
</template>

<style scoped>
#root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>
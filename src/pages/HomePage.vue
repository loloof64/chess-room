<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const router = useRouter();


const goToCreateRoomPage = () => {
    router.push('/create-room');
}
</script>

<template>
    <div id="root">
        <button @click="goToCreateRoomPage">
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
<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const router = useRouter();


const goToGamePage = () => {
    router.push('/game');
}
</script>

<template>
    <div id="root">
        <button @click="goToGamePage">
            {{ t('pages.home.goToGamePage') }}
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
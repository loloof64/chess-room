<script setup>
import { useRoute, useRouter } from 'vue-router'
const router = useRouter();
const route = useRoute();

const goToGamePage = () => {
    router.push('/game');
}
</script>

<template>
    <div id="root">
        <button @click="goToGamePage">
            Go to game page
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
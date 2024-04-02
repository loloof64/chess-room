<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
let boardSize = ref('300');

let resizeBoard = () => {
    const minSize = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
    boardSize.value = minSize * 0.99;
};

onMounted(() => {
    window.addEventListener("resize", resizeBoard);
    resizeBoard();
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeBoard);
});
</script>

<template>
    <loloof64-chessboard ref="board" :size="boardSize" />
</template>

<style scoped></style>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import History from '@/components/History.vue';
let boardSize = ref('300');

const board = ref();
const history = ref();

let resizeBoard = () => {
    const minSize = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
    boardSize.value = minSize * 0.82;
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
    <div id="root">
        <div id="gameZone">
            <history ref="history" />
            <loloof64-chessboard ref="board" :size="boardSize" />
        </div>
    </div>
</template>

<style scoped>
#root {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#gameZone {
 display: flex;
 flex-direction: column;
 justify-content: start;
 align-items: center;
}
</style>
<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { DEFAULT_POSITION } from "chess.js";

import { closeDialog } from "vue3-promise-dialog";

const currentPosition = ref(DEFAULT_POSITION);
const previewBoard = ref();
const previewSize = ref("100");
const withWhiteSide = ref(true);

function startNewGame() {
  const newGameData = {
    startPosition: currentPosition.value,
    withWhiteSide: withWhiteSide.value,
  };
  closeDialog(newGameData);
}

function cancel() {
  closeDialog();
}

function handleGameTurnChange(e) {
  const newValue = e.target.value;
  withWhiteSide.value = newValue === "yes";
}

onMounted(() => {
  const minSize =
    window.innerWidth < window.innerHeight
      ? window.innerWidth
      : window.innerHeight;
  previewSize.value = `${minSize * 0.75}`;
  previewBoard.value.newGame(currentPosition.value);
});

defineExpose({
  returnValue: () => {
    return;
  },
});
</script>

<template>
  <div class="dialog">
    <div class="center">
      <header>
        <h2>{{ t("pages.newGame.title") }}</h2>
      </header>
      <section>
        <ChessboardVue
          id="previewBoard"
          ref="previewBoard"
          :size="previewSize"
          :whitePlayerHuman="false"
          :blackPlayerHuman="false"
        />
        <div class="field">
          {{ t("pages.newGame.hasWhite") }}
          <input
            type="radio"
            name="hasWhite"
            value="yes"
            checked
            @change="handleGameTurnChange"
          />
          <label for="yes">{{ t("pages.newGame.hasWhiteYes") }}</label>

          <input
            type="radio"
            name="hasWhite"
            value="no"
            @change="handleGameTurnChange"
          />
          <label for="yes">{{ t("pages.newGame.hasWhiteNo") }}</label>
        </div>
        <div id="button">
          <button class="ok" @click="startNewGame">
            {{ t("pages.newGame.submit") }}
          </button>
          <button class="cancel" @click="cancel">
            {{ t("pages.newGame.cancel") }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dialog {
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
}

.center {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
}

section {
  padding: 20px;
  border: 1px solid navy;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}

button {
  border: 1px solid black;
  margin: 5px 5px;
}

#buttons {
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
}

button.ok {
  color: white;
  background-color: green;
}

button.cancel {
  color: white;
  background-color: red;
}

button:has(> img) {
  margin: 0px 20px;
}
</style>

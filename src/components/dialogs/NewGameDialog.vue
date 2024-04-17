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
const includeTime = ref(true);
const timeMinutes = ref(5);
const timeSeconds = ref(0);

function startNewGame() {
  const newGameData = {
    startPosition: currentPosition.value,
    withWhiteSide: withWhiteSide.value,
    withClock: includeTime.value,
    clockMinutes: timeMinutes.value,
    clockSeconds: timeSeconds.value,
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

function handleIncludeTimeChange(e) {
  const newValue = e.target.value;
  includeTime.value = newValue === "yes";
}

onMounted(() => {
  const minSize =
    window.innerWidth < window.innerHeight
      ? window.innerWidth
      : window.innerHeight;
  previewSize.value = `${minSize * 0.2}`;
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
      <section class="mainZone">
        <ChessboardVue
          id="previewBoard"
          ref="previewBoard"
          :size="previewSize"
          :whitePlayerHuman="false"
          :blackPlayerHuman="false"
        />
        <aside>
          <div class="field">
            {{ t("pages.newGame.hasWhite") }}
            <input
              type="radio"
              name="hasWhite"
              id="hasWhiteYes"
              value="yes"
              checked
              @change="handleGameTurnChange"
            />
            <label for="hasWhiteYes">{{ t("pages.newGame.hasWhiteYes") }}</label>

            <input
              type="radio"
              name="hasWhite"
              id="hasWhiteNo"
              value="no"
              @change="handleGameTurnChange"
            />
            <label for="hasWhiteNo">{{ t("pages.newGame.hasWhiteNo") }}</label>
          </div>
          <div class="field">
            {{ t("pages.newGame.includeTime") }}
            <input
              type="radio"
              name="includeTime"
              id="includeTimeYes"
              value="yes"
              checked
              @change="handleIncludeTimeChange"
            />
            <label for="includeTimeYes">{{ t("pages.newGame.includeTimeYes") }}</label>

            <input
              type="radio"
              name="includeTime"
              id="includeTimeNo"
              value="no"
              @change="handleIncludeTimeChange"
            />
            <label for="includeTimeNo">{{ t("pages.newGame.includeTimeNo") }}</label>
          </div>
          <div class="field" v-if="includeTime">
            <input
              type="number"
              id="timeMinutes"
              name="timeMinutes"
              min="0"
              max="60"
              v-model="timeMinutes"
              @change="handleTimeMinutesChange"
            />
            <label for="timeMinutes">{{ t("pages.newGame.minutes") }}</label>
            <input
              type="number"
              id="timeSeconds"
              name="timeSeconds"
              min="0"
              max="60"
              v-model="timeSeconds"
              @change="handleTimeSecondsChange"
            />
            <label for="timeSeconds">{{ t("pages.newGame.seconds") }}</label>
          </div>
          <div id="button">
            <button class="ok" @click="startNewGame">
              {{ t("pages.newGame.submit") }}
            </button>
            <button class="cancel" @click="cancel">
              {{ t("pages.newGame.cancel") }}
            </button>
          </div>
        </aside>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dialog {
  width: 100%;
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
  width: 60%;
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

.mainZone {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.mainZone > aside {
  display: flex;
  margin: 0 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.field > * {
  margin: 3px;
}
</style>

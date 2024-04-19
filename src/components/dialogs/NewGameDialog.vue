<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { notify } from "@kyvg/vue3-notification";
const { t } = useI18n();

import { closeDialog } from "vue3-promise-dialog";

import EditedValue from "@/components/EditedValue.vue";

import reverse from "@/assets/images/reverse.svg";

const reversed = ref(false);

const editableBoard = ref();
const editedValue = ref();
const previewSize = ref(100);
const centralSize = ref(100);
const withWhiteSide = ref(true);
const includeTime = ref(true);
const timeMinutes = ref(5);
const timeSeconds = ref(0);
const incrementSeconds = ref(0);
const nullityHalfMovesCount = ref(0);
const moveNumber = ref(1);

const whiteOO = ref(true);
const whiteOOO = ref(true);
const blackOO = ref(true);
const blackOOO = ref(true);

const enPassant = ref(t("pages.newGame.noEnPassant"));

const epChoicesWhite = [
  t("pages.newGame.noEnPassant"),
  "a6",
  "b6",
  "c6",
  "d6",
  "e6",
  "f6",
  "g6",
  "h6",
];
const epChoicesBlack = [
  t("pages.newGame.noEnPassant"),
  "a3",
  "b3",
  "c3",
  "d3",
  "e3",
  "f3",
  "g3",
  "h3",
];

const enPassantChoices = computed(() => {
  return withWhiteSide.value ? epChoicesWhite : epChoicesBlack;
});

onMounted(() => {
  editableBoard.value.setCurrentEditingValue(editedValue.value.getValue());
});

function getCastlesString() {
  let result = "";

  if (whiteOO.value) result += "K";
  if (whiteOOO.value) result += "Q";
  if (blackOO.value) result += "k";
  if (blackOOO.value) result += "q";

  return result.length > 0 ? result : "-";
}

function generatePosition() {
  const boardPart = editableBoard.value.getBoardCode();
  const turnPart = withWhiteSide.value ? "w" : "b";
  const castlesPart = getCastlesString();
  const enPassantPart =
    enPassant.value === t("pages.newGame.noEnPassant") ? "-" : enPassant.value;
  const drawHalfMovesPart = nullityHalfMovesCount.value.toString();
  const moveNumberPart = moveNumber.value.toString();
  return (
    boardPart +
    " " +
    turnPart +
    " " +
    castlesPart +
    " " +
    enPassantPart +
    " " +
    drawHalfMovesPart +
    " " +
    moveNumberPart
  );
};

function startNewGame() {
  if (includeTime.value && timeMinutes.value === 0 && timeSeconds.value === 0) {
    notify(t("pages.newGame.timeSetToZero"));
    return;
  }
  const startPosition = generatePosition();

  ///////////////////////TODO remove
  console.log(startPosition);
  return;
  ////////////////////////////////////

  //TODO set back
  /*
  const newGameData = {
    startPosition,
    withWhiteSide: withWhiteSide.value,
    withClock: includeTime.value,
    clockMinutes: timeMinutes.value,
    clockSeconds: timeSeconds.value,
    incrementSeconds: incrementSeconds.value,
  };
  closeDialog(newGameData);
  */
}

function cancel() {
  closeDialog();
}

function handleGameTurnChange(e) {
  const newValue = e.target.value;
  withWhiteSide.value = newValue === "yes";
  enPassant.value = t("pages.newGame.noEnPassant");
}

function handleIncludeTimeChange(e) {
  const newValue = e.target.value;
  includeTime.value = newValue === "yes";
}

function handleValueChange() {
  editableBoard.value.setCurrentEditingValue(editedValue.value.getValue());
}

onMounted(() => {
  const minSize =
    window.innerWidth < window.innerHeight
      ? window.innerWidth
      : window.innerHeight;
  previewSize.value = minSize * 0.3;
  centralSize.value = minSize * 0.05;
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
        <div class="boardZone">
          <img :src="reverse" @click="reversed = !reversed" />
          <EditableBoardVue
            id="editableBoard"
            ref="editableBoard"
            :size="previewSize"
            :reversed="reversed"
            :white-turn="withWhiteSide"
          />
          <EditedValue
            ref="editedValue"
            @change="handleValueChange"
            :centralSize="centralSize"
          />
        </div>
        <aside>
          <div class="buttonsLine">
            <button>{{ t("pages.newGame.copyFen") }}</button>
            <button>{{ t("pages.newGame.pasteFen") }}</button>
          </div>
          <div class="buttonsLine">
            <button>{{ t("pages.newGame.resetFen") }}</button>
            <button>{{ t("pages.newGame.defaultFen") }}</button>
            <button>{{ t("pages.newGame.clearFen") }}</button>
          </div>
        </aside>
        <aside>
          <div class="field">
            <input type="checkbox" id="whiteOO" v-model="whiteOO" />
            <label for="whiteOO">{{ t("pages.newGame.whiteOO") }}</label>
          </div>
          <div class="field">
            <input type="checkbox" id="whiteOOO" v-model="whiteOOO" />
            <label for="whiteOO">{{ t("pages.newGame.whiteOOO") }}</label>
          </div>
          <div class="field">
            <input type="checkbox" id="blackOO" v-model="blackOO" />
            <label for="blackOO">{{ t("pages.newGame.blackOO") }}</label>
          </div>
          <div class="field">
            <input type="checkbox" id="blackOOO" v-model="blackOOO" />
            <label for="blackOO">{{ t("pages.newGame.blackOOO") }}</label>
          </div>
          <div class="field">
            <label for="enPassant">{{
              t("pages.newGame.enPassantLabel")
            }}</label>
            <select id="enPassant" v-model="enPassant">
              <option
                v-for="value in enPassantChoices"
                :key="value"
                :value="value"
              >
                {{ value }}
              </option>
            </select>
          </div>
          <div class="field">
            <label for="nullityHalfMovesCount">{{
              t("pages.newGame.nullityHalfMovesCount")
            }}</label>
            <input
              id="nullityHalfMovesCount"
              type="number"
              v-model="nullityHalfMovesCount"
              min="0"
            />
          </div>
          <div class="field">
            <label for="moveNumber">{{ t("pages.newGame.moveNumber") }}</label>
            <input id="moveNumber" type="number" v-model="moveNumber" min="1" />
          </div>
        </aside>
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
            <label for="hasWhiteYes">{{
              t("pages.newGame.hasWhiteYes")
            }}</label>

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
            <label for="includeTimeYes">{{
              t("pages.newGame.includeTimeYes")
            }}</label>

            <input
              type="radio"
              name="includeTime"
              id="includeTimeNo"
              value="no"
              @change="handleIncludeTimeChange"
            />
            <label for="includeTimeNo">{{
              t("pages.newGame.includeTimeNo")
            }}</label>
          </div>
          <div class="field" v-if="includeTime">
            <input
              type="number"
              id="timeMinutes"
              name="timeMinutes"
              min="0"
              max="59"
              v-model="timeMinutes"
            />
            <label for="timeMinutes">{{ t("pages.newGame.minutes") }}</label>
            <input
              type="number"
              id="timeSeconds"
              name="timeSeconds"
              min="0"
              max="59"
              v-model="timeSeconds"
            />
            <label for="timeSeconds">{{ t("pages.newGame.seconds") }}</label>
            <input
              type="number"
              id="incrementSeconds"
              name="incrementSeconds"
              min="0"
              max="59"
              v-model="incrementSeconds"
            />
            <label for="incrementSeconds">{{
              t("pages.newGame.increment")
            }}</label>
          </div>
        </aside>
      </section>
      <div id="buttons">
        <button class="ok" @click="startNewGame">
          {{ t("pages.newGame.submit") }}
        </button>
        <button class="cancel" @click="cancel">
          {{ t("pages.newGame.cancel") }}
        </button>
      </div>
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
  width: 75%;
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.boardZone {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.boardZone > img {
  width: 5vw;
  height: 5vw;
  border: 1px solid blue;
  border-radius: 1vw;
  margin: 0 5px;
}

.mainZone > aside {
  display: flex;
  height: 13vh;
  margin: 20px 10px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: scroll;
}

.buttonsLine > button {
  font-size: smaller;
}

.field {
  margin: 4px;
}

.field > * {
  margin: 3px;
}

.buttonsLine {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}

@media (max-width: 1000px) {
  .buttonsLine {
    flex-direction: column;
  }
}
</style>

<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["change"]);
const props = defineProps(["centralSize"]);
const value = ref("");
const whitePiece = ref(true);

const centralSizePx = computed(() => (props.centralSize || 100) + "px");
const piecesSize = computed(() => props.centralSize * 0.98);

const buttonsSize = computed(() => props.centralSize / 1.5);
const buttonsSizePx = computed(() => buttonsSize.value + "px");

function changeValueLeft() {
  switch (value.value) {
    case "P":
      value.value = "";
      break;
    case "N":
      value.value = "P";
      break;
    case "B":
      value.value = "N";
      break;
    case "R":
      value.value = "B";
      break;
    case "Q":
      value.value = "R";
      break;
    case "K":
      value.value = "Q";
      break;
    case "p":
      value.value = "";
      break;
    case "n":
      value.value = "b";
      break;
    case "b":
      value.value = "n";
      break;
    case "r":
      value.value = "b";
      break;
    case "q":
      value.value = "r";
      break;
    case "k":
      value.value = "q";
      break;
    default:
      value.value = whitePiece.value ? "K" : "k";
  }
  emit("change", value.value);
}

function changeValueRight() {
  switch (value.value) {
    case "P":
      value.value = "N";
      break;
    case "N":
      value.value = "B";
      break;
    case "B":
      value.value = "R";
      break;
    case "R":
      value.value = "Q";
      break;
    case "Q":
      value.value = "K";
      break;
    case "K":
      value.value = "";
      break;
    case "p":
      value.value = "n";
      break;
    case "n":
      value.value = "b";
      break;
    case "b":
      value.value = "r";
      break;
    case "r":
      value.value = "q";
      break;
    case "q":
      value.value = "k";
      break;
    case "k":
      value.value = "";
      break;
    default:
      value.value = whitePiece.value ? "P" : "p";
  }
  emit("change", value.value);
}

function changeValueUpDown() {
  if (value.value !== "") {
    whitePiece.value = !whitePiece.value;
  }
  switch (value.value) {
    case "P":
      value.value = "p";
      break;
    case "N":
      value.value = "n";
      break;
    case "B":
      value.value = "b";
      break;
    case "R":
      value.value = "r";
      break;
    case "Q":
      value.value = "q";
      break;
    case "K":
      value.value = "k";
      break;
    case "p":
      value.value = "P";
      break;
    case "n":
      value.value = "N";
      break;
    case "b":
      value.value = "B";
      break;
    case "r":
      value.value = "R";
      break;
    case "q":
      value.value = "Q";
      break;
    case "k":
      value.value = "K";
      break;
  }
  emit("change", value.value);
}

function getValue() {
  return value.value;
}

import upArrow from "@/assets/images/upArrow.svg";
import downArrow from "@/assets/images/downArrow.svg";
import leftArrow from "@/assets/images/leftArrow.svg";
import rightArrow from "@/assets/images/rightArrow.svg";
import bin from "@/assets/images/bin.svg";

import WP from "@/components/pieces/WP.vue";
import WN from "@/components/pieces/WN.vue";
import WB from "@/components/pieces/WB.vue";
import WR from "@/components/pieces/WR.vue";
import WQ from "@/components/pieces/WQ.vue";
import WK from "@/components/pieces/WK.vue";

import BP from "@/components/pieces/BP.vue";
import BN from "@/components/pieces/BN.vue";
import BB from "@/components/pieces/BB.vue";
import BR from "@/components/pieces/BR.vue";
import BQ from "@/components/pieces/BQ.vue";
import BK from "@/components/pieces/BK.vue";

defineExpose({
  getValue,
});
</script>

<template>
  <div class="_root">
    <!--top line-->
    <div></div>
    <div class="editedValueButton">
      <img :src="upArrow" @click="changeValueUpDown" />
    </div>
    <div></div>
    <!--top line-->

    <!-- middle line-->
    <div class="editedValueButton"><img :src="leftArrow" @click="changeValueLeft" /></div>
    <div class="_centralZone">
      <WP :size="piecesSize" v-if="value === 'P'" />
      <WN :size="piecesSize" v-else-if="value === 'N'" />
      <WB :size="piecesSize" v-else-if="value === 'B'" />
      <WR :size="piecesSize" v-else-if="value === 'R'" />
      <WQ :size="piecesSize" v-else-if="value === 'Q'" />
      <WK :size="piecesSize" v-else-if="value === 'K'" />

      <BP :size="piecesSize" v-else-if="value === 'p'" />
      <BN :size="piecesSize" v-else-if="value === 'n'" />
      <BB :size="piecesSize" v-else-if="value === 'b'" />
      <BR :size="piecesSize" v-else-if="value === 'r'" />
      <BQ :size="piecesSize" v-else-if="value === 'q'" />
      <BK :size="piecesSize" v-else-if="value === 'k'" />

      <img :src="bin" v-else />
    </div>
    <div class="editedValueButton">
      <img :src="rightArrow" @click="changeValueRight" />
    </div>
    <!-- middle line-->

    <!--bottom line-->
    <div></div>
    <div class="editedValueButton">
      <img :src="downArrow" @click="changeValueUpDown" />
    </div>
    <div></div>
    <!--bottom line-->
  </div>
</template>

<style scoped>
._root {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-template-rows: auto auto auto;
}

._centralZone {
  border: 1px solid blue;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: v-bind(centralSizePx);
  height: v-bind(centralSizePx);
}

._centralZone > img {
  width: v-bind(centralSizePx);
  height: v-bind(centralSizePx);
}

.editedValueButton {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

img {
  width: v-bind(buttonsSizePx);
  height: v-bind(buttonsSizePx);
}
</style>

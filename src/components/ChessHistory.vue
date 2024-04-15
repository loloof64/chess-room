<script setup>
import { ref } from "vue";

import backwardEnd from "@/assets/images/backward_end.svg";
import backward from "@/assets/images/backward.svg";
import forward from "@/assets/images/forward.svg";
import forwardEnd from "@/assets/images/forward_end.svg";

/**
 * requestNodeSelected notifies that a move node has been clicked.
 * You give it an object with those params :
 * @param {Number} nodeIndex - index of node in history component
 * @param {String} fen - the requested position in Forsyhth-Edwards Notation
 * @param {Number} fromFileIndex - the start file index of matching move.
 * @param {Number} fromRankIndex - the start rank index of matching move.
 * @param {Number} toFileIndex - the end file index of matching move.
 * @param {Number} toRankIndex - the end rank index of matching move.
 *
 * requestStartPosition notifies that we want to go in the start position of the game.
 * Does not take any parameter.
 */
const emit = defineEmits(["requestNodeSelected", "requestStartPosition"]);

const nodes = ref([]);
const mainContent = ref();
const selectedNodeIndex = ref(-1);
const navigationMode = ref(false);

/**
 * Clears history.
 * @param {Number} startMoveNumber : first move number of the game.
 * @param {Boolean} startsAsWhite : true if white starts the game, false otherwise.
 */
function reset(startMoveNumber, startsAsWhite) {
  const moveNumberText = `${startMoveNumber}.${startsAsWhite ? "" : ".."}`;
  navigationMode.value = false;
  selectedNodeIndex.value = -1;
  nodes.value = [{ number: moveNumberText }];
}

/**
 * Add a node to history, or complete the first one if no data other that move number given yet.
 * You give an object with
 * @param number: String? (can be undefined) - the move number text
 * @param fan: String? (can be undefined) - the move text without the number ands with chess symbols as Unicode
 * @param san: String? (can be undefined) - the move text without in Short Notation
 * @param fen: String? (can be undefined) - the position value resulting from move in Forstyh-Edwards Notation
 * @param fromFileIndex: Number? (can be undefined) - the start file index of the move
 * @param fromRankIndex: Number? (can be undefined) - the start rank index of the move
 * @param toFileIndex: Number? (can be undefined) - the end file index of the move
 * @param toRankIndex: Number? (can be undefined) - the end rank index of the move
 * @param whiteTurn: Boolean? (can be undefined) - is it white turn ?
 *
 */
function addNodeOrCompleteFirst(parameters) {
  const {
    number,
    fan,
    san,
    fen,
    fromFileIndex,
    fromRankIndex,
    toFileIndex,
    toRankIndex,
    whiteTurn,
  } = parameters;
  // We append data for the first move, as it's already added, if he has not any relevant data yet.
  if (nodes.value.length === 1 && !nodes.value[0].fan) {
    const oldValue = nodes.value[0];
    const newValue = {
      ...oldValue,
      fan,
      san,
      fen,
      fromFileIndex,
      fromRankIndex,
      toFileIndex,
      toRankIndex,
      whiteTurn,
    };
    // Clones the array instead of getting reference
    nodes.value[0] = newValue;
  } else {
    const numberString = `${number}.${whiteTurn === true ? "" : ".."}`;
    nodes.value = [
      ...nodes.value,
      {
        number: numberString,
        fan,
        san,
        fen,
        fromFileIndex,
        fromRankIndex,
        toFileIndex,
        toRankIndex,
        whiteTurn,
      },
    ];
  }
}

/**
 * Scroll, so that the last child is visible.
 */
function scrollToLastElement() {
  const lastChild = document.querySelector(".main-content span:last-child");
  lastChild.scrollIntoView();
}

/**
 * Sets the selected node :
 * - highlight it
 * - scrolls to it
 * @param {Number} nodeIndex
 */
function setSelectedNode(nodeIndex) {
  // Needing to be sure that clicking on next move will point to first move node.
  if (nodeIndex < 0) nodeIndex = -1;
  selectedNodeIndex.value = nodeIndex;
  if (nodeIndex > 0) {
    const targetChild = document.querySelector(
      `.main-content span:nth-child(${nodeIndex})`
    );
    targetChild.scrollIntoView();
  }
}

function requestStartPositionOnBoard() {
  if (!navigationMode.value) return;
  emit("requestStartPosition");
}

function scrollToTop() {
  mainContent.value.scroll(0, 0);
}

function selectStartPosition() {
  if (!navigationMode.value) return;
  requestStartPositionOnBoard();
  scrollToTop();
}

function selectPreviousNode() {
  if (!navigationMode.value) return;
  for (
    selectedNodeIndex.value -= 1;
    selectedNodeIndex.value >= 0;
    selectedNodeIndex.value--
  ) {
    const currentNode = nodes.value[selectedNodeIndex.value];
    const isAMoveNode = currentNode.fen;
    if (isAMoveNode) break;
  }

  if (selectedNodeIndex.value >= 0) {
    const node = nodes.value[selectedNodeIndex.value];
    const { fen, fromFileIndex, fromRankIndex, toFileIndex, toRankIndex } =
      node;
    emit("requestNodeSelected", {
      nodeIndex: selectedNodeIndex.value,
      fen,
      fromFileIndex,
      fromRankIndex,
      toFileIndex,
      toRankIndex,
    });
  } else {
    selectStartPosition();
  }
}

function selectLastNode() {
  if (!navigationMode.value) return;
  for (
    selectedNodeIndex.value += 1;
    selectedNodeIndex.value < nodes.value.length;
    selectedNodeIndex.value++
  ) {}

  const node = nodes.value[selectedNodeIndex.value];
  if (!node?.fen) {
    // cancelling progress in history if we point to a number node
    selectPreviousNode();
  }

  const { fen, fromFileIndex, fromRankIndex, toFileIndex, toRankIndex } =
    nodes.value[selectedNodeIndex.value];
  emit("requestNodeSelected", {
    nodeIndex: selectedNodeIndex.value,
    fen,
    fromFileIndex,
    fromRankIndex,
    toFileIndex,
    toRankIndex,
  });
}

/**
 * Activates navigation mode :
 * - shows toolbar
 * - select last move
 */
function activateNavigationMode() {
  navigationMode.value = true;
  selectLastNode();
}

function handleClick(nodeIndex) {
  const { fen, fromFileIndex, fromRankIndex, toFileIndex, toRankIndex } =
    nodes.value[nodeIndex];

  if (!navigationMode.value) return;
  if (!fen) return;

  emit("requestNodeSelected", {
    nodeIndex,
    fen,
    fromFileIndex,
    fromRankIndex,
    toFileIndex,
    toRankIndex,
  });
}

function isSelectedNode(nodeIndex) {
  return nodeIndex === selectedNodeIndex.value;
}

function selectNextNode() {
  if (!navigationMode.value) return;
  for (
    selectedNodeIndex.value += 1;
    selectedNodeIndex.value < nodes.value.length;
    selectedNodeIndex.value++
  ) {
    const currentNode = nodes.value[selectedNodeIndex.value];
    const isAMoveNode = currentNode.fen;
    if (isAMoveNode) break;
  }

  const node = nodes.value[selectedNodeIndex.value];
  if (!node?.fen) {
    // cancelling progress in history if we point to a number node
    selectPreviousNode();
  }

  const { fen, fromFileIndex, fromRankIndex, toFileIndex, toRankIndex } = node;
  emit("requestNodeSelected", {
    nodeIndex: selectedNodeIndex.value,
    fen,
    fromFileIndex,
    fromRankIndex,
    toFileIndex,
    toRankIndex,
  });
}

function getNodes() {
  // Clone the array instead of getting reference
  return nodes.value.map((e) => e);
}

function setNodes(nodesArray) {
  nodes.value = nodesArray;
}

function getLastNode() {
  return nodes.value[nodes.value.findLastIndex((e) => true)];
}

function getNodesCount() {
  return nodes.value.length;
}

defineExpose({
  reset,
  addNodeOrCompleteFirst,
  getNodes,
  setNodes,
  setSelectedNode,
  scrollToLastElement,
  activateNavigationMode,
  getLastNode,
  getNodesCount,
});
</script>

<template>
  <div class="root">
    <div class="toolbar" v-if="navigationMode">
      <button @click="selectStartPosition" class="toolbar__button">
        <img :src="backwardEnd" width="20" height="20" />
      </button>
      <button @click="selectPreviousNode" class="toolbar__button">
        <img :src="backward" width="20" height="20" />
      </button>
      <button @click="selectNextNode" class="toolbar__button">
        <img :src="forward" width="20" height="20" />
      </button>
      <button @click="selectLastNode" class="toolbar__button">
        <img :src="forwardEnd" width="20" height="20" />
      </button>
    </div>
    <div class="main-content" ref="mainContent">
      <template v-for="(node, index) in nodes" :key="index">
        <span v-if="node.whiteTurn || index === 0">
          {{ `${node.number ?? ""}&nbsp;` }}
        </span>
        <button
          @click="handleClick(index)"
          :class="{ selected: isSelectedNode(index) }"
        >
          {{ `${node.fan ?? ""}&nbsp;` }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: "Free Serif";
  src: url("@/assets/fonts/FreeSerif.ttf");
}

.root {
  width: 100%;
  height: 100%;
  display: block;
}

.toolbar {
  background-color: olive;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.toolbar__button {
  font-size: smaller;
}

.main-content {
  width: 100%;
  height: 5rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: flex-start;
  box-sizing: border-box;
  background-color: darkcyan;
  font-family: "Free Serif";
  font-size: x-large;
  padding: 0.5rem;
  text-align: start;
  overflow-x: scroll;
  overflow-y: hidden;
}

.main-content > button {
  background-color: darkcyan;
  padding: 0;
  text-wrap: nowrap;
}

.selected {
  background-color: yellowgreen;
  color: blue;
}
</style>

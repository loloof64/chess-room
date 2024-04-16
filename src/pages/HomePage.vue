<script setup>
import { subscribeToAllRoomsChange } from "@/lib/roomHandler.js";
import { ref, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { notify } from "@kyvg/vue3-notification";
const { t } = useI18n();
const router = useRouter();

import copySvg from "@/assets/images/copy.svg";

import { useRoomStore } from "@/stores/RoomStore.js";
const roomStore = useRoomStore();

function goToCreateRoomPage() {
  router.push({ path: "/create-room", replace: true });
}

function goToJoinRoomPage() {
  router.push({ path: "/join-room", replace: true });
}

async function copyIdToClipboard() {
  await navigator.clipboard.writeText(roomStore.roomId);
  notify({
    text: t("pages.home.roomIdCopied"),
  });
}

const unsubscribeCheckOpponentFound = ref();

function checkForOpponentFoundAndGoToGamePageIfReady(dbDocument) {
  const dbDocumentData = dbDocument.data();
  const roomId = roomStore.roomId;
  const isMatchingDocument = roomId === dbDocument.id;
  const hasGuestUser = ![null, undefined].includes(dbDocumentData.guestUser);
  const weAreHost = roomStore.roomOwner;
  if (isMatchingDocument && hasGuestUser && weAreHost) {
    router.push({ path: "/game", replace: true });
  }
}

async function registerForRoomsChanged() {
  unsubscribeCheckOpponentFound.value = subscribeToAllRoomsChange(
    checkForOpponentFoundAndGoToGamePageIfReady
  );
}

function unsubscribeForRoomsChanged() {
  if (unsubscribeCheckOpponentFound.value) {
    unsubscribeCheckOpponentFound.value();
  }
}

onMounted(registerForRoomsChanged);

onBeforeUnmount(unsubscribeForRoomsChanged);
</script>

<template>
  <div id="root">
    <h2>{{ t("pages.home.title") }}</h2>
    <div v-if="roomStore.roomId && roomStore.roomOwner">
      {{ t("pages.home.yourRoom") }} : #{{ roomStore.roomId }}
      <button @click="copyIdToClipboard" class="copyButton">
        <img :src="copySvg" width="20" height="20" />
      </button>
    </div>
    <button v-if="!roomStore.roomId" @click="goToCreateRoomPage">
      {{ t("pages.home.createRoom") }}
    </button>
    <button v-if="!roomStore.roomId" @click="goToJoinRoomPage">
      {{ t("pages.home.joinRoom") }}
    </button>
  </div>
</template>

<style scoped>
#root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}

button {
  border: 1px solid blue;
  border-radius: 10px;
}

.copyButton {
  margin: 0 5px;
}
</style>

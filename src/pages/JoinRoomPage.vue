<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const router = useRouter();

import pasteSvg from '@/assets/paste.svg';

import { tryJoiningRoom } from '@/lib/roomHandler.js';
import { useRoomStore } from '@/stores/RoomStore.js';

const roomStore = useRoomStore();

const buttonsActive = ref(true);
const nicknameField = ref();
const roomIdField = ref();

const nicknamePlaceholder = ref(t('pages.joinRoom.placeholders.nickname'));
const roomIdPlaceholder = ref(t('pages.joinRoom.placeholders.roomId'));

async function joinRoom() {
    const nickname = nicknameField.value.value;
    const roomId = roomIdField.value.value;
    const result = await tryJoiningRoom({ nickname, roomId });
    const hasError = result.hasOwnProperty('error');
    if (hasError) {
        alert(t(result.error));

        const isFatalError = result.isFatalError;
        if (isFatalError) {
            router.push({ path: '/', replace: true });
        }
    }
    else {
        buttonsActive.value = false;
        roomStore.setRoomId(roomId);
        roomStore.setRoomOwner(false);
        router.push({ path: '/game', replace: true });
    }
}

async function pasteId() {
    const roomId = await navigator.clipboard.readText();
    try {
        roomIdField.value.value = roomId;
    }
    catch (e) {
        console.error(e);
    }
}

function cancel() {
    router.push({ path: '/', replace: true });
}
</script>

<template>
    <div id="root">
        <header>
            <h2>
                {{ t('pages.joinRoom.title') }}
            </h2>
        </header>
        <section>
            <table>
                <tr>
                    <td>
                        {{ t('pages.joinRoom.labels.nickname') }}
                    </td>
                    <td>
                        <input type="text" :placeholder="nicknamePlaceholder" ref="nicknameField" />
                    </td>
                </tr>
                <tr>
                    <td>
                        {{ t('pages.joinRoom.labels.roomId') }}
                    </td>
                    <td>
                        <input type="text" :placeholder="roomIdPlaceholder" ref="roomIdField" />
                        <button @click="pasteId"><img :src="pasteSvg" width="20" height="20" /></button>
                    </td>
                </tr>
            </table>
            <div id="button" v-if="buttonsActive">
                <button class="ok" @click="joinRoom">{{ t('pages.joinRoom.submit') }}</button>
                <button class="cancel" @click="cancel">{{ t('pages.joinRoom.cancel') }}</button>
            </div>
        </section>
    </div>
</template>

<style scoped>
#root {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    width: 85%;
    height: 85%;
}

section {
    padding: 20px;
    border: 1px solid navy;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
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
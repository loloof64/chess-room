<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const router = useRouter();

import { tryCreatingRoom } from '@/lib/roomHandler.js';
import { useRoomStore } from '@/stores/RoomStore.js';

const roomStore = useRoomStore();

const buttonsActive = ref(true);

const nicknameField = ref();

const nicknamePlaceholder = ref(t('pages.createRoom.placeholders.nickname'));
const createRoom = async () => {
    const nickname = nicknameField.value.value;
    const result = await tryCreatingRoom({ nickname });
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
        const roomId = result.result.id;
        roomStore.setRoomId(roomId);
        roomStore.setRoomOwner(true);
        router.push({ path: '/', replace: true });
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
                {{ t('pages.createRoom.title') }}
            </h2>
        </header>
        <section>
            <table>
                <tr>
                    <td>
                        {{ t('pages.createRoom.labels.nickname') }}
                    </td>
                    <td>
                        <input type="text" :placeholder="nicknamePlaceholder" ref="nicknameField" />
                    </td>
                </tr>
            </table>
            <div id="button" v-if="buttonsActive">
                <button class="ok" @click="createRoom">{{ t('pages.createRoom.submit') }}</button>
                <button class="cancel" @click="cancel">{{ t('pages.createRoom.cancel') }}</button>
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
</style>
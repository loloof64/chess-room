<script setup>
import { defineExpose } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { closeDialog } from 'vue3-promise-dialog'

async function giveUpGame() {
    closeDialog(true);
}

function cancel() {
    closeDialog(false);
}

defineExpose({
    returnValue: () => {return;},
})
</script>

<template>
    <div class="dialog">
        <div class="center">
            <header>
                <h2>{{ t('pages.giveUp.title') }}</h2>
            </header>
            <section>
                <div id="button">
                    <button class="ok" @click="giveUpGame">{{ t('pages.giveUp.submit') }}</button>
                    <button class="cancel" @click="cancel">{{ t('pages.giveUp.cancel') }}</button>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
.dialog {
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
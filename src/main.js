import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router';
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import Notifications from '@kyvg/vue3-notification'
import './style.css'
import App from './App.vue';

import messages from './i18n';;
import routes from './pages';

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

// https://stackoverflow.com/a/52112155/662618
const getNavigatorLanguage = () => {
    if (navigator.languages && navigator.languages.length) {
        return navigator.languages[0];
    } else {
        return navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en';
    }
}
const locale = getNavigatorLanguage().substring(0, 2);

const i18n = createI18n({
    fallbackLocale: 'en',
    legacy: false,
    locale,
    messages,
});

const pinia = createPinia();

import ChessBoard from '@loloof64/chessboard-component/dist';

createApp(App)
    .use(pinia)
    .use(router)
    .use(i18n)
    .use(Notifications)
    .mount('#app')

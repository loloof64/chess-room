import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router';
import { createI18n } from 'vue-i18n'
import './style.css'
import App from './App.vue';

import HomePage from './pages/HomePage.vue';
import GamePage from './pages/GamePage.vue';

import messages from './i18n';

const routes = [
    { path: '/', component: HomePage },
    { path: '/game', component: GamePage },
];

const router = createRouter({
    history: createWebHistory(),
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
const locale = getNavigatorLanguage();

const i18n = createI18n({
    fallbackLocale: 'en',
    legacy: false,
    locale,
    messages,
});

import ChessBoard from '@loloof64/chessboard-component/dist';

createApp(App)
    .use(router)
    .use(i18n)
    .mount('#app')

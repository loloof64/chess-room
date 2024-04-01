import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router';
import './style.css'
import App from './App.vue';

import HomePage from './pages/HomePage.vue';
import GamePage from './pages/GamePage.vue';

const routes = [
    { path: '/', component: HomePage },
    { path: '/game', component: GamePage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

import ChessBoard from '@loloof64/chessboard-component/dist';

createApp(App)
.use(router)
.mount('#app')

import HomePage from '@/pages/HomePage.vue';
import CreateRoomPage from '@/pages/CreateRoomPage.vue';
import JoinRoomPage from '@/pages/JoinRoomPage.vue';
import GamePage from '@/pages/GamePage.vue';

export default [
    { path: '/', component: HomePage },
    { path: '/create-room', component: CreateRoomPage },
    { path: '/join-room', component: JoinRoomPage },
    { path: '/game', component: GamePage },
];
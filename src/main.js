import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import {createRouter, createWebHistory} from 'vue-router';
import Board from "./components/Board.vue"

const routes = [
    { path: '/', component: Board},
    { path: '/:gameId', component: Board },
]

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory(),
    routes, // short for `routes: routes`
  })

const app = createApp(App)
app.use(router);
app.mount('#app');


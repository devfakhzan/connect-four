import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import HomePage from "./views/HomePage.vue";
import GamePage from "./views/GamePage.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/game/:gameId", component: GamePage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const pinia = createPinia();

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount("#app");

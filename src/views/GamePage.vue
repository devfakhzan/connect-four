<script setup>
import { onMounted, ref, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
import Board from "../components/Board.vue";

const axios = inject("axios");
const route = useRoute();
const router = useRouter();
const gameId = route.params.gameId;
let game = ref();

onMounted(async () => {
  let { data } = await axios.get(`/api/games/${gameId}`);
  game.value = data;
});
</script>

<template>
  <header>
    <button class="new-game" type="button" @click="router.back()">Back</button>
  </header>
  <Board v-if="game" :view-mode="false" :game="game" />
</template>

<style></style>

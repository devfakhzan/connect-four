<script setup>
import { onMounted, reactive, inject, ref } from "vue";
import Board from "../components/Board.vue";
import { useRequestsStore } from "../stores/requests";
const requests = useRequestsStore();
let games = reactive([]);
let currentPage = ref(1);
let totalPages = ref("?");

const axios = inject("axios");

const fetchAllGames = async () => {
  try {
    const { data } = await axios.get("/api/games");
    if (data.games) {
      games.splice(0, games.length, ...data.games);
      totalPages = data.totalPages;
      currentPage = data.currentPage;
    }
  } catch (e) {
    alert("Error fetching all games. Check the console below for more details.")
  }
};

const fetchGamesInPage = async (pageNumber) => {
  try {
    const { data } = await axios.get(`/api/games?page=${pageNumber}`);
    if (data.games) {
      games.splice(0, games.length, ...data.games);
      totalPages = data.totalPages;
      currentPage = data.currentPage;
    }
  } catch (e) {
    alert("Error fetching this game page. Check the console below for more details.")
  }
};
onMounted(async () => {
  await fetchAllGames();
});

const createNewGame = async () => {
  try {
    const { data } = await axios.post("/api/games");
    if (data) {
      await fetchAllGames();
      await fetchGamesInPage(totalPages);
    }
  } catch (error) {
    alert("Error creating a new game. Check the console below for more details.")
  }
};
</script>

<template>
  <header>
    <button class="new-game" type="button" @click="createNewGame">
      New game
    </button>
    <div class="pagination">
      <button
        type="button"
        :disabled="currentPage === 1"
        @click="fetchGamesInPage(currentPage - 1)"
      >
        {{ "<" }}
      </button>
      <span class="current-page"> {{ currentPage }} / {{ totalPages }}</span>
      <button
        type="button"
        :disabled="currentPage === totalPages || typeof totalPages !== 'number'"
        @click="fetchGamesInPage(currentPage + 1)"
      >
        >
      </button>
    </div>
  </header>

  <div class="boards">
    <div v-if="games.length" class="boards-container">
      <Board
        class="margin-y"
        :view-mode="true"
        v-for="game in games"
        :key="game.id"
        :game="game"
      />
    </div>
    <div v-else>
      <h3>No game found.</h3>
    </div>
  </div>
</template>

<style>
.boards,
.boards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.margin-y {
  margin: 10px;
}

header {
  position: sticky;
  top: 0;
  background: rgb(78, 78, 228);
  display: flex;
  justify-content: space-between;
}

header button {
  background: white;
  padding: 10px;
  margin: 10px;
}

.current-page {
  color: white;
}
</style>

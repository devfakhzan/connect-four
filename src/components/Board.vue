<script setup>
import { ref, reactive, toRefs, inject } from "vue";
import { useRouter } from "vue-router";
import coindrop from "../assets/drop.wav";


const axios = inject('axios');

const props = defineProps({
  viewMode: {
    type: Boolean,
    default: false,
  },
  game: {
    type: Object
  },
});
const {game} = toRefs(props);
let board = reactive(game.value.board);
const gameId = game.value.id;
const router = useRouter();

const viewGame = async (gameId) => {
  if (gameId) {
    router.push(`/game/${gameId}`);
  }
};

let turn = game.value.turn;
let winningStreakCoordinates = reactive(game.value.winningStreakCoordinates); //To keep track of the winning condition coordinates
let tie = ref(game.value.status === 'tie');
let winner = ref(game.value.winner);



const putCoin = async col => {
  try {
    const {data} = await axios.post(`/api/games/${gameId}`, {
      col
    });
    const audio = new Audio(coindrop);
    audio.play();
    Object.assign(board, data.board);
    Object.assign(winningStreakCoordinates, data.winningStreakCoordinates);
    tie = data.status === 'tie';
    turn = data.turn;
    winner = data.winner;
  } catch (e) {
    alert("Error putting coin. Check the console below for more details.")
  }
};

const inwinningStreakCoordinates = (row, col) => {
  return winningStreakCoordinates?.find(
    (tile) => tile[0] === row && tile[1] === col
  );
};
</script>
<template>
  <div :class="['container', { cursor: viewMode }]" @click="viewGame(gameId)">
    <div v-if="!viewMode" class="buttons-container">
      <button
        type="button"
        v-for="(col, coli) in board[0].length"
        :key="`ms_${coli}`"
        @click="putCoin(coli, turn)"
        :class="winningStreakCoordinates.length === 4 || tie ? 'gray' : turn"
        :disabled="winningStreakCoordinates.length === 4 || tie"
      >
        ⦿
      </button>
    </div>
    <div class="board-container" :class="[{[`${winner}-board-container`]: winner}, {[`tie-board-container`]: tie}]">
      <div class="board" :class="[{[`${winner}-won`]: winner}, {tie}]">
        <div v-for="(row, ri) in board" :key="`row_${ri}`" class="row">
          <span
            style="padding: 3px; margin: 1px"
            v-for="(rowCol, ci) in row"
            :key="`row_${ri}_col_${ci}`"
          >
            <span
              :class="[
                { [rowCol]: inwinningStreakCoordinates(ri, ci) },
                { bold: inwinningStreakCoordinates(ri, ci) },
              ]"
              >[
            </span>
            <span :class="[rowCol, { bold: inwinningStreakCoordinates(ri, ci) }]"
              >⦿</span
            >
            <span
              :class="[
                { [rowCol]: inwinningStreakCoordinates(ri, ci) },
                { bold: inwinningStreakCoordinates(ri, ci) },
              ]"
            >
              ]</span
            >
          </span>
        </div>
      </div>
      
    </div>
    <div class="announce-container">
      <div class="info">Game ID: {{ gameId }}</div>
      <h3 class="winner">{{ winner || tie ? (winner ? (winner === 'y' ? 'YELLOW WON' : "RED WON") : (tie ? "TIE" : "NO WINNER")) : "ONGOING" }}</h3>
    </div>
  </div>
</template>

<style>
.container {
  padding: 5px;
  overflow: hidden;
  flex: 44%;
}

.cursor {
  cursor: pointer;
}

.board {
  background: blue;
  color: gray;
  width: 100%;
  font-size: 1.9vw;
}

.row {
  display: flex;
  justify-content: space-around;
}
button {
  font-size: 1.9vw;
  background: blue;
  border-radius: 5px;
}

.buttons-container {
  display: flex;
  justify-content: space-around;
  align-items: space-around;
  margin-left: 10px;
}
.y {
  color: rgb(214, 214, 22);
}

.r {
  color: red;
}

.gray {
  color: white;
  background: gray;
}
.bold {
  font-weight: bolder;
}

.board-container {
  border: 10px solid blue;
}

.y-board-container {
  border: 10px solid rgb(245, 245, 215);
}

.r-board-container {
  border: 10px solid rgb(241, 221, 221);
}

.tie-board-container {
  border: 10px solid rgb(235, 235, 235);
}

.y-won {
  background: rgb(245, 245, 215);
}

.r-won {
  background: rgb(241, 221, 221);
}

.tie {
  background: rgb(235, 235, 235);
}

.announce-container {
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center;
}

.info {
  margin: 2px;
  margin-top: 10px;
}
.winner {
  margin: 5px;
}
</style>

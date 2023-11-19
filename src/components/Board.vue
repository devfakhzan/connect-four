<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import coindrop from "../assets/drop.wav";
defineProps({
    viewMode: {
        type: Boolean,
        default: false
    },
    gameId: {
        type: String
    }
})
const router = useRouter();

const viewGame = async (gameId) => {
    await router.isReady();
    if (gameId) {
        router.push(`/game/${gameId}`)
    }
}

const board = reactive(
  [
    ["e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e"],
  ]
  /*
  Coordinates:
  [0,0], [0,1], [0,2], [0,3], [0,4], [0,5], [0,6]
  [1,0], [1,1], [1,2], [1,3], [1,4], [1,5], [1,6]
  [2,0], [2,1], [2,2], [2,3], [2,4], [2,5], [2,6]
  [3,0], [3,1], [3,2], [3,3], [3,4], [3,5], [3,6]
  [4,0], [4,1], [4,2], [4,3], [4,4], [4,5], [4,6]
  [5,0], [5,1], [5,2], [5,3], [5,4], [5,5], [5,6]
  */
);
let turn = ref("y"); //"Yellow" starts first
let winningStreakCoordinates = reactive([]); //To keep track of the winning condition coordinates
let tie = ref(false);

const maxRow = board.length - 1;
const maxCol = board[0].length - 1;

const checkStreak = (row, col, color, direction) => {
  const pathFormulaAndSanityCheck = (step) => {
    switch (direction) {
      //Covering all direction clockwise, starting from right
      case "right": {
        return {
          formula: board?.[row]?.[col + step] === color,
          failedSanityCheck: col + step > maxCol,
          passedStreak: [row, col + step],
        };
      }
      case "right-down": {
        return {
          formula: board?.[row + step]?.[col + step] === color,
          failedSanityCheck: col + step > maxCol || row + step > maxRow,
          passedStreak: [row + step, col + step],
        };
      }
      case "down": {
        return {
          formula: board?.[row + step]?.[col] === color,
          failedSanityCheck: row + step > maxRow,
          passedStreak: [row + step, col],
        };
      }
      case "left-down": {
        return {
          formula: board?.[row + step]?.[col - step] === color,
          failedSanityCheck: col - step < 0,
          passedStreak: [row + step, col - step],
        };
      }
      case "left": {
        return {
          formula: board?.[row]?.[col - step] === color,
          failedSanityCheck: col - step < 0,
          passedStreak: [row, col - step],
        };
      }
      case "left-up": {
        return {
          formula: board?.[row - step]?.[col - step] === color,
          failedSanityCheck: col - step < 0 || row - step < 0,
          passedStreak: [row - step, col - step],
        };
      }
      //No case 'up' because the latest turn will never have coin above it.
      case "right-up": {
        return {
          formula: board?.[row - step]?.[col + step] === color,
          failedSanityCheck: col + step > maxCol || row - step < 0,
          streak: [row - step, col + step],
        };
      }
    }
  };

  let streak = 1;
  let step = 1;
  let streakCoords = [];
  while (pathFormulaAndSanityCheck(step).formula) {
    //When this check passes, streak is already 2
    streak++;
    if (pathFormulaAndSanityCheck(step).failedSanityCheck) {
      return [];
    }

    streakCoords.push(pathFormulaAndSanityCheck(step).passedStreak);
    if (streak === 4) {
      streakCoords.unshift([row, col]); //Last play
      return streakCoords;
    }

    step++;
  }
  return [];
};

const checkIfTie = () => {
  return board.every((row) => row.every((col) => col !== "e"));
};

const putCoin = (col, color) => {
  const coordOccupied = (row, col) => board?.[row]?.[col] !== "e";

  let currentRow = maxRow;
  while (coordOccupied(currentRow, col)) {
    if (currentRow < 0) {
      break;
    }
    currentRow--;
  }

  if (currentRow >= 0) {
    var audio = new Audio(coindrop);
    audio.play();
    board[currentRow][col] = color;

    if (checkIfTie()) {
      tie = true;
    }
    if (checkIfIWin(currentRow, col, color)) {
      console.log(`${color} won`);
    }
  } else {
    return;
  }

  const red = "r";
  const yellow = "y";
  if (turn.value === red) {
    color = yellow;
    turn.value = yellow;
  } else {
    color = red;
    turn.value = red;
  }
};


const checkIfIWin = (row, col, color) => {
  const directions = [
    "right",
    "right-down",
    "down",
    "left-down",
    "left",
    "left-up",
    "right-up",
  ];
  for (let direction of directions) {
    winningStreakCoordinates = checkStreak(row, col, color, direction);
    if (winningStreakCoordinates.length === 4) {
      return true;
    }
  }
  return false;
};

const inwinningStreakCoordinates = (row, col) => {
  return winningStreakCoordinates?.find(
    (tile) => tile[0] === row && tile[1] === col
  );
};
</script>
<template>
  <div :class="['container', {cursor: viewMode}]" @click="viewGame(123)">
    <div v-if="!viewMode" class="buttons-container">
      <button
        v-for="(col, coli) in board[0].length"
        :key="`ms_${coli}`"
        @click="putCoin(coli, turn)"
        :class="winningStreakCoordinates.length === 4 ? 'gray' : turn"
        :disabled="winningStreakCoordinates.length === 4 || tie"
      >
        ⦿
      </button>
    </div>
    <div class="board">
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
</template>

<style>
.container {
  padding: 5px;
  overflow: hidden;
}

.cursor {
    cursor: pointer;
}

.board {
  background: blue;
  color: gray;
  width: 100%;
  font-size: 4.3vw;
  padding: 10px;
}

.row {
  display: flex;
  justify-content: space-around;
}
button {
  font-size: 4.3vw;
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
</style>

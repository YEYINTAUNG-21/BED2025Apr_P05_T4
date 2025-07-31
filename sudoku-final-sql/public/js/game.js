// public/js/game.js
let board = [];
let originalBoard = [];
let solution = [];

let selectedCell = null;

function createBoard(puzzle) {
  const boardContainer = document.getElementById("sudoku-board");
  boardContainer.innerHTML = "";

  board = puzzle.flat().map(v => v === null ? 0 : v);  // ✅ Always fresh puzzle
  originalBoard = [...board];

  board.forEach((val, i) => {
  const cell = document.createElement("input");
  cell.maxLength = 1;
  cell.className = "sudoku-cell";

  // ✅ Add this line to track selected cell
  cell.addEventListener("focus", () => {
    selectedCell = cell;
  });

  if (originalBoard[i] !== 0) {
    cell.value = originalBoard[i];
    cell.disabled = true;
    cell.style.backgroundColor = "#eee";
  } else {
    cell.value = val !== 0 ? val : "";
    cell.addEventListener("input", () => {
      const entered = parseInt(cell.value) || 0;
      board[i] = entered;

      if (solution.length > 0) {
        if (entered === solution[i]) {
          cell.style.backgroundColor = "#d4fcd4";
        } else {
          cell.style.backgroundColor = "#ffd6d6";
        }

        checkCompletion();
      }
    });

    if (val !== 0 && solution.length > 0) {
      cell.style.backgroundColor = val === solution[i] ? "#d4fcd4" : "#ffd6d6";
    }
  }

  boardContainer.appendChild(cell);
});
}
async function fetchNewGame() {
  const boardContainer = document.getElementById("sudoku-board");
  boardContainer.innerHTML = "<p>Loading puzzle...</p>";

  const difficulty = localStorage.getItem("difficulty") || "easy";
  try {
    const res = await fetch(`/api/sudoku/generate?difficulty=${difficulty}`);
    const data = await res.json();
    solution = data.solution.flat().map(v => v === null ? 0 : v);
    createBoard(data.puzzle);
  } catch (error) {
    boardContainer.innerHTML = "<p> Failed to load puzzle.</p>";
    console.error(" Error fetch puzzle:", error);
  }
}
async function loadSavedGame() {
  const username = localStorage.getItem("username");
  if (!username) return;

  try {
    const response = await axios.get(`/api/sudoku/session/${username}`);
    const { puzzle, solution } = response.data;

    createBoard(puzzle);            // puzzle = currentState or original puzzle
    window.solution = solution;     // so input validation works
  } catch (err) {
    console.error("Load error:", err);
    alert("No session found.");
    window.location.href = "/";
  }
}

function checkCompletion() {
  const isComplete = board.every((val, i) => val === solution[i]);
  if (isComplete) {
    setTimeout(() => {
      const username = localStorage.getItem("username") || prompt("🎉 Puzzle solved! Enter your name:");
      if (username) {
        const difficulty = localStorage.getItem("difficulty") || "easy";
        const score = board.filter(v => v !== 0).length;

        fetch("/api/sudoku/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, score, difficulty })
        }).then(() => {
          alert(" Score submitted!");
          window.location.href = "/";
        }).catch(err => {
          console.error(" Failed to submit score T_T:", err);
        });
      }
    }, 300);
  }
}

async function saveGame() {
  const username = localStorage.getItem("username");
  if (!username) return;

  try {
    await axios.post("/api/sudoku/save", {
      username,
      puzzle: JSON.stringify(originalBoard),
      currentState: JSON.stringify(board),
      solution: JSON.stringify(solution),
      difficulty: localStorage.getItem("difficulty") || "easy"
    });

    alert("Game saved!");
  } catch (err) {
    console.error("Save error:", err);
    alert("Failed to save game.");
  }
}

async function loadSavedGame(username) {
  try {
    const res = await fetch(`/api/sudoku/session/${username}`);
    if (!res.ok) return false;

    const data = await res.json();
    originalBoard = JSON.parse(data.puzzle);
    board = JSON.parse(data.current_state);
    solution = JSON.parse(data.solution);
    createBoard(originalBoard);
    return true;
  } catch (err) {
    console.error(" Error loading saved game :( ):", err);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const username = prompt("Enter your name to load or start a game:");
  localStorage.setItem("username", username);

  const resumed = await loadSavedGame(username);
  if (!resumed) {
    fetchNewGame();
  }
});

function handleNumberInput(number) {
  if (!selectedCell || selectedCell.disabled) return;

  if (number === 0) {
    selectedCell.value = "";
    selectedCell.dispatchEvent(new Event("input"));
  } else {
    selectedCell.value = number;
    selectedCell.dispatchEvent(new Event("input"));
  }
}
document.addEventListener("DOMContentLoaded", () => {
  loadSavedGame();
});

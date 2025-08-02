let board = [];
let originalBoard = [];
let solution = [];

let selectedCell = null;

function createBoard(puzzle) {
  const boardContainer = document.getElementById("sudoku-board");
  boardContainer.innerHTML = "";  // Clear previous board

  board = puzzle.flat().map(v => v === null ? 0 : v);  // Always fresh puzzle
  originalBoard = [...board];

  board.forEach((val, i) => {
    const cell = document.createElement("input");
    cell.maxLength = 1;
    cell.className = "sudoku-cell";

    // Track selected cell
    cell.addEventListener("focus", () => {
      selectedCell = cell;
    });

    if (originalBoard[i] !== 0) {
      // Locked cells (part of the original puzzle, cannot be edited)
      cell.value = originalBoard[i];
      cell.disabled = true;
      cell.style.backgroundColor = "#eee";
    } else {
      // Editable cells (for user input)
      cell.value = val !== 0 ? val : "";
      cell.disabled = false; // Enable the cell for user input

      // Add input validation
      cell.addEventListener("input", () => {
        const entered = parseInt(cell.value) || 0;
        board[i] = entered;

        if (solution && solution.length > 0) {
          // Compare entered value to solution
          if (entered === solution[i]) {
            cell.style.backgroundColor = "#d4fcd4";  // Correct input (green)
          } else {
            cell.style.backgroundColor = "#ffd6d6";  // Incorrect input (red)
          }

          checkCompletion(); // Check if the game is complete
        }
      });

      // Pre-fill cells with correct values based on solution (after saved load)
      if (val !== 0 && solution.length > 0) {
        cell.style.backgroundColor = val === solution[i] ? "#d4fcd4" : "#ffd6d6";
      }
    }

    boardContainer.appendChild(cell); // Append the cell to the board
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

function checkCompletion() {
  const isComplete = board.every((val, i) => val === solution[i]);  // Compare board with solution
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
      solution: JSON.stringify(solution),  // Make sure solution is saved
      difficulty: localStorage.getItem("difficulty") || "easy"
    });

    // Store solution immediately after saving the game
    solution = solution; // Ensure solution is available for future use

    alert("Game saved!");
  } catch (err) {
    console.error("Save error:", err);
    alert("Failed to save game.");
  }
}

async function loadSavedGame() {
  const username = localStorage.getItem("username");
  if (!username) return false;

  try {
    const response = await axios.get(`/api/sudoku/session/${username}`);
    const { puzzle, solution: savedSolution } = response.data;

    createBoard(puzzle);  // Use the saved puzzle
    solution = savedSolution;  // Store solution for validation

    console.log("Loaded saved session for", username);
    return true;
  } catch (err) {
    console.error("Load error:", err);
    alert("No session found.");
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

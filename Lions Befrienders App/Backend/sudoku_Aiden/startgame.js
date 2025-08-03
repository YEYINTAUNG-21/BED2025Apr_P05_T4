const express = require("express");
const axios = require("axios");
const sql = require("mssql");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.static('public'));

app.use(express.json());

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

app.get("/startgame", (req, res) => {
  res.sendFile(path.join(__dirname, "views/gamestart.html"));
});

app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "views/game.html"));
});

app.get("/api/sudoku/generate", async (req, res) => {
  const difficulty = req.query.difficulty || "easy";
  const url = `https://api.api-ninjas.com/v1/sudokugenerate?difficulty=${difficulty}`;
  const key = process.env.API_NINJAS_KEY;

  console.log("➡️ Calling:", url);
  console.log("🔐 Using API Key:", key);

  try {
    const response = await axios.get(url, {
      headers: {
        'X-Api-Key': key
      }
    });

    console.log(" Puzzle fetched:", response.data);
    res.json({
      puzzle: response.data.puzzle,
      solution: response.data.solution
    });

  } catch (error) {
    console.error(" API request failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Body:", error.response.data);
      res.status(500).json({
        error: "API failure",
        status: error.response.status,
        details: error.response.data
      });
    } else {
      console.error(error.message);
      res.status(500).json({ error: "General error", message: error.message });
    }
  }
});

app.post("/api/sudoku/score", async (req, res) => {
  try {
    const { username, score, difficulty } = req.body;

    const pool = await sql.connect(config);
    await pool.request()
      .input("username", sql.VarChar(100), username)
      .input("score", sql.Int, score)
      .input("difficulty", sql.VarChar(20), difficulty)
      .query(`
        INSERT INTO leaderboard_scores (username, score, difficulty)
        VALUES (@username, @score, @difficulty)
      `);

    res.status(200).json({ message: "Score submitted successfully." });
  } catch (err) {
    console.error(" DB Insert Error:", err);
    res.status(500).json({ error: "Failed to save score." });
  }
});

app.get("/api/sudoku/leaderboard", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(
      "SELECT TOP 10 * FROM leaderboard_scores ORDER BY score DESC, created_at ASC"
    );
    res.json(result.recordset);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).send("Failed to load leaderboard");
  }
});

//  Save game state
app.post("/api/sudoku/save", async (req, res) => {
  const { username, puzzle, currentState, solution, difficulty } = req.body;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input("username", sql.VarChar(100), username)
      .input("puzzle", sql.NVarChar(sql.MAX), puzzle)
      .input("currentState", sql.NVarChar(sql.MAX), currentState)
      .input("solution", sql.NVarChar(sql.MAX), solution)
      .input("difficulty", sql.VarChar(20), difficulty)
      .query(`
        MERGE sudoku_sessions AS target
        USING (SELECT @username AS username) AS source
        ON target.username = source.username
        WHEN MATCHED THEN
          UPDATE SET puzzle = @puzzle, current_state = @currentState, solution = @solution, difficulty = @difficulty, updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (username, puzzle, current_state, solution, difficulty)
          VALUES (@username, @puzzle, @currentState, @solution, @difficulty);
      `);

    res.status(200).json({ message: "Session saved " });
  } catch (err) {
    console.error(" DB Save Error:", err);
    res.status(500).json({ error: "Failed to save session." });
  }
});

// Load game session
app.get("/api/sudoku/session/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("username", sql.VarChar(100), username)
      .query("SELECT TOP 1 * FROM sudoku_sessions WHERE username = @username");

    if (result.recordset.length > 0) {
      const session = result.recordset[0];

      const puzzle = session.current_state
        ? JSON.parse(session.current_state)
        : JSON.parse(session.puzzle);

      const solution = JSON.parse(session.solution);  // Ensure the solution is loaded

      res.json({ puzzle, solution });  // Send both puzzle and solution
    } else {
      res.status(404).json({ message: "No saved session" });
    }
  } catch (err) {
    console.error("DB Load Error:", err);
    res.status(500).json({ error: "Failed to load session." });
  }
});




app.listen(process.env.PORT || 3000, () => {
  console.log(" Server running on http://localhost:3000");
});

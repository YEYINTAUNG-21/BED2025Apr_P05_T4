const { sql, config } = require('./db/dbConfig');

(async () => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT TOP 1 * FROM leaderboard_scores');
    console.log("✅ Connected. First row:", result.recordset[0]);
  } catch (err) {
    console.error("❌ DB Error:", err);
  }
})();

const { sql, poolPromise } = require('../../dbConfig');

// Create a new daily check-in record
const createDailyCheckin = async (userId) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO daily_checkins (user_id, checkin_time)
        VALUES (@userId, GETDATE())
      `);
  } catch (error) {
    throw error;
  }
};

// Get all daily check-ins (for monitoring purposes)
const getAllDailyCheckins = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT checkin_id, user_id, checkin_time
        FROM daily_checkins
        ORDER BY checkin_time DESC
      `);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createDailyCheckin,
  getAllDailyCheckins,
};
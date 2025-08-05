const sql = require('mssql');
const dbConfig = require('../config/db_config');

async function getConnection() {
  return await sql.connect(dbConfig);
}

module.exports = {
  fetchAllLogs: async () => {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM ErrorLogs');
    return result.recordset;
  },

  insertLog: async ({ system_error, reason, date_encountered }) => {
    const pool = await getConnection();
    await pool.request()
      .input('system_error', sql.NVarChar, system_error)
      .input('reason', sql.NVarChar, reason)
      .input('date_encountered', sql.Date, date_encountered)
      .query(`
        INSERT INTO ErrorLogs (system_error, reason, date_encountered)
        VALUES (@system_error, @reason, @date_encountered)
      `);
  },

  updateActionTaken: async (id, actions_taken) => {
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .input('actions_taken', sql.NVarChar, actions_taken)
      .query(`
        UPDATE ErrorLogs
        SET actions_taken = @actions_taken
        WHERE id = @id
      `);
  }
};

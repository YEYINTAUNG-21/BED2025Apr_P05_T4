const { sql, poolPromise } = require('../../dbConfig');

const logEmergencyAlert = async (userId) => {
  const pool = await poolPromise;
  return await pool.request()
    .input('userId', sql.Int, userId)
    .query('INSERT INTO emergency_logs (user_id) VALUES (@userId)');
};

const getAllEmergencyLogs = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT log_id, user_id, timestamp, status 
    FROM emergency_logs 
    ORDER BY timestamp DESC
  `);
  return result.recordset;
};

const updateEmergencyLogStatus = async (logId, status) => {
  const pool = await poolPromise;
  return await pool.request()
    .input('logId', sql.Int, logId)
    .input('status', sql.VarChar(20), status)
    .query('UPDATE emergency_logs SET status = @status WHERE log_id = @logId');
};

const deleteEmergencyLogById = async (logId) => {
  const pool = await poolPromise;
  return await pool.request()
    .input('logId', sql.Int, logId)
    .query('DELETE FROM emergency_logs WHERE log_id = @logId');
};

module.exports = {
  logEmergencyAlert,
  getAllEmergencyLogs,
  updateEmergencyLogStatus,
  deleteEmergencyLogById
};
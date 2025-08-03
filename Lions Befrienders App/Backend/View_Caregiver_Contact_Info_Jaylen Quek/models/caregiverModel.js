const { sql, poolPromise } = require('../../dbConfig');


// Create caregiver info
const createCaregiverInfo = async (userId, name, phone, email) => {
  try {
    const pool = await poolPromise;;
    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('name', sql.VarChar(100), name)
      .input('phone', sql.VarChar(20), phone)
      .input('email', sql.VarChar(100), email)
      .query(`
        INSERT INTO user_profile (user_id, caregiver_name, caregiver_phone, caregiver_email)
        VALUES (@userId, @name, @phone, @email)
      `);
  } catch (err) {
    throw err;
  }
};

// Get caregiver info
const getCaregiverById = async (userId) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query('SELECT caregiver_name, caregiver_phone, caregiver_email FROM user_profile WHERE user_id = @userId');

    return result.recordset[0]; // returns undefined if not found
  } catch (err) {
    throw err;
  }
};

// Update caregiver info
const updateCaregiverById = async (userId, name, phone, email) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('name', sql.VarChar(100), name)
      .input('phone', sql.VarChar(20), phone)
      .input('email', sql.VarChar(100), email)
      .query(`
        UPDATE user_profile
        SET caregiver_name = @name,
            caregiver_phone = @phone,
            caregiver_email = @email
        WHERE user_id = @userId
      `);

    return result.rowsAffected[0] > 0; // returns true if at least 1 row updated
  } catch (err) {
    throw err;
  }
};

// Delete caregiver info
const deleteCaregiverById = async (userId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`
      UPDATE user_profile
      SET caregiver_name = NULL,
          caregiver_phone = NULL,
          caregiver_email = NULL
      WHERE user_id = @userId
    `);
  return true;
};

module.exports = {
  getCaregiverById,
  createCaregiverInfo,
  updateCaregiverById,
  deleteCaregiverById
};

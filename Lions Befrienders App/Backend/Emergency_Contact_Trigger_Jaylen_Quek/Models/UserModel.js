const { sql, poolPromise } = require('../../dbConfig');

// Create a new user (for signup)
async function createUser(name, email, password_hash) {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('name', sql.VarChar(100), name)
      .input('email', sql.VarChar(100), email)
      .input('password', sql.VarChar(255), password_hash)
      .query(`
        INSERT INTO Users (full_name, email, password)
        VALUES (@name, @email, @password)
      `);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Get user by email (for login)
async function getUserByEmail(email) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar(100), email)
      .query(`
        SELECT * 
        FROM Users 
        WHERE email = @email
      `);
    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

module.exports = {
  createUser,
  getUserByEmail
};
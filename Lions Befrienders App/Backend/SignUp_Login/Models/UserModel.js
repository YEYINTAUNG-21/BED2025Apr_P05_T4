const { sql, poolPromise } = require('../../dbConfig');

async function getAllUsers() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Users');
    return result.recordset;
  } catch (error) {
    console.error('Database error in getAllUsers:', error);
    throw error;
  }
}

async function getUserById(id) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE user_id = @id');

    if (result.recordset.length === 0) return null;
    return result.recordset[0];
  } catch (error) {
    console.error('Database error in getUserById:', error);
    throw error;
  }
}

async function createUser({ full_name, email, phone_number, password_hash, date_of_birth, gender, language, address }) {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('full_name', sql.VarChar(100), full_name)
      .input('email', sql.VarChar(100), email)
      .input('phone_number', sql.VarChar(20), phone_number)
      .input('password_Hash', sql.VarChar(512), password_hash)
      .input('date_of_birth', sql.Date, date_of_birth)
      .input('gender', sql.Char(1), gender)
      .input('language', sql.VarChar(15), language)
      .input('address', sql.VarChar(100), address)
      .query(`
        INSERT INTO Users (
          full_name, email, phone_number, password_Hash,
          date_of_birth, gender, language, address
        ) VALUES (
          @full_name, @email, @phone_number, @password_Hash,
          @date_of_birth, @gender, @language, @address
        )
      `);

    // After insert, get the user by email to return full data with ID
    return await getUserByEmail(email);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar(100), email)
      .query('SELECT * FROM Users WHERE email = @email');

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

async function getUserByPhoneNumber(phoneNumber) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('phone_number', sql.VarChar(20), phoneNumber)
      .query(`
        SELECT * FROM Users WHERE phone_number = @phone_number
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error fetching user by phone number:', error);
    throw error;
  }
}

async function deleteUser(userId) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query('DELETE FROM Users WHERE user_id = @user_id');

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  getUserByEmail,
  getUserByPhoneNumber,
  deleteUser
};
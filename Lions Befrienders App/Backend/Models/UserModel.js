const sql = require('mssql');
const dbConfig = require('../DB_Configs/db_config');

// Create a new user (for signup)
async function createUser(name, email, password_hash){
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        await connection.request()
            .input('name', sql.VarChar(100), name)
            .input('email', sql.VarChar(100), email)
            .input('password_hash', sql.VarChar(255), password_hash)

            .query(`
                INSERT INTO Users (name, email, password_hash)
                VALUES (@name, @email, @password_hash)
            `);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Get user by email (for login)
async function getUserByEmail(email) {
    let connection;
    try {
        connection= await sql.connect(dbConfig);
        const result = await connection.request()
            .input('email', sql.VarChar(100), email)
            .query(`
                SELECT * 
                FROM Users 
                WHERE email = @email
            `);
        return result.recordset[0];
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    createUser,
    getUserByEmail
}
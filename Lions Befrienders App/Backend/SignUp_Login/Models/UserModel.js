const { sql, config } = require('../../dbConfig');
console.log('Connecting to DB with config:', config)


async function getAllUsers(){
    let connection;

    try{
        connection = await sql.connect(config)
        query ="SELECT * FROM Users"
        const request = connection.request();
        result = await request.query(query);
        return result.recordset;

    }
    catch(error){
        console.error("Database error:", error);
        throw error;
    }
    finally{
        if (connection) {
            try {
              await connection.close();
            } catch (err) {
              console.error("Error closing connection:", err);
            }
        }
    }
}

//get user by id
async function getUserById(id){
    let connection;

    try{
       connection = await sql.connect(config);
        const query = "SELECT * FROM users WHERE user_id = @id";
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(query);
    
        if (result.recordset.length === 0) {
            return null; // Book not found
        }
        
        return result.recordset[0];
    }
    catch(error){
        console.error("Database error:", error);
        throw error;
    }
    finally{
        if (connection) {
            try {
              await connection.close();
            } catch (err) {
              console.error("Error closing connection:", err);
            }
        }
    }

}



async function createUser({full_name, email, phone_number, password_hash, date_of_birth, gender, language, address}) {
    let connection;
    try {
        connection = await sql.connect(config);
        const request = connection.request()
            .input('full_name', sql.VarChar(100), full_name)
            .input('email', sql.VarChar(100), email)
            .input('phone_number', sql.VarChar(20), phone_number)
            .input('password_Hash', sql.VarChar(512), password_hash)
            .input('date_of_birth', sql.Date, date_of_birth)
            .input('gender', sql.Char(1), gender)
            .input('language', sql.VarChar(15), language)
            .input('address', sql.VarChar(100), address)

        const query = `
            INSERT INTO users (
                full_name, email, phone_number, password_Hash, 
                date_of_birth, gender, language, address
            ) 
            VALUES (
                @full_name, @email, @phone_number, @password_Hash, 
                @date_of_birth, @gender, @language, @address
            )
        `;

        
        const insertResult = await request.query(query);
       
        // --- Start Debugging Logs ---
    console.log('Result from INSERT query (rowsAffected):', insertResult.rowsAffected);
    // --- End Debugging Logs ---

    if (insertResult.rowsAffected[0] === 0) {
        // This case should ideally not happen if data is inserted perfectly
        console.error("UserModel.createUser: INSERT query reported 0 rows affected.");
        throw new Error("User creation failed: No row inserted.");
    }

    // 2. Since SCOPE_IDENTITY() / OUTPUT are problematic, retrieve the user using their unique email
    const newlyCreatedUser = await getUserByEmail(email);

    if (!newlyCreatedUser || !newlyCreatedUser.user_id) {
        console.error("UserModel.createUser: Failed to retrieve newly created user by email after insert. User object or ID is missing.");
        throw new Error("Failed to retrieve complete user details after creation (via email lookup).");
    }

    console.log(`New user found via email lookup. User ID: ${newlyCreatedUser.user_id}`);

    return newlyCreatedUser;

       
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
        connection= await sql.connect(config);
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

async function getUserByPhoneNumber(phoneNumber) {
    let connection
    try {
        connection = await sql.connect(config);
        const request = connection.request();
        request.input('phone_number', sql.VarChar(20), phoneNumber); // Ensure type and length match DB schema
        const result = await request.query(`
            SELECT
                user_id,
                full_name,
                email,
                phone_number,
                password_Hash,
                date_of_birth,
                gender,
                language,
                address,
                created_Time
            FROM users
            WHERE phone_number = @phone_number;
        `);
        if (result.recordset && result.recordset.length > 0) {
            return result.recordset[0];
        }
        return null; // User not found
    } catch (err) {
        console.error("Error in UserModel.getUserByPhoneNumber:", err);
        throw err;
    }
}



async function deleteUser(userId) {
    let connection;
    try {
        connection= await sql.connect(config);
        const request = connection.request();
        request.input('user_id', sql.Int, userId);

        const result = await request.query(`
            DELETE FROM users
            WHERE user_id = @user_id;
        `);

        return result.rowsAffected[0] > 0; // Returns true if 1 or more rows were affected (deleted)

    } catch (err) {
        console.error(`Error in UserModel.deleteUser for ID ${userId}:`, err);
        throw err;
    }
}


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    getUserByEmail,
    getUserByPhoneNumber,
    deleteUser

}
const sql = require('mssql');
const dbConfig = require('../../db_config');


async function getAllDoctors(){
    let connection;

    try{
        connection = await sql.connect(dbConfig)
       const query = `
            SELECT 
                d.doctor_id,
                d.doctor_name,
                d.license_number,
                s.name AS specialty_name,
                s.description AS specialty_description,
                d.years_of_experience,
                d.bio,
                d.clinic_address,
                d.second_language
            FROM 
                Doctors AS d
            INNER JOIN 
                Specialties AS s 
            ON 
                d.specialty_id = s.specialty_id;
        `;
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
async function getDoctorById(id) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        // Modified query to join Doctors with Specialties and select the specialty name
        const query = `
            SELECT 
                d.doctor_id,
                d.doctor_name,
                d.license_number,
                s.name AS specialty_name,
                d.years_of_experience,
                s.description AS specialty_description,
                d.bio,
                d.clinic_address,
                d.second_language
            FROM 
                Doctors AS d
            INNER JOIN 
                Specialties AS s 
            ON 
                d.specialty_id = s.specialty_id
            WHERE 
                d.doctor_id = @id;
        `;

        const request = connection.request();
        request.input("id", id); // Input parameter for the doctor_id
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return null; // Doctor not found
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



// Update doctor
async function updateDoctor(){
    let connection;

    try{
        connection = await sql.connect(dbConfig)



        const Query = "UPDATE Users SET username = @username, email = @email WHERE id = @id;"
        
        const{username,email} = bookData
        const request = connection.request()
        request.input("id", id);
        request.input("username",username);
        request.input("email",email);

        const result = await request.query(Query);

        return await getUserById(id);
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


module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor
 
};
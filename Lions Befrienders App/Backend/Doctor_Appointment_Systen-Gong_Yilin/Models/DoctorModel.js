const sql = require('mssql');
const dbConfig = require('../../db_config');

function createUtcTimeDate(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return new Date(Date.UTC(2000, 0, 1, hours, minutes, seconds)); // Use arbitrary date
}

async function getAllDoctors(){
    let connection;

    try{
        connection = await sql.connect(dbConfig)
       const query = `
            SELECT 
                doctor_id,
                doctor_name,
                years_of_experience,
                bio,
                clinic_address,
                second_language,
                image_path
            FROM 
                Doctors;
            
        `;
        const request = connection.request();
        const result = await request.query(query);
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



async function getDoctorsByLanguage(second_language){
    let connection;

    try{
        connection = await sql.connect(dbConfig)
       const query = `
            SELECT 
                doctor_id,
                doctor_name,
                years_of_experience,
                bio,
                clinic_address,
                second_language
            FROM 
                Doctors
            Where
                second_language= @language;
        `;
        const request = connection.request();
        request.input("language",second_language);
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


//get Doctor by id
async function getDoctorById(id) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        // Modified query to join Doctors with Specialties and select the specialty name
        const query = `
            SELECT 
                doctor_id,
                doctor_name,
                years_of_experience,
                bio,
                clinic_address,
                second_language,
                image_path
            FROM 
                Doctors
            WHERE 
                doctor_id = @id;
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

//Return the available time of the doctor everyday in a week
async function getAvailbilityByDoctorId(doctorId) {
    let connection;
       try {
            connection = await sql.connect(dbConfig)
            const result = await connection.request()
                .input('doctor_id', sql.Int, doctorId)
                .query("SELECT availability_id, doctor_id, day_of_week, CONVERT(VARCHAR(8), start_time, 108) AS start_time, CONVERT(VARCHAR(8), end_time, 108) AS end_time, slot_duration_minutes FROM DoctorAvailability WHERE doctor_id = @doctor_id");
            return result.recordset;
        } catch (err) {
            throw new Error(`Error fetching doctor availability by doctor ID: ${err.message}`);
        }
    }

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorsByLanguage,
  getAvailbilityByDoctorId
 
};
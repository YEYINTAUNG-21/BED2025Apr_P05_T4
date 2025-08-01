const sql = require('mssql');
const dbConfig = require('../../db_config');

<<<<<<< HEAD
// function createUtcTimeDate(timeString) {
//     const [hours, minutes, seconds] = timeString.split(':').map(Number);
//     return new Date(Date.UTC(2000, 0, 1, hours, minutes, seconds)); // Use arbitrary date
// }
=======
<<<<<<< HEAD
=======
function createUtcTimeDate(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return new Date(Date.UTC(2000, 0, 1, hours, minutes, seconds)); // Use arbitrary date
}
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
>>>>>>> a0d2b01ec258ba15d77eca0ee5a477354846dece

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
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
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

<<<<<<< HEAD
=======

>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
//get user by id
async function getDoctorById(id) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        // Modified query to join Doctors with Specialties and select the specialty name
        const query = `
            SELECT 
<<<<<<< HEAD
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
=======
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
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
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

<<<<<<< HEAD

=======
async function getDoctorByName(name) {
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
                second_language
            FROM 
                Doctors
            WHERE 
                doctor_name = @name;
        `;

        const request = connection.request();
        request.input("name", name); // Input parameter for the doctor_id
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

async function getAvailabilityByDoctorIdAndDay(id) {
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
                second_language
            FROM 
                Doctors
            WHERE 
                doctor_name = @name;
        `;

        const request = connection.request();
        request.input("ds", id); // Input parameter for the doctor_id
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
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135

// Update doctor
async function updateDoctor(){
    let connection;

    try{
        connection = await sql.connect(dbConfig)

<<<<<<< HEAD


=======
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
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
  getDoctorByName,
  updateDoctor,
  getAvailbilityByDoctorId

 
};
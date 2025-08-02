const sql = require('mssql');
const dbConfig = require('../../db_config');
const { parse, compareAsc, format } = require('date-fns'); // <--- THIS LINE

const { parse, addMinutes, format } = require('date-fns'); // <--- THIS LINE



async function getAllAppointments() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT
                a.appointment_id,
                a.appointment_date,
                a.appointment_time,
                a.reason,
                a.status,
                a.created_at,
                u.user_id,
                u.full_name AS user_full_name,
                u.email AS user_email,
                d.doctor_id,
                d.doctor_name,
                d.clinic_address
            FROM
                Appointments AS a
            INNER JOIN
                users AS u ON a.user_id = u.user_id
            INNER JOIN
                Doctors AS d ON a.doctor_id = d.doctor_id
        `;
        const result = await connection.request().query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database error in getAllAppointments:", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection in getAllAppointments:", err);
            }
        }
    }
}


async function getAppointmentById(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT
                a.appointment_id,
                a.appointment_date,
                CONVERT(VARCHAR(5), a.appointment_time, 108) + '' AS appointment_time, 
                a.reason,
<<<<<<< HEAD
                a.conduct_method,
                a.status,
                a.created_at,
                a.updated_at,
=======
                a.status,
                a.created_at,
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
                u.user_id,
                u.full_name AS user_full_name,
                u.email AS user_email,
                d.doctor_id,
                d.doctor_name,
<<<<<<< HEAD
                d.license_number,
                s.name AS specialty_name,
=======
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
                d.clinic_address
            FROM
                Appointments AS a
            INNER JOIN
                users AS u ON a.user_id = u.user_id
            INNER JOIN
                Doctors AS d ON a.doctor_id = d.doctor_id
<<<<<<< HEAD
            INNER JOIN
                Specialties AS s ON d.specialty_id = s.specialty_id
=======
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
            WHERE
                a.appointment_id = @id;
        `;
        const request = connection.request();
        request.input("id", sql.Int, id); // Specify type for input parameter
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return null; // Appointment not found
        }
        return result.recordset[0];
    } catch (error) {
        console.error(`Database error in getAppointmentById (ID: ${id}):`, error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection in getAppointmentById:", err);
            }
        }
    }
}

async function getAppointmentsByUserId(userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT
                a.appointment_id,
                a.appointment_date,
                CONVERT(VARCHAR(5), a.appointment_time, 108) AS appointment_time, -- Format time to HH:MM
                a.reason,
                a.status,
                a.created_at,
                u.user_id,
                u.full_name AS user_full_name,
                u.email AS user_email,
                d.doctor_id,
                d.doctor_name,
                d.clinic_address
            FROM
                Appointments AS a
            INNER JOIN
                users AS u ON a.user_id = u.user_id
            INNER JOIN
                Doctors AS d ON a.doctor_id = d.doctor_id
            WHERE
                a.user_id = @userId; -- Filter by user_id
            
            
            
        `;

        

        // const query = `
        //         SELECT
        //             a.appointment_id,
        //             a.appointment_date,
        //             CONVERT(VARCHAR(5), a.appointment_time, 108) AS appointment_time, -- Format time to HH:MM
        //             a.reason,
        //             a.status,
        //             a.created_at,
        //             u.user_id,
        //             u.full_name AS user_full_name,
        //             u.email AS user_email,
        //             d.doctor_id,
        //             d.doctor_name,
        //             d.clinic_address
        //         FROM
        //             Appointments AS a
        //         INNER JOIN
        //             users AS u ON a.user_id = u.user_id
        //         INNER JOIN
        //             Doctors AS d ON a.doctor_id = d.doctor_id
        //         WHERE
        //             a.user_id = @user_id
        //         ORDER BY
        //             a.appointment_date DESC, a.appointment_time ASC;
        //     `;


        const request = connection.request();
        request.input("userId", sql.Int, userId); // Specify type for input parameter
        const result = await request.query(query);

        const appointments = result.recordset;
        // Sort in JavaScript:
            // 1. Sort by appointment_date (descending)
            // 2. Then by appointment_time (ascending)
        appointments.sort((a, b) => {
            // Compare dates first (descending)
            const dateComparison = compareAsc(new Date(b.appointment_date), new Date(a.appointment_date));
            if (dateComparison !== 0) {
                return dateComparison;
            }
            // If dates are the same, compare times (ascending)
            // Parse HH:MM strings into Date objects on a dummy date for comparison
            const dummyDate = new Date(2000, 0, 1);
            const timeA = parse(a.appointment_time, 'HH:mm', dummyDate);
            const timeB = parse(b.appointment_time, 'HH:mm', dummyDate);
            return compareAsc(timeA, timeB);
        });



        return appointments; // Returns an array (could be empty if no appointments found)
    } catch (error) {
        console.error(`Database error in getAppointmentsByUserId (User ID: ${userId}):`, error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection in getAppointmentsByUserId:", err);
            }
        }
    }
}


async function createAppointment(appointmentData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            INSERT INTO Appointments (
                user_id,
                doctor_id,
                appointment_date,
                appointment_time,
                reason,
<<<<<<< HEAD
                conduct_method,
=======
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
                status
            )
            VALUES (
                @user_id,
                @doctor_id,
                @appointment_date,
                @appointment_time,
                @reason,
<<<<<<< HEAD
                @conduct_method,
=======
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
                @status
            );
            SELECT SCOPE_IDENTITY() AS appointment_id;
        `;

        //const AppointmentTime = parse(appointmentData.appointment_time, 'HH:mm:ss', new Date(2000, 0, 1));
        
        const [hours, minutes, seconds] = appointmentData.appointment_time.split(':').map(Number);

        const AppointmentTime = new Date(Date.UTC(2000, 0, 1, hours, minutes, seconds));


        const request = connection.request();
        request.input("user_id", sql.Int, appointmentData.user_id);
        request.input("doctor_id", sql.Int, appointmentData.doctor_id);
        request.input("appointment_date", sql.Date, appointmentData.appointment_date);

        request.input("appointment_time", sql.Time, appointmentData.appointment_time);
        request.input("reason", sql.VarChar(500), appointmentData.reason || null); // Allow null
        request.input("conduct_method", sql.VarChar(20), appointmentData.conduct_method);
        request.input("status", sql.VarChar(20), appointmentData.status || 'Scheduled'); // Default to 'Scheduled'

        request.input("appointment_time", sql.Time, AppointmentTime);
        request.input("reason", sql.VarChar(500), appointmentData.reason || null); // Allow null
        request.input("status", sql.VarChar(20), 'Scheduled'); // Default to 'Scheduled'


        const result = await request.query(query);
        const newAppointmentId = result.recordset[0].appointment_id;
        return await getAppointmentById(newAppointmentId);
    } catch (error) {
        console.error("Database error in createAppointment:", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection in createAppointment:", err);
            }
        }
    }
}

async function updateAppointment(id, appointmentData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        

        // Build the SET clause dynamically based on provided data
        const updateFields = [];
        const request = connection.request();
        request.input("id", sql.Int, id); // Always input the ID

        
        updateFields.push("user_id = @user_id");
        request.input("user_id", sql.Int, appointmentData.user_id);
        
        updateFields.push("doctor_id = @doctor_id");
        request.input("doctor_id", sql.Int, appointmentData.doctor_id);
        
        if (appointmentData.appointment_date !== undefined) {
            updateFields.push("appointment_date = @appointment_date");
            request.input("appointment_date", sql.Date, appointmentData.appointment_date);
        }
        if (appointmentData.appointment_time !== undefined) {

            const [hours, minutes, seconds] = appointmentData.appointment_time.split(':').map(Number);

            const AppointmentTime = new Date(Date.UTC(2000, 0, 1, hours, minutes, seconds));

            updateFields.push("appointment_time = @appointment_time");
            request.input("appointment_time", sql.Time, AppointmentTime);
        }
        if (appointmentData.reason !== undefined) {
            updateFields.push("reason = @reason");
            request.input("reason", sql.VarChar(500), appointmentData.reason || null);
            
        }


       
        updateFields.push("status = @status");
        request.input("status", sql.VarChar(20), "Rescheduled");
        


        if (updateFields.length === 0) {
            console.log("No fields to update for appointment ID:", id);
            return await getAppointmentById(id); // Return current state if no updates
        }
         
            

        const query = `
            UPDATE Appointments
            SET
                ${updateFields.join(",\n")}
            WHERE
                appointment_id = @id;
        `;

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return null; // Appointment not found or no changes made
        }
        return await getAppointmentById(id); // Return the updated appointment
    } catch (error) {
        console.error(`Database error in updateAppointment (ID: ${id}):`, error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection in updateAppointment:", err);
            }
        }
    }
}


async function deleteAppointment(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            DELETE FROM Appointments
            WHERE appointment_id = @id;
        `;
        const request = connection.request();
        request.input("id", sql.Int, id);
        const result = await request.query(query);
        return result.rowsAffected[0] > 0; // Returns true if at least one row was affected (deleted)
    } catch (error) {
        console.error(`Database error in deleteAppointment (ID: ${id}):`, error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection in deleteAppointment:", err);
            }
        }
    }
}



async function getByDoctorAndDate(doctorId, date) {
    let connection;
       try {
            // CONVERT appointment_time to HH:MM string in the query
            connection = await sql.connect(dbConfig);
            const result = await connection.request()
                .input('doctor_id', sql.Int, doctorId)
                .input('appointment_date', sql.Date, date)
                .query("SELECT appointment_id, CONVERT(VARCHAR(5), appointment_time, 108) AS appointment_time FROM Appointments WHERE doctor_id = @doctor_id AND appointment_date = @appointment_date AND status IN ('Scheduled', 'Rescheduled')");
            return result.recordset;
        } catch (err) {
            throw new Error(`Error fetching appointments by doctor and date: ${err.message}`);
        }
}


// Export the functions for use in other modules
module.exports = {
    getAllAppointments,
    getAppointmentById,
    getAppointmentsByUserId,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    deleteAppointment,
    getByDoctorAndDate
};
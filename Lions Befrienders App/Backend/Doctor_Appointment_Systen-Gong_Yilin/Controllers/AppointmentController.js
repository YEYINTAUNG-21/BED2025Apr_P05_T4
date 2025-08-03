const AppointmentModel = require("../Models/AppointmentModel"); 


async function getAllAppointments(req, res) {
    try {
        const appointments = await AppointmentModel.getAllAppointments();
        res.json(appointments);
    } catch (error) {
        console.error("Controller error in getAllAppointments:", error);
        res.status(500).json({ error: "Error retrieving appointments" });
    }
}

async function getAppointmentById(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid appointment ID" });
        }

        const appointment = await AppointmentModel.getAppointmentById(id);
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        res.json(appointment);
    } catch (error) {
        console.error("Controller error in getAppointmentById:", error);
        res.status(500).json({ error: "Error retrieving appointment" });
    }
}

async function getAppointmentsByUserId(req, res) {
    try {
        const userId = parseInt(req.params.userId); // Assuming userId comes from /users/:userId/appointments
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const appointments = await AppointmentModel.getAppointmentsByUserId(userId);
        // It's okay if no appointments are found; an empty array [] will be returned.
        res.json(appointments);
    } catch (error) {
        console.error("Controller error in getAppointmentsByUserId:", error);
        res.status(500).json({ error: "Error retrieving appointments for user" });
    }
}

async function createAppointment(req, res) {
    try {
        // req.body should contain: user_id, doctor_id, appointment_date, appointment_time, reason, conduct_method, status (optional)
        const newAppointment = await AppointmentModel.createAppointment(req.body);
        res.status(201).json(newAppointment); // 201 Created
    } catch (error) {
        console.error("Controller error in createAppointment:", error);
        res.status(500).json({ error: "Error creating appointment" });
    }
}


async function updateAppointment(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid appointment ID" });
        }

        // req.body can contain any of the updatable fields
        const updatedAppointment = await AppointmentModel.updateAppointment(id, req.body);

        if (!updatedAppointment) {
            return res.status(404).json({ error: "Appointment not found or no changes made" });
        }

        res.status(200).json(updatedAppointment); // 200 OK for successful update
    } catch (error) {
        console.error("Controller error in updateAppointment:", error);
        res.status(500).json({ error: "Error updating appointment" });
    }
}

async function deleteAppointment(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid appointment ID" });
        }

        const deleted = await AppointmentModel.deleteAppointment(id);

        if (!deleted) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        console.error("Controller error in deleteAppointment:", error);
        res.status(500).json({ error: "Error deleting appointment" });
    }
}

// Get all booked appointments for that doctor on that specific date
async function getByDoctorAndDate(req, res) {
    try {
        const { doctorId, date } = req.params; // date format: YYYY-MM-DD
        const parsedDoctorId = parseInt(doctorId);
        
        if (isNaN(parsedDoctorId) || !date) {
            return res.status(400).json({ message: 'Invalid doctor ID or date provided.' });
        }


        const appointment = await AppointmentModel.getByDoctorAndDate(parsedDoctorId,date);

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }

        res.json(appointment);
    } catch (error) {
        console.error("Controller error in getAppointmentById:", error);
        res.status(500).json({ error: "Error retrieving appointment" });
    }
}

module.exports = {
    getAllAppointments,
    getAppointmentById,
    getAppointmentsByUserId,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getByDoctorAndDate
};

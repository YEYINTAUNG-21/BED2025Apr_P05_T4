const DoctorModel = require("../Models/DoctorModel");
<<<<<<< HEAD

// Get all users
async function getAllDoctors(req, res) {
  try {
    const Doctors = await DoctorModel.getAllDoctors();
=======
const AppointmentModel = require("../Models/AppointmentModel");
  const { parse, addMinutes, format } = require('date-fns'); // <--- THIS LINE

// Get all doctors
async function getAllDoctors(req, res) {
  try {
    const Doctors = await DoctorModel.getAllDoctors();
    if (!Doctors) {
      return res.status(404).json({ error: "doctor not found" });
    }
>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
    res.json(Doctors);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving Doctors" });
  }
}

// Get user by ID
async function getDoctorById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid Doctor ID" });
    }

    const Doctor = await DoctorModel.getDoctorById(id);
    if (!Doctor) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(Doctor);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving Doctor" });
  }
}

<<<<<<< HEAD
=======

async function getDoctorsByLanguage(req, res) {
  try {
    const language = req.params.language;
    if (isNaN(language)) {
      return res.status(400).json({ error: "Invalid Language" });
    }

    const Doctor = await DoctorModel.getDoctorsByLanguage(id);
    if (!Doctor) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(Doctor);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving Doctor" });
  }
}



>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
//update a user
async function updateDoctor(req,res) {
    try{
        const id = parseInt(req.params.id);
       
        const Doctor = await DoctorModel.updateDoctor(id,req.body);
        res.status(201).json(Doctor);
    }
    catch(error){
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error updating user" });
    }
}

<<<<<<< HEAD
//delete a user
=======
async function getAvailbilityByDoctorId(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid Doctor ID" });
    }

    const Doctor = await DoctorModel.getAvailbilityByDoctorId(id);
    if (!Doctor) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(Doctor);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving Doctor" });
  }
}

async function getAvailableSlots(req, res) {
        const { doctorId, date } = req.params; // date format: YYYY-MM-DD
        const parsedDoctorId = parseInt(doctorId);
        
        if (isNaN(parsedDoctorId) || !date) {
            return res.status(400).json({ message: 'Invalid doctor ID or date provided.' });
        }

        try {
            // 1. Get the doctor's general availability blocks
            const availabilityBlocks = await DoctorModel.getAvailbilityByDoctorId(parsedDoctorId);

            // 2. Get all booked appointments for that doctor on that specific date
            const bookedAppointments = await AppointmentModel.getByDoctorAndDate(parsedDoctorId, date);
            const bookedTimes = new Set(bookedAppointments.map(app => app.appointment_time.substring(0, 5))); // Store HH:MM

            // 3. Determine the day of the week for the given date
            const dateObj = new Date(date);
            const dayOfWeek = dateObj.getDay() + 1; // getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday. DB uses 1 for Sunday.

            const allPotentialSlotsWithStatus = [];

            // 4. Generate all potential slots and mark their status
            availabilityBlocks.forEach(block => {
           
                if (block.day_of_week === dayOfWeek) {
                    let currentTime = parse(block.start_time, 'HH:mm:ss', new Date());
                    const endTime = parse(block.end_time, 'HH:mm:ss', new Date());

                    while (currentTime < endTime) {
                        const slotTime = format(currentTime, 'HH:mm'); // Format to HH:MM
                        allPotentialSlotsWithStatus.push({
                            time: slotTime,
                            isBooked: bookedTimes.has(slotTime)
                        });
                        currentTime = addMinutes(currentTime, block.slot_duration_minutes);
                    }
                }
            });

            // Sort the slots to ensure chronological order
            allPotentialSlotsWithStatus.sort((a, b) => a.time.localeCompare(b.time));

            res.json(allPotentialSlotsWithStatus);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };


>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135

module.exports = {
  getAllDoctors,
  getDoctorById,
<<<<<<< HEAD
  updateDoctor
=======
  updateDoctor,
  getAvailbilityByDoctorId,
  getAvailableSlots

>>>>>>> 908467181b20693355f43b0d41e2b6dd05055135
};
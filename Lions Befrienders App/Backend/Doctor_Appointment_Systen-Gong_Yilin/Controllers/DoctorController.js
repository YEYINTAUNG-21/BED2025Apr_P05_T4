const DoctorModel = require("../Models/DoctorModel");

// Get all users
async function getAllDoctors(req, res) {
  try {
    const Doctors = await DoctorModel.getAllDoctors();
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

//delete a user

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor
};
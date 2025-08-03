const missedCheckinModel = require('../models/missedCheckinModel');

// CREATE missed check-in
const createMissedCheckin = async (req, res) => {
    const { user_id, date_missed, days_missed, status, notes } = req.body;

    if (!user_id || !date_missed) {
        return res.status(400).json({ message: "User ID and date missed are required" });
    }

    try {
        await missedCheckinModel.createMissedCheckin(user_id, date_missed, days_missed, status, notes);
        res.status(201).json({ message: "Missed check-in created successfully" });
    } catch (error) {
        console.error("Error creating missed check-in:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// GET all missed check-ins 
const getAllMissedCheckins = async (req, res) => {
    try {
        const data = await missedCheckinModel.getAllMissedCheckins();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching missed check-ins:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// UPDATE missed check-in 
const updateMissedCheckin = async (req, res) => {
    const id = req.params.checkin_id;
    let { status, notes } = req.body;

    if (typeof status === 'undefined') status = null;
    if (typeof notes === 'undefined') notes = null;

    try {
        const updated = await missedCheckinModel.updateMissedCheckinById(id, status, notes);
        if (!updated) {
            return res.status(404).json({ message: "Missed check-in not found" });
        }
        res.status(200).json({ message: "Missed check-in updated successfully" });
    } catch (error) {
        console.error("Error updating missed check-in:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// DELETE missed check-in 
const deleteMissedCheckin = async (req, res) => {
    const id = req.params.checkin_id;

    try {
        await missedCheckinModel.deleteMissedCheckinById(id);
        res.status(200).json({ message: "Missed check-in deleted successfully" });
    } catch (error) {
        console.error("Error deleting missed check-in:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createMissedCheckin,
    getAllMissedCheckins,
    updateMissedCheckin,
    deleteMissedCheckin
};
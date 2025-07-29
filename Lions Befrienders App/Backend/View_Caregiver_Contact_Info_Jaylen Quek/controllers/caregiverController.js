const caregiverModel = require('../models/caregiverModel');

const createCaregiver = async (req, res) => {
    const userId = req.user.user_id;
    const { caregiver_name, caregiver_phone, caregiver_email } = req.body;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    try {
        await caregiverModel.createCaregiver(userId, caregiver_name, caregiver_phone, caregiver_email);
        res.status(201).json({ message: "Caregiver created successfully" });
    } catch (error) {
        console.error("Error creating caregiver:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getCaregiverInfo = async (req, res) => {
    console.log('getCaregiverInfo controller reached');
    console.log('User ID from token:', req.user?.user_id);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
    const userId = req.user.user_id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    try {
        const caregiver = await caregiverModel.getCaregiverById(userId);
        if (!caregiver) {
            console.log('No caregiver found for user:', userId);
        } else {
            console.log('Caregiver data found:', caregiver);
        }
        res.status(200).json(caregiver);
    } catch (error) {
        console.error("Error retrieving caregiver info:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateCaregiver = async (req, res) => {
    const userId = req.user.user_id;
    const { caregiver_name, caregiver_phone, caregiver_email } = req.body;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    try {
        const updated = await caregiverModel.updateCaregiverById(userId, caregiver_name, caregiver_phone, caregiver_email);
        if (!updated) {
            return res.status(404).json({ message: "Caregiver not found" });
        }
        res.status(200).json({ message: "Caregiver updated successfully" });
    } catch (error) {
        console.error("Error updating caregiver:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteCaregiver = async (req, res) => {
    const userId = req.user.user_id;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    try {
        const deleted = await caregiverModel.deleteCaregiverById(userId);
        if (!deleted) {
            return res.status(404).json({ message: "Caregiver not found" });
        }
        return res.status(200).json({ message: "Caregiver deleted successfully" });
    } catch (error) {
        console.error("Error deleting caregiver:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createCaregiver,
    getCaregiverInfo,
    updateCaregiver,
    deleteCaregiver
}
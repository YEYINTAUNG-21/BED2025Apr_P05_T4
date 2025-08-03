const dailyCheckinModel = require('../models/dailyCheckinModel');
const { poolPromise } = require('../../dbConfig'); // Add this line to perform custom DB query

// User creates a check-in
const createDailyCheckin = async (req, res) => {
  const userId = req.user.user_id;  // from JWT auth middleware
  if (!userId) return res.status(401).json({ message: "User not authenticated" });

  try {
    await dailyCheckinModel.createDailyCheckin(userId);

    // NEW: Remove missed check-in for this user (if exists)
    const pool = await poolPromise;
    await pool.request()
      .input('userId', userId)
      .query('DELETE FROM missed_checkins WHERE user_id = @userId');

    res.status(201).json({ message: "Check-in recorded successfully and missed check-in cleared." });
  } catch (error) {
    console.error("Error creating daily check-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all daily check-ins (admin view)
const getAllDailyCheckins = async (req, res) => {
  try {
    const data = await dailyCheckinModel.getAllDailyCheckins();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching daily check-ins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createDailyCheckin,
  getAllDailyCheckins,
};
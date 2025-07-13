const {
  logEmergencyAlert,
  getAllEmergencyLogs,
  updateEmergencyLogStatus,
  deleteEmergencyLogById
} = require('../Models/emergencyModel');

// POST: Create a new emergency alert
const handleEmergencyRequest = async (req, res) => {
  const userId = req.user.userId; // Extract user ID from JWT payload set in authMiddleware
  if (!userId) return res.status(401).json({ message: "User not authenticated" });

  try {
    await logEmergencyAlert(userId);
    res.status(201).json({ message: "Emergency alert logged successfully" });
  } catch (err) {
    console.error("Error logging emergency alert:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET: All emergency logs (admin only)
const getEmergencyLogs = async (req, res) => {
  try {
    const logs = await getAllEmergencyLogs();
    res.json(logs);
  } catch (error) {
    console.error('Error fetching emergency logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH: Update emergency log status (admin only)
const updateEmergencyLog = async (req, res) => {
  const logId = req.params.id;
  const { status } = req.body;

  try {
    await updateEmergencyLogStatus(logId, status);
    res.json({ message: 'Log status updated' });
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE: Remove a specific log (admin only)
const deleteEmergencyLog = async (req, res) => {
  const logId = req.params.id;

  try {
    await deleteEmergencyLogById(logId);
    res.json({ message: 'Emergency log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  handleEmergencyRequest,
  getEmergencyLogs,
  updateEmergencyLog,
  deleteEmergencyLog
};
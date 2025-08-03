const express = require('express');
const router = express.Router();
const {
  handleEmergencyRequest,
  getEmergencyLogs,
  updateEmergencyLog,
  deleteEmergencyLog
} = require('../Controllers/emergencyController');
const verifyJWT = require('../Middleware/authMiddleware');
const verifyAdmin = require('../Middleware/adminMiddleware'); // Fix path if needed

// POST: Create alert
router.post('/emergency-alert', verifyJWT, handleEmergencyRequest);

// Admin-only routes
router.get('/admin/emergency-logs', verifyJWT, verifyAdmin, getEmergencyLogs);
router.patch('/admin/emergency-logs/:id', verifyJWT, verifyAdmin, updateEmergencyLog);
router.delete('/admin/emergency-logs/:id', verifyJWT, verifyAdmin, deleteEmergencyLog);

module.exports = router;
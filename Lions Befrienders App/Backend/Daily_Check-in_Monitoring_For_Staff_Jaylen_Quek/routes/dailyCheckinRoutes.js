const express = require('express');
const router = express.Router();
const dailyCheckinController = require('../controllers/dailyCheckinController');
const verifyJWT = require('../../Emergency_Contact_Trigger_Jaylen_Quek/Middleware/authMiddleware');

// User logs a daily check-in
router.post('/daily-checkin', verifyJWT, dailyCheckinController.createDailyCheckin);

// Admin or staff views all daily check-ins
router.get('/daily-checkins', verifyJWT, dailyCheckinController.getAllDailyCheckins);

module.exports = router;
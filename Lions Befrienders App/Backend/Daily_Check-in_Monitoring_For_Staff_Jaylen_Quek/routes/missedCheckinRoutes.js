const express = require('express');
const router = express.Router();

const verifyJWT = require('../../Emergency_Contact_Trigger_Jaylen_Quek/Middleware/authMiddleware');
const verifyAdmin = require('../../Emergency_Contact_Trigger_Jaylen_Quek/Middleware/adminMiddleware');
const missedCheckinController = require('../controllers/missedCheckinController');

// CREATE a missed check-in log
router.post('/missed-checkins', verifyJWT, missedCheckinController.createMissedCheckin);

// READ all missed check-ins
router.get('/missed-checkins', verifyJWT, (req, res, next) => {
  console.log('GET /missed-checkins called');
  next();
}, missedCheckinController.getAllMissedCheckins);

// UPDATE a missed check-in by ID
router.put('/missed-checkins/:checkin_id', verifyJWT, missedCheckinController.updateMissedCheckin);

// DELETE a missed check-in by ID
router.delete('/missed-checkins/:checkin_id', verifyJWT, missedCheckinController.deleteMissedCheckin);

module.exports = router;
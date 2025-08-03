const express = require('express');
const router = express.Router();

const verifyJWT = require('../../Emergency_Contact_Trigger_Jaylen_Quek/Middleware/authMiddleware');
const caregiverController = require('../controllers/caregiverController')

// GET caregiver info for logged in user 
router.post('/user/caregiver-info', verifyJWT, caregiverController.createCaregiver);
router.get('/user/caregiver-info', verifyJWT, (req, res, next) => {
  console.log('✅ GET /user/caregiver-info called');
  next();
}, caregiverController.getCaregiverInfo);

router.put('/user/caregiver-info', verifyJWT, caregiverController.updateCaregiver);
router.delete('/user/caregiver-info', verifyJWT, caregiverController.deleteCaregiver);

module.exports = router;
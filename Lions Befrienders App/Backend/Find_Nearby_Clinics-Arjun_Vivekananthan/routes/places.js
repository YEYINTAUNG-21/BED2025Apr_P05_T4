const express = require('express');
const router = express.Router();

const nearbyClinicController = require('../controllers/nearbyClinicController');

router.get('/favorites', nearbyClinicController.getFavorites);
router.post('/favorites', nearbyClinicController.addFavorite);
router.delete('/favorites/:clinic_id', nearbyClinicController.removeFavorite);

module.exports = router;

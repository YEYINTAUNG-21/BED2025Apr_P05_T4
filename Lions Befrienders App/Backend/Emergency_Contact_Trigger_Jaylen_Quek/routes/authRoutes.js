// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

// Login Route
router.post('/api/login', authController.loginUser);  // <-- /api/login

// Register Route
router.post('/api/signup', authController.registerUser);

module.exports = router;
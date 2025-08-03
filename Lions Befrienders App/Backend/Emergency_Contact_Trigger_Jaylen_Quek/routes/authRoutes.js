const express = require('express');
const router = express.Router();

const userController = require('../../SignUp_Login/Controllers/userController'); // Adjust path as per folder structure
const { validateSignupData, validateLoginData } = require('../../SignUp_Login/Middleware/validateInput');

// Signup route with validation middleware
router.post('/signup', validateSignupData, userController.signup);

// Login route with validation middleware
router.post('/login', validateLoginData, userController.login);

module.exports = router;
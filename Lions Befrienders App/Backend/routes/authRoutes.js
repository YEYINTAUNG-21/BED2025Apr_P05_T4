const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../Controllers/authController');

const validateInput = require('../Middleware/ValidateInput');

router.post('/login', validateInput.login, loginUser);
router.post('/signup', validateInput.signup, registerUser);

module.exports = router;
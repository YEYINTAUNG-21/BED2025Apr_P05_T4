const express = require('express');
const router = express.Router();
const { submitFeedback } = require('../controllers/contactController');
const { validateContact } = require('../middlewares/validation');

router.post('/', validateContact, submitFeedback);

module.exports = router;

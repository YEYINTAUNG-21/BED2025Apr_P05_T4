const { func } = require("joi");



function isValidEmail(email) {
    // Basic regex for email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates if a string meets password complexity requirements.
 * - Minimum length of 8 characters.
 * - Contains at least one number.
 * - Contains at least one uppercase letter.
 * - Contains at least one lowercase letter.
 * - Contains at least one special character (from a defined set).
 * @param {string} password - The password string to validate.
 * @returns {boolean} True if the password is valid, false otherwise.
 */
function isValidPassword(password) {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    // Regex for common special characters. You can adjust this set.
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;']/;

    return (
        password.length >= minLength &&
        hasNumber.test(password) &&
        hasUpperCase.test(password) &&
        hasLowerCase.test(password) &&
        hasSpecialCharacter.test(password)
    );
}

// --- Middleware Functions ---

/**
 * Middleware to validate signup request data.
 * Checks for presence of required fields, name length, email format, and password complexity.
 * If validation fails, sends a 400 Bad Request response.
 * If validation passes, calls next() to proceed.

 */
function validateSignupData(req, res, next) {
    // Extract fields from request body
    const { full_name, email, password, phone_number, date_of_birth, gender, language, address } = req.body;

    // 1. Check for all required fields (adjust based on your full schema)
    if (!full_name || !email || !password || !phone_number || !date_of_birth || !gender || !language || !address) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // 2. Validate full_name length
    if (full_name.length < 3 || full_name.length > 100) { // Using 100 as per your DB schema
        return res.status(400).json({ error: 'Full name must be between 3 and 100 characters.' });
    }

    // 3. Validate email format
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    // 4. Validate password complexity
    if (!isValidPassword(password)) {
        return res.status(400).json({
            error: `Password must be at least 8 characters long, ` +
                   `contain at least one number, one uppercase letter, ` +
                   `one lowercase letter, and one special character.`
        });
    }

    // 5. Basic validation for other fields (can be expanded)
    if (phone_number.length < 8 || phone_number.length > 20) { // Example length check
        return res.status(400).json({ error: 'Phone number must be between 8 and 20 digits.' });
    }
    // You might want to add more specific date validation, gender/language enum checks here
    // For gender, ensure it's 'M' or 'F' based on your schema
    if (!['M', 'F'].includes(gender)) {
        return res.status(400).json({ error: 'Gender must be "M" or "F".' });
    }
    // For language, ensure it's one of the allowed values
    const allowedLanguages = ['English', 'Mandarin', 'Malay', 'Tamil'];
    if (!allowedLanguages.includes(language)) {
        return res.status(400).json({ error: `Language must be one of: ${allowedLanguages.join(', ')}.` });
    }
    if (address.length < 5 || address.length > 100) { // Example length check
        return res.status(400).json({ error: 'Address must be between 5 and 255 characters.' });
    }

    // If all validations pass, proceed to the next middleware/controller
    next();
}

/**
 * Middleware to validate login request data.
 * Checks for presence of email and password.
 * If validation fails, sends a 400 Bad Request response.
 * If validation passes, calls next() to proceed.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
function validateLoginData(req, res, next) {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    // Optionally, validate email format for login too
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    // If all validations pass, proceed to the next middleware/controller
    next();
}

// Export the middleware functions
module.exports = {
    validateSignupData,
    validateLoginData,
    // You can also export the helper functions if needed elsewhere, e.g.,
    // isValidEmail,
    // isValidPassword
};
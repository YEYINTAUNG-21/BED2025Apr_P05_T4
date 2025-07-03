const { func } = require("joi");

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation
function isValidPassword(password) {
  const minLength = 8;
  const hasNumber = /\d/;
  const hasUpperCase = /[A-Z]/;
  const hasLowerCase = /[a-z]/;
  const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;]/;

  return (
    password.length >= minLength &&
    hasNumber.test(password) &&
    hasUpperCase.test(password) &&
    hasLowerCase.test(password) &&
    hasSpecialCharacter.test(password)
  );
}

function signup(req, res, next){
    const { name, email, password } = req.body;
    if (!name || !email || !password){
        return res.status(400).json({ error: 'Please fill in all fields.' });
    }
    if (name.length < 3 || name.length > 30){
        return res.status(400).json({ error: 'Name must be between 3 and 30 characters.' });
    }
    if (!isValidEmail(email)){
        return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (!isValidPassword(password)){
        return res.status(400).json({ 
            error: `Password must be at least 8 characters long, 
            contain at least one number, one uppercase letter, 
            one lowercase letter, and one special character.`
        });
    }
    next();
}

function login(req, res, next){
    const { email, password } = req.body;
    if (!email || !password){
        return res.status(400).json({ error: 'Please fill in all fields.' });
    }   
    next();
}

module.exports = {
    signup,
    login
}
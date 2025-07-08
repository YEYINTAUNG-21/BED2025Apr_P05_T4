const UserModel = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Signup controller
async function signup(req, res){
    const {name, email, password} = req.body;
    try {
        console.log("Name received:", name);
        const existingUser = await UserModel.getUserByEmail(email);
        if (existingUser){
            return res.status(400).json({message: 'Email already registered'});
        }
        const password_hash = await bcrypt.hash(password, 10);

        await UserModel.createUser(name, email, password_hash);
        res.status(201).json({message: 'Signup successfully'});
    } catch (error) {
        res.status(500).json({error: 'Signup failed' + error.message});
    }
}

// Login controller
async function login(req, res){
    const {email, password} = req.body;
    try {
        const user = await UserModel.getUserByEmail(email);
        if (!user){
            return res.status(404).json({message: 'Incorrect email.'});
        }
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword){
            return res.status(401).json({message: 'Incorrect password.'});
        }
        const token = jwt.sign(
            {user_id: user.user_id, email: user.email, role: 'user'},
            process.env.JWT_SECRET,
            {expiresIn: '3h'}
        );
        res.json({message: 'Login successfully', token});
    } catch (error) {
        res.status(500).json({error: 'Login failed' + error.message});
    }
} 
module.exports = {
    signup,
    login
}
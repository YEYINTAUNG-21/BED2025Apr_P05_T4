const UserModel = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '1h';


async function getAllUsers(req, res) {
  try {
    const users = await UserModel.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving users" });
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    const user = await UserModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving user" });
  }
}




async function signup(req, res) {
  try {
    const {
      full_name,
      email,
      phone_number,
      password,
      date_of_birth,
      gender,
      language,
      address
    } = req.body;

    // 1. Email and phone numver uniqueness
    const existing = await UserModel.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingUserByPhone = await UserModel.getUserByPhoneNumber(phone_number); // Assuming you'll create this model function
    if (existingUserByPhone) {
      return res.status(409).json({ message: 'Phone number already registered.' });
    }

    // 2. Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 3. Create user
    const newUser = await UserModel.createUser({
      full_name,
      email,
      phone_number,
      password_hash,
      date_of_birth,
      gender,
      language,
      address
    });

    // 4. Issue JWT
    const token = jwt.sign(
      { userId: newUser.user_id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Signup successful',
      token,
       user: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone_number: newUser.phone_number,
        date_of_birth: newUser.date_of_birth,
        gender: newUser.gender,
        language: newUser.language,
        address: newUser.address,
        created_Time: newUser.created_Time // Include other fields as needed
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed: ' + err.message });
  }
}



async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Lookup user by email
    const User = await UserModel.getUserByEmail(email);
    if (!User) {
      return res.status(401).json({ message: 'Invalid credentials for email' });
    }

    // 2. Verify password
    const match = await bcrypt.compare(password, User.password_Hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials for password' });
    }

    // 3. Issue JWT
    const token = jwt.sign(
      { userId: User.user_id, email: User.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    
    res.status(200).json({
      message: 'Login successful',
      token,
     user: {
        id: User.user_id,
        full_name: User.full_name,
        email: User.email,
        phone_number: User.phone_number,
        date_of_birth: User.date_of_birth,
        gender: User.gender,
        language: User.language,
        address: User.address,
        created_Time: User.created_Time 
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
}


async function deleteUserAccount(req, res) {
  try {
    const userId = parseInt(req.params.id); // Get ID from URL params
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }

    const isDeleted = await UserModel.deleteUser(userId);

    if (isDeleted) {
      res.status(200).json({ message: 'User deleted successfully.' });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
}

module.exports = {
    getAllUsers,
    getUserById,
    signup,
    login,
    deleteUserAccount
}
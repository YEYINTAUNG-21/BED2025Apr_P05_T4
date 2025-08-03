const { sql, poolPromise } = require('../../dbConfig');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Login handler
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log('[DEBUG] Login attempt:', email); // See what was sent

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('email', sql.VarChar, email.toLowerCase())
      .query('SELECT user_id, full_name, password, role FROM users WHERE LOWER(email) = @email');

    if (result.recordset.length === 0) {
      console.log('[DEBUG] No user found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.recordset[0];

    console.log('[DEBUG] User found:', user.full_name);
    console.log('[DEBUG] Hashed password from DB:', user.password);
    console.log('[DEBUG] Password from form:', password);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('[DEBUG] Passwords do not match');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ user_id: user.user_id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    console.log('[DEBUG] Token created:', token);

    res.json({ token, fullName: user.full_name });
  } catch (err) {
    console.error('[ERROR] Login failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Signup handler
const registerUser = async (req, res) => {
  console.log("Signup request body:", req.body);
  const { name, email, password } = req.body;

  try {
    const pool = await poolPromise;

    const check = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT user_id FROM users WHERE email = @email');

    if (check.recordset.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .query('INSERT INTO users (full_name, email, password, phone_number, date_of_birth, gender, language, address) VALUES (@name, @email, @password, \'00000000\', GETDATE(), \'M\', \'English\', \'Default\')');

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { loginUser, registerUser };
require('dotenv').config();

const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const path = require('path');
const cors = require('cors');



<<<<<<< HEAD:Lions Befrienders App/Backend/app.js
const { getHobbyGroups } = require('./Controllers/HobbyGroupController');
=======
const userController = require('./Controllers/UserController');
const validateInput = require('./Middleware/ValidateInput');
>>>>>>> fc6769bf7eae23a57a9f2eb5749306b946a1e552:Lions Befrienders App/Backend/SignUp_Login/app.js

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, '../..', 'Frontend')));
console.log('Serving static from:', path.join(__dirname, '../..', 'Frontend'));

app.post('/api/signup', validateInput.validateSignupData, userController.signup);
app.post('/api/login', validateInput.validateLoginData, userController.login);
app.get("/users", userController.getAllUsers); // Get all users
app.get("/users/:id", userController.getUserById); // Get user by ID
app.delete("/users/:id", userController.deleteUserAccount); // Delete user


<<<<<<< HEAD:Lions Befrienders App/Backend/app.js
=======

>>>>>>> fc6769bf7eae23a57a9f2eb5749306b946a1e552:Lions Befrienders App/Backend/SignUp_Login/app.js
app.get('/', (req, res) => {
  res.send('Lions Befrienders App backend is running ');
});

<<<<<<< HEAD:Lions Befrienders App/Backend/app.js
app.get('/api/hobby-groups', getHobbyGroups);

const emergencyRoutes = require('./routes/emergencyRoutes');
app.use('/', emergencyRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes); // This handles /login and /signup with validation middleware

=======
>>>>>>> fc6769bf7eae23a57a9f2eb5749306b946a1e552:Lions Befrienders App/Backend/SignUp_Login/app.js
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on('SIGINT', async () => {
  console.log('Server is gracefully shutting down');
  await sql.close();
  console.log('Database connections closed');
  process.exit(0);
});
require('dotenv').config();

const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('./Daily_Check-in_Monitoring_For_Staff_Jaylen_Quek/cron/checkMissedCheckins');

const path = require('path');
const cors = require('cors');



const { getHobbyGroups } = require('../Hobby_Group_YE_YINT_AUNG/Controllers/HobbyGroupController');
const userController = require('./SignUp_Login/Controllers/UserController');
const validateInput = require('./SignUp_Login/Middleware/ValidateInput');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, '../..', 'Frontend')));
console.log('Serving static from:', path.join(__dirname, '../..', 'Frontend'));

app.use('/api', authRoutes);
app.get("/users", userController.getAllUsers); // Get all users
app.get("/users/:id", userController.getUserById); // Get user by ID
app.delete("/users/:id", userController.deleteUserAccount); // Delete user



app.get('/', (req, res) => {
  res.send('Lions Befrienders App backend is running ');
});

app.get('/api/hobby-groups', getHobbyGroups);

const emergencyRoutes = require('./routes/emergencyRoutes');
app.use('/', emergencyRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes); // This handles /login and /signup with validation middleware

const caregiverRoutes = require('./View_Caregiver_Contact_Info_Jaylen Quek/routes/caregiverRoutes');
app.use('/', caregiverRoutes); // This handles caregiver-related routes

const missedCheckinRoutes = require('./routes/missedCheckinRoutes');
app.use('/api/daily-checkins', dailyCheckinRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on('SIGINT', async () => {
  console.log('Server is gracefully shutting down');
  await sql.close();
  console.log('Database connections closed');
  process.exit(0);
});
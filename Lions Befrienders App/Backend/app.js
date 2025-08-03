const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: '../.env' });
require('./Daily_Check-in_Monitoring_For_Staff_Jaylen_Quek/cron/checkMissedCheckins'); // run and register the cron job

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'Frontend')));
console.log('Serving static from:', path.join(__dirname, '..', 'Frontend'));

app.use(cors());

app.get('/', (req, res) => {
  res.send('Lions Befrienders App backend is running ');
});

const emergencyRoutes = require('./Emergency_Contact_Trigger_Jaylen_Quek/routes/emergencyRoutes');
app.use('/', emergencyRoutes);

const authRoutes = require('./Emergency_Contact_Trigger_Jaylen_Quek/routes/authRoutes');
app.use('/', authRoutes); // This handles /login and /signup with validation middleware

const caregiverRoutes = require('./View_Caregiver_Contact_Info_Jaylen Quek/routes/caregiverRoutes');
app.use('/', caregiverRoutes); // This handles caregiver-related routes

const dailyCheckinRoutes = require('./Daily_Check-in_Monitoring_For_Staff_Jaylen_Quek/routes/dailyCheckinRoutes');
app.use('/api', dailyCheckinRoutes);

const missedCheckinRoutes = require('./Daily_Check-in_Monitoring_For_Staff_Jaylen_Quek/routes/missedCheckinRoutes');
app.use('/api', missedCheckinRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on('SIGINT', async () => {
  console.log('Server is gracefully shutting down');
  await sql.close();
  console.log('Database connections closed');
  process.exit(0);
});
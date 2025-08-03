require('dotenv').config();

const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const path = require('path');
const cors = require('cors');



const DoctorController = require('./Controllers/DoctorController');
const AppointmentController = require('./Controllers/AppointmentController');
const userController = require('./Controllers/UserController');
const validateInput = require('./Middleware/ValidateInput');
//const validateInput = require('./Middleware/ValidateInput');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, '../..', 'Frontend')));
console.log('Serving static from:', path.join(__dirname, '../..', 'Frontend'));

app.post('/api/signup', validateInput.validateSignupData, userController.signup);
app.post('/api/login', validateInput.validateLoginData, userController.login);
app.get("/api/users", userController.getAllUsers); // Get all users
app.get("/api/users/:id", userController.getUserById); // Get user by ID
app.get("/users/email/:email", userController.getUserByEmail); // Get user by Email
app.delete("/users/:id", userController.deleteUserAccount); // Delete user

app.get("/api/doctors", DoctorController.getAllDoctors); 
app.get("/api/doctor/:id", DoctorController.getDoctorById); 
 

app.get("/api/appointments", AppointmentController.getAllAppointments); 
app.get("/api/appointment/:id", AppointmentController.getAppointmentById); 
app.get("/api/users/:userId/appointments", AppointmentController.getAppointmentsByUserId); 
app.post("/api/appointments",AppointmentController.createAppointment);
app.put("/api/appointments/:id", AppointmentController.updateAppointment); 
app.delete("/api/appointments/:id",AppointmentController.deleteAppointment);

app.get("/api/availability/:id",DoctorController.getAvailbilityByDoctorId);
app.get("/api/doctorAndDate/:doctorId/:date",AppointmentController.getByDoctorAndDate);
app.get("/api/doctor-availability/:doctorId/:date/slots",DoctorController.getAvailableSlots);

app.get('/', (req, res) => {
  res.send('Lions Befrienders App backend is running ');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on('SIGINT', async () => {
  console.log('Server is gracefully shutting down');
  await sql.close();
  console.log('Database connections closed');
  process.exit(0);
});
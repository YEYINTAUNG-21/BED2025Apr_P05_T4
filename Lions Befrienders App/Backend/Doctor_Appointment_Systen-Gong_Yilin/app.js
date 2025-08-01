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
app.get("/users", userController.getAllUsers); // Get all users
app.get("/users/:id", userController.getUserById); // Get user by ID
app.get("/users/email/:email", userController.getUserByEmail); // Get user by Email
app.delete("/users/:id", userController.deleteUserAccount); // Delete user

app.get("/doctors", DoctorController.getAllDoctors); 
app.get("/doctor/:id", DoctorController.getDoctorById); 
app.put("/doctor/:id", DoctorController.updateDoctor); 

app.get("/api/appointments", AppointmentController.getAllAppointments); 
app.get("/appointment/:id", AppointmentController.getAppointmentById); 
app.get("/api/users/:userId/appointments", AppointmentController.getAppointmentsByUserId); 
app.post("/appointment",AppointmentController.createAppointment);
app.put("/api/appointments/:id", AppointmentController.updateAppointment); 
app.delete("/api/appointments/:id",AppointmentController.deleteAppointment);

app.get("/availability/:id",DoctorController.getAvailbilityByDoctorId);
app.get("/doctorAndDate/:doctorId/:date",AppointmentController.getByDoctorAndDate);
app.get("/doctor-availability/:doctorId/:date/slots",DoctorController.getAvailableSlots);

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
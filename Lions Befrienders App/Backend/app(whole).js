const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

dotenv.config();

// SignUp_Login
const userController = require('./SignUp_Login/Controllers/UserController');
const validateInput = require('./SignUp_Login/Middleware/ValidateInput');
// Hobby_Group
const HobbyGroupController = require('./Hobby_Group_YE_YINT_AUNG/Controllers/HobbyGroupController');
const AdminController = require('./SignUp_Login/Controllers/AdminController');
// Virtual_Event
const eventsController = require('./Virtual_Event_YE_YINT_AUNG/Controllers/eventsController');
const adminAuth = require('./Virtual_Event_YE_YINT_AUNG/Middlewares/adminAuth');
const validateEvent = require('./Virtual_Event_YE_YINT_AUNG/Middlewares/validateEvent');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, '..', 'Frontend')));
console.log('Serving static from:', path.join(__dirname, '..', 'Frontend'));

// SignUp and Login
app.post('/api/signup', validateInput.validateSignupData, userController.signup);
app.post('/api/login', validateInput.validateLoginData, userController.login);
app.post('/api/admin/login', AdminController.adminLogin);

// Multer storage setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'Frontend', 'Images'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Hobby Group
app.get('/api/hobby-groups', HobbyGroupController.getHobbyGroups);
app.post('/api/hobby-groups', upload.single('groupImage'), HobbyGroupController.createHobbyGroup);
app.get('/api/hobby-groups/:id', HobbyGroupController.getHobbyGroupById);
app.get('/api/group-members/:group_id', HobbyGroupController.getGroupMember);
app.post('/api/group-members', HobbyGroupController.joinGroup);
app.put('/api/group-members/:member_id', HobbyGroupController.updateNickname);
app.delete('/api/group-members/:member_id', HobbyGroupController.leaveGroup);

// Virtual Community Events Routes
app.get('/api/events', eventsController.getAllEvents);
app.get('/api/events/:id', eventsController.getEventById);
app.post('/api/events', adminAuth.authenticateToken, adminAuth.authorizeAdmin, validateEvent, eventsController.createEvent);
app.put('/api/events/:id', adminAuth.authenticateToken, adminAuth.authorizeAdmin, validateEvent, eventsController.updateEvent);
app.delete('/api/events/:id', adminAuth.authenticateToken, adminAuth.authorizeAdmin, eventsController.deleteEvent);


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
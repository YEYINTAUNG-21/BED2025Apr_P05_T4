const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const UserController = require('../SignUp_Login/Controllers/UserController');
const HobbyGroupController = require('./Controllers/HobbyGroupController');
// const AdminController = require('./Controllers/AdminController'); // Add later

const validateInput = require('../SignUp_Login/Middleware/ValidateInput');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Static files
app.use(express.static(path.join(__dirname, '../..', 'Frontend')));
console.log('Serving static from:', path.join(__dirname, '../..', 'Frontend'));

// User auth
app.post('/api/signup', validateInput.validateSignupData, UserController.signup);
app.post('/api/login', validateInput.validateSignupData, UserController.login);

// Admin login (future)
// app.post('/admin/login', AdminController.login); 

// Multer storage setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../..', 'Frontend', 'Images'));
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


// Home
app.get('/', (req, res) => {
  res.send('Lion Befrienders App backend is running');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await sql.close();
  process.exit(0);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


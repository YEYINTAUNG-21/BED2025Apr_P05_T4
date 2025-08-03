const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const axios = require("axios");
const Joi = require('joi');
const xss = require('xss');
const nodemailer = require('nodemailer');
const mssql = require('mssql');
const bodyParser = require('body-parser');
dotenv.config();
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};
// SignUp_Login
const userController = require('./SignUp_Login/Controllers/UserController');
const validateInput = require('./SignUp_Login/Middleware/ValidateInput');
const { verifyJWT } = require('./SignUp_Login/Middleware/AuthMiddleware');
// Hobby_Group
const HobbyGroupController = require('./Hobby_Group_YE_YINT_AUNG/Controllers/HobbyGroupController');
const AdminController = require('./SignUp_Login/Controllers/AdminController');
// Virtual_Event
const eventsController = require('./Virtual_Event_YE_YINT_AUNG/Controllers/eventsController');
const adminAuth = require('./Virtual_Event_YE_YINT_AUNG/Middlewares/adminAuth');
const validateEvent = require('./Virtual_Event_YE_YINT_AUNG/Middlewares/validateEvent');
// Community_Post
const communityPostController = require('./Community_Post_YE_YINT_AUNG/Controllers/CommunityPostController');
const uploadCloudinary = require('./Community_Post_YE_YINT_AUNG/Middlewares/CloudinaryUpload');

//Doctor
const DoctorController = require('./Doctor_Appointment_Systen-Gong_Yilin/Controllers/DoctorController');

//Appointment
const AppointmentController = require('./Doctor_Appointment_Systen-Gong_Yilin/Controllers/AppointmentController');

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
app.post('/api/hobby-groups',  verifyJWT(['admin']), upload.single('groupImage'), HobbyGroupController.createHobbyGroup);
app.get('/api/hobby-groups/:id', HobbyGroupController.getHobbyGroupById);
app.get('/api/group-members/:group_id', HobbyGroupController.getGroupMember);
app.post('/api/group-members', HobbyGroupController.joinGroup);
app.put('/api/group-members/:member_id', HobbyGroupController.updateNickname);
app.delete('/api/group-members/:member_id', HobbyGroupController.leaveGroup);

// Virtual Community Events Routes
app.get('/api/events', eventsController.getAllEvents);
app.get('/api/events/:id', eventsController.getEventById);
app.post('/api/events', verifyJWT(['admin']), validateEvent, eventsController.createEvent);
app.put('/api/events/:id', verifyJWT(['admin']), validateEvent, eventsController.updateEvent);
app.delete('/api/events/:id', verifyJWT(['admin']), eventsController.deleteEvent);

// Community Post Routes
app.get('/api/posts', communityPostController.getAllPosts);
app.get('/api/posts/:post_id', communityPostController.getPostById);
app.post('/api/posts', verifyJWT(['user']), uploadCloudinary.single('image'), communityPostController.createPost);
app.put('/api/posts/:post_id',
  verifyJWT(['user']),
  uploadCloudinary.any(), 
  communityPostController.updatePost
);
app.delete('/api/posts/:post_id', verifyJWT(['user']), communityPostController.deletePost);
app.get('/api/posts-likes', verifyJWT(['user']), communityPostController.getPostLikes);
app.post('/api/posts/:post_id/like', verifyJWT(['user']), communityPostController.toggleLike);

//Doctors routes
app.get("/api/doctors", DoctorController.getAllDoctors); 
app.get("/api/doctor/:id", DoctorController.getDoctorById);

app.get("/api/availability/:id",DoctorController.getAvailbilityByDoctorId);
app.get("/api/doctor-availability/:doctorId/:date/slots",DoctorController.getAvailableSlots);
//Appointment routes
app.get("/api/appointments", AppointmentController.getAllAppointments); 
app.get("/api/appointment/:id", AppointmentController.getAppointmentById); 
app.get("/api/users/:userId/appointments", AppointmentController.getAppointmentsByUserId); 
app.get("/api/doctorAndDate/:doctorId/:date",AppointmentController.getByDoctorAndDate);

app.post("/api/appointments",AppointmentController.createAppointment);
app.put("/api/appointments/:id", AppointmentController.updateAppointment); 
app.delete("/api/appointments/:id",AppointmentController.deleteAppointment);

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


// ✅ Serve the Sudoku game UI
app.use('/sudoku', express.static(path.join(__dirname, 'sudoku_Aiden/public')));
app.use(express.json());
// Game route now loads game.html
app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "sudoku_Aiden/views/game.html"));
});

// Old start screen now moved to /gamestart
app.get("/gamestart", (req, res) => {
  res.sendFile(path.join(__dirname, "sudoku_Aiden/views/gamestart.html"));
});


// ✅ Generate new puzzle
app.get("/api/sudoku/generate", async (req, res) => {
  const difficulty = req.query.difficulty || "easy";
  const url = `https://api.api-ninjas.com/v1/sudokugenerate?difficulty=${difficulty}`;
  const key = process.env.API_NINJAS_KEY;

  try {
    const response = await axios.get(url, {
      headers: { 'X-Api-Key': key }
    });

    res.json({
      puzzle: response.data.puzzle,
      solution: response.data.solution
    });

  } catch (error) {
    console.error("API request failed:", error);
    res.status(500).json({ error: "Failed to generate puzzle" });
  }
});

// ✅ Save score
app.post("/api/sudoku/score", async (req, res) => {
  try {
    const { username, score, difficulty } = req.body;

    const pool = await sql.connect(config);
    await pool.request()
      .input("username", sql.VarChar(100), username)
      .input("score", sql.Int, score)
      .input("difficulty", sql.VarChar(20), difficulty)
      .query(`
        INSERT INTO leaderboard_scores (username, score, difficulty)
        VALUES (@username, @score, @difficulty)
      `);

    res.status(200).json({ message: "Score submitted successfully." });
  } catch (err) {
    console.error("DB Insert Error:", err);
    res.status(500).json({ error: "Failed to save score." });
  }
});

// ✅ Get leaderboard
app.get("/api/sudoku/leaderboard", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(
      "SELECT TOP 10 * FROM leaderboard_scores ORDER BY score DESC, created_at ASC"
    );
    res.json(result.recordset);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).send("Failed to load leaderboard");
  }
});

// ✅ Save game session
app.post("/api/sudoku/save", async (req, res) => {
  const { username, puzzle, currentState, solution, difficulty } = req.body;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input("username", sql.VarChar(100), username)
      .input("puzzle", sql.NVarChar(sql.MAX), puzzle)
      .input("currentState", sql.NVarChar(sql.MAX), currentState)
      .input("solution", sql.NVarChar(sql.MAX), solution)
      .input("difficulty", sql.VarChar(20), difficulty)
      .query(`
        MERGE sudoku_sessions AS target
        USING (SELECT @username AS username) AS source
        ON target.username = source.username
        WHEN MATCHED THEN
          UPDATE SET puzzle = @puzzle, current_state = @currentState, solution = @solution, difficulty = @difficulty, updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (username, puzzle, current_state, solution, difficulty)
          VALUES (@username, @puzzle, @currentState, @solution, @difficulty);
      `);

    res.status(200).json({ message: "Session saved" });
  } catch (err) {
    console.error("DB Save Error:", err);
    res.status(500).json({ error: "Failed to save session." });
  }
});

// ✅ Load game session
app.get("/api/sudoku/session/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("username", sql.VarChar(100), username)
      .query("SELECT TOP 1 * FROM sudoku_sessions WHERE username = @username");

    if (result.recordset.length > 0) {
      const session = result.recordset[0];

      const puzzle = session.current_state
        ? JSON.parse(session.current_state)
        : JSON.parse(session.puzzle);

      const solution = JSON.parse(session.solution);

      res.json({ puzzle, solution });
    } else {
      res.status(404).json({ message: "No saved session" });
    }
  } catch (err) {
    console.error("DB Load Error:", err);
    res.status(500).json({ error: "Failed to load session." });
  }
});
//delete game session
app.delete("/api/sudoku/session/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("username", sql.VarChar(100), username)
      .query("DELETE FROM sudoku_sessions WHERE username = @username");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "No session found to delete." });
    }

    res.status(200).json({ message: "Session deleted successfully." });
  } catch (err) {
    console.error("DB Delete Error:", err);
    res.status(500).json({ error: "Failed to delete session." });
  }
});

// ✅ Contact Us Form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
// Serve contact form HTML
app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/html/contact.html"));
});
app.use('/images', express.static(path.join(__dirname, 'images')));
app.post("/submit", async (req, res) => {
  const { email, subject, description } = req.body;

  const sanitizedEmail = xss(email);
  const sanitizedSubject = xss(subject);
  const sanitizedDescription = xss(description);

  const schema = Joi.object({
    email: Joi.string().email().required(),
    subject: Joi.string().min(1).max(255).required(),
    description: Joi.string().min(1).required()
  });

  const { error } = schema.validate({
    email: sanitizedEmail,
    subject: sanitizedSubject,
    description: sanitizedDescription
  });

  if (error) {
    return res.status(400).send(`Invalid input: ${error.details[0].message}`);
  }

  try {
    await mssql.connect(dbConfig);
    await mssql.query(`
      INSERT INTO SurveyResponses (email, subject, description)
      VALUES ('${sanitizedEmail}', '${sanitizedSubject}', '${sanitizedDescription}')
    `);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: sanitizedEmail,
      subject: 'Thank you for contacting us!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; max-width: 600px; margin: 0 auto;">
          <img src="cid:logo" alt="Logo" style="width: 300px; display: block; margin: 0 auto;" />
          <h1>Thank you for contacting us!</h1>
          <p>Subject: ${sanitizedSubject}</p>
          <p>Description: ${sanitizedDescription}</p>
          <p>Submitted At: ${new Date().toLocaleString()}</p>
        </div>
      `,
      attachments: [
        {
          filename: 'logo.jpeg',
          path: path.join(__dirname, 'images/logo.jpeg'),
          cid: 'logo'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.send('Thank you for your submission! A receipt has been sent to your email.');
    res.redirect('/frontend/html/index.html');

  } catch (err) {
    console.error("Error submitting form:", err);
    res.status(500).send("Something went wrong. Please try again.");
  }
});

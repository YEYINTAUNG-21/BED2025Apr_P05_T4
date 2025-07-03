const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const userController = require('./Controllers/UserController');
const validateInput = require('./Middleware/ValidateInput');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'Frontend')));
console.log('Serving static from:', path.join(__dirname, '..', 'Frontend'));

app.post('/signup', validateInput.signup, userController.signup);
app.post('/login', validateInput.login, userController.login);

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
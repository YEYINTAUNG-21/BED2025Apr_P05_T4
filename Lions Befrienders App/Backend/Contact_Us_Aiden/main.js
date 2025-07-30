require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// ✅ FIXED path to point to Home page correctly
app.use(express.static(path.join(__dirname, '../../Home page')));

// DO NOT REMOVE: your contact routes and DB config
const contactRoutes = require('./routes/contactRoutes');
const dbConfig = require('../dbConfig');
console.log('[dbConfig loaded]', dbConfig);

const sql = require('mssql');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../Home page')));
app.use('/api/contact', contactRoutes);

// ✅ KEEP your original listener
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

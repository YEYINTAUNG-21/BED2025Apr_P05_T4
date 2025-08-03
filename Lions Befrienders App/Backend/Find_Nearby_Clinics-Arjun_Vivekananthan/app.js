const express = require('express');
const app = express();
const placesRouter = require('./routes/places');
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', placesRouter);

// Server start
app.listen(5501, () => {
  console.log('Server running on http://localhost:5501');
});

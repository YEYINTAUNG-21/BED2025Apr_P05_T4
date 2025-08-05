const express = require('express');
const path = require('path');
const { logRequest, isAdmin } = require('./middleware/authMiddleware');
const controller = require('./Controllers/medicalRecordsController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(logRequest);

// API Routes
app.get('/api/medical-records', controller.getAllMedicalRecords);
app.get('/api/medical-records/:id', controller.getMedicalRecordById);
app.post('/api/medical-records', controller.addMedicalRecord);
app.put('/api/medical-records/:id', controller.updateMedicalRecord);
app.delete('/api/medical-records/:id', controller.deleteMedicalRecord);

// Fallback for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'medical_records.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

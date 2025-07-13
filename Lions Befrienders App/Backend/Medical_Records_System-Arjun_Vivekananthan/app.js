const express = require('express');
const { logRequest, isAdmin } = require('./middleware/authMiddleware');
const MedicalRecordModel = require('./models/medicalRecord');

const app = express();
app.use(express.json());
app.use(logRequest);

// GET all medical records
app.get('/api/medical-records', async (req, res) => {
    try {
        const records = await MedicalRecordModel.fetchAllRecords();
        res.status(200).json(records);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ error: 'Failed to retrieve medical records.' });
    }
});

// create new record (admin only)
app.post('/api/medical-records', isAdmin, async (req, res) => {
    try {
        const { purpose_of_visit, medication_received, visit_date, remarks } = req.body;
        await MedicalRecordModel.insertRecord({
            purpose_of_visit,
            medication_received,
            visit_date,
            remarks
        });
        res.status(201).json({ message: 'Medical record created successfully.' });
    } catch (err) {
        console.error('Error creating record:', err);
        res.status(500).json({ error: 'Failed to create medical record.' });
    }
});

// update record (admin only)
app.put('/api/medical-records/:id', isAdmin, async (req, res) => {
    const recordId = parseInt(req.params.id);
    if (isNaN(recordId)) return res.status(400).json({ error: 'Invalid record ID' });

    try {
        const { purpose_of_visit, medication_received, visit_date, remarks } = req.body;
        await MedicalRecordModel.updateRecord(recordId, {
            purpose_of_visit,
            medication_received,
            visit_date,
            remarks
        });
        res.status(200).json({ message: 'Medical record updated successfully.' });
    } catch (err) {
        console.error('Error updating record:', err);
        res.status(500).json({ error: 'Failed to update record.' });
    }
});

// Root health check
app.get('/', (req, res) => {
    res.send('🩺 Medical Records API is live.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

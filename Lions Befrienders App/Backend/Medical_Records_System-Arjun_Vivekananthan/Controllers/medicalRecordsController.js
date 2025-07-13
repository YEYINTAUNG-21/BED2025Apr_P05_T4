const MedicalRecordModel = require('../Models/MedicalRecordModel');
const { logRequest, isAdmin } = require('./Middlewares/medicalRecordMiddleware');

const app = express();
app.use(express.json());
app.use(logRequest);

// Get all medical records
async function getAllMedicalRecords(req, res) {
    try {
        const records = await MedicalRecordModel.fetchAllRecords();
        console.log('Retrieved all medical records.');
        res.status(200).json(records);
    } catch (error) {
        console.error('Error fetching medical records:', error);
        res.status(500).json({ error: 'Unable to fetch medical records.' });
    }
}

// Add a new medical record
async function addMedicalRecord(req, res) {
    try {
        const { purpose_of_visit, medication_received, visit_date, remarks } = req.body;

        await MedicalRecordModel.insertRecord({
            purpose_of_visit,
            medication_received,
            visit_date,
            remarks
        });

        res.status(201).json({ message: 'Medical record successfully added.' });
    } catch (error) {
        console.error('Error adding medical record:', error);
        res.status(500).json({ error: 'Failed to add medical record.' });
    }
}

// Edit a medical record
async function updateMedicalRecord(req, res) {
    const recordId = parseInt(req.params.id);
    if (isNaN(recordId)) {
        return res.status(400).json({ error: 'Invalid record ID' });
    }

    try {
        const { purpose_of_visit, medication_received, visit_date, remarks } = req.body;

        await MedicalRecordModel.updateRecord(recordId, {
            purpose_of_visit,
            medication_received,
            visit_date,
            remarks
        });

        res.status(200).json({ message: 'Medical record updated successfully.' });
    } catch (error) {
        console.error('Error updating medical record:', error);
        res.status(500).json({ error: 'Failed to update record.' });
    }
}

// Delete medical record
async function deleteMedicalRecord(req, res) {
    const recordId = parseInt(req.params.id);
    if (isNaN(recordId)) {
        return res.status(400).json({ error: 'Invalid record ID' });
    }

    try {
        await MedicalRecordModel.deleteRecord(recordId);
        res.status(200).json({ message: 'Medical record deleted successfully.' });
    } catch (error) {
        console.error(' Error deleting medical record:', error);
        res.status(500).json({ error: 'Failed to delete record.' });
    }
}

module.exports = {
    getAllMedicalRecords,
    getMedicalRecordById,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
};

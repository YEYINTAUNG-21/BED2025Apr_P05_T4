const MedicalRecordModel = require('../Models/MedicalRecordModel');

// Get all records
async function getAllMedicalRecords(req, res) {
  try {
    const records = await MedicalRecordModel.fetchAllRecords();
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medical records.' });
  }
}

// Get record by ID
async function getMedicalRecordById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const record = await MedicalRecordModel.fetchRecordById(id);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch record.' });
  }
}

// Add new
async function addMedicalRecord(req, res) {
  try {
    const { purpose_of_visit, medication_received, visit_date, remarks } = req.body;
    await MedicalRecordModel.insertRecord({ purpose_of_visit, medication_received, visit_date, remarks });
    res.status(201).json({ message: 'Medical record added.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add record.' });
  }
}

// Update
async function updateMedicalRecord(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { purpose_of_visit, medication_received, visit_date, remarks } = req.body;
    await MedicalRecordModel.updateRecord(id, { purpose_of_visit, medication_received, visit_date, remarks });
    res.status(200).json({ message: 'Record updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update record.' });
  }
}

// Delete
async function deleteMedicalRecord(req, res) {
  try {
    const id = parseInt(req.params.id);
    await MedicalRecordModel.deleteRecord(id);
    res.status(200).json({ message: 'Record deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete record.' });
  }
}

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
};

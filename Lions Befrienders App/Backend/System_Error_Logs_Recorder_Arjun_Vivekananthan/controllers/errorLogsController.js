const ErrorLogModel = require('../models/ErrorLogModel');

async function getAllErrorLogs(req, res) {
  try {
    const logs = await ErrorLogModel.fetchAllLogs();
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch error logs.' });
  }
}

async function createErrorLog(req, res) {
  try {
    const { system_error, reason, date_encountered } = req.body;
    await ErrorLogModel.insertLog({ system_error, reason, date_encountered });
    res.status(201).json({ message: 'Error log added.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add error log.' });
  }
}

async function updateErrorLogAction(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { actions_taken } = req.body;
    await ErrorLogModel.updateActionTaken(id, actions_taken);
    res.status(200).json({ message: 'Actions taken updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update actions taken.' });
  }
}

module.exports = {
  getAllErrorLogs,
  createErrorLog,
  updateErrorLogAction,
};

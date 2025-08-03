
const sql = require('mssql');
const dbConfig = require('../config/db_config');

// connect to DB
async function getConnection() {
  try {
    return await sql.connect(dbConfig);
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

module.exports = {
  fetchAllRecords: async () => {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM MedicalRecords');
    return result.recordset;
  },

  fetchRecordById: async (id) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM MedicalRecords WHERE id = @id');
    return result.recordset[0];
  },

  insertRecord: async (record) => {
    const { purpose_of_visit, medication_received, visit_date, remarks } = record;
    const pool = await getConnection();
    await pool.request()
      .input('purpose_of_visit', sql.NVarChar, purpose_of_visit)
      .input('medication_received', sql.NVarChar, medication_received)
      .input('visit_date', sql.Date, visit_date)
      .input('remarks', sql.NVarChar, remarks)
      .query(`
        INSERT INTO MedicalRecords (purpose_of_visit, medication_received, visit_date, remarks)
        VALUES (@purpose_of_visit, @medication_received, @visit_date, @remarks)
      `);
  },

  updateRecord: async (id, record) => {
    const { purpose_of_visit, medication_received, visit_date, remarks } = record;
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .input('purpose_of_visit', sql.NVarChar, purpose_of_visit)
      .input('medication_received', sql.NVarChar, medication_received)
      .input('visit_date', sql.Date, visit_date)
      .input('remarks', sql.NVarChar, remarks)
      .query(`
        UPDATE MedicalRecords
        SET purpose_of_visit = @purpose_of_visit,
            medication_received = @medication_received,
            visit_date = @visit_date,
            remarks = @remarks
        WHERE id = @id
      `);
  },

  deleteRecord: async (id) => {
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM MedicalRecords WHERE id = @id');
  }
};


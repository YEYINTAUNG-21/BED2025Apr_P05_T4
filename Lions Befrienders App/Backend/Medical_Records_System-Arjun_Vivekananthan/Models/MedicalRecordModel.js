const sql = require('mssql');
const dbConfig = require('../../db_config');


async function fetchAllRecords() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request().query(`
            SELECT * FROM MedicalRecords
        `);
        return result.recordset;
    } 
    
    finally {
        if (connection) await connection.close();
    }
}

async function insertRecord(data) {

    const {
        purpose_of_visit,
        medication_received,
        visit_date,
        remarks
    } = data;

    const connection = await sql.connect(dbConfig);

    await connection.request()
        .input('purpose_of_visit', sql.NVarChar, purpose_of_visit)
        .input('medication_received', sql.NVarChar, medication_received)
        .input('visit_date', sql.Date, visit_date)
        .input('remarks', sql.NVarChar(sql.MAX), remarks)
        .query(`
            INSERT INTO MedicalRecords (purpose_of_visit, medication_received, visit_date, remarks)
            VALUES (@purpose_of_visit, @medication_received, @visit_date, @remarks)
        `);
}

async function updateRecord(record_id, data) {

    const {
        purpose_of_visit,
        medication_received,
        visit_date,
        remarks
    } = data;

    const connection = await sql.connect(dbConfig);

    await connection.request()
        .input('record_id', sql.Int, record_id)
        .input('purpose_of_visit', sql.NVarChar, purpose_of_visit)
        .input('medication_received', sql.NVarChar, medication_received)
        .input('visit_date', sql.Date, visit_date)
        .input('remarks', sql.NVarChar(sql.MAX), remarks)
        .query(`
            UPDATE MedicalRecords
            SET purpose_of_visit = @purpose_of_visit,
                medication_received = @medication_received,
                visit_date = @visit_date,
                remarks = @remarks
            WHERE record_id = @record_id
        `);
}

async function deleteRecord(record_id) {
    
    const connection = await sql.connect(dbConfig);

    await connection.request()
        .input('record_id', sql.Int, record_id)
        .query(`
            DELETE FROM MedicalRecords WHERE record_id = @record_id
        `);
}

module.exports = {
    fetchAllRecords,
    fetchRecordById,
    insertRecord,
    updateRecord,
    deleteRecord
};


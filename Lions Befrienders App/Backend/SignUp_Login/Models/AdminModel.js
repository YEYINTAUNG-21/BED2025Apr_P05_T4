const sql = require('mssql');
const dbConfig = require('../../db_config');
// Admin employee ID = EMP002
// Password = admin123
async function getAdminByEmployeeId(employee_id){
    const connection = await sql.connect(dbConfig);
    const result = await connection.request()
        .input('employee_id', sql.VarChar(50), employee_id)
        .query(`
            SELECT * 
            FROM Admin 
            WHERE employee_id = @employee_id
        `);
    return result.recordset[0];
}

module.exports = {
    getAdminByEmployeeId
};
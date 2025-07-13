const sql = require('mssql');
const dbConfig = require('../dbConfig');

async function fetchGroupsWithGroupMemberCount(){
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request().query(`
            SELECT
             hg.group_id,
             hg.group_name,
             hg.description,
             hg.image_url,
             COUNT(gm.user_id) AS members
            From HobbyGroups hg
            LEFT JOIN GroupMembers gm ON hg.group_id = gm.group_id
            GROUP BY hg.group_id, hg.group_name, hg.description, hg.image_url
            `);
        return result.recordset;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    fetchGroupsWithGroupMemberCount
};
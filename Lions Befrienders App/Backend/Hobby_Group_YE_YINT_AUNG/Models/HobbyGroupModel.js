const sql = require('mssql');
const dbConfig = require('../../db_config');

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

async function insertGroup(groupData) {
    const {
        group_name,
        description,
        image_url,
        meetup_date,
        meetup_time,
        meetup_location,
        created_by_admin_id
    } = groupData;

    const connection = await sql.connect(dbConfig);
    await connection.request()
        .input('group_name', sql.NVarChar, group_name)
        .input('description', sql.NVarChar, description)
        .input('image_url', sql.NVarChar, image_url)
        .input('meetup_date', sql.Date, meetup_date)
        .input('meetup_time', sql.Time, new Date(`1970-01-01T${meetup_time}`))
        .input('meetup_location', sql.NVarChar, meetup_location)
        .input('created_by_admin_id', sql.Int, created_by_admin_id)
        .query(`
            INSERT INTO HobbyGroups (group_name, description, image_url, meetup_date, meetup_time, meetup_location, created_by_admin_id)
            VALUES (@group_name, @description, @image_url, @meetup_date, @meetup_time, @meetup_location, @created_by_admin_id);
        `);
}

module.exports = {
    fetchGroupsWithGroupMemberCount,
    insertGroup
};
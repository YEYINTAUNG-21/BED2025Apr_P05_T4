const { sql, poolPromise } = require('../../dbConfig');

// CREATE missed check-in
const createMissedCheckin = async (userId, dateMissed, daysMissed, status, notes) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input("userId", sql.Int, userId)
            .input("dateMissed", sql.Date, dateMissed)
            .input("daysMissed", sql.Int, daysMissed)
            .input("status", sql.VarChar(50), status)
            .input("notes", sql.VarChar(sql.MAX), notes)
            .query(`
                INSERT INTO missed_checkins (user_id, last_checkin_date, days_missed, status, notes)
                VALUES (@userId, @dateMissed, @daysMissed, @status, @notes)
            `);
    } catch (error) {
        throw error;
    }
};

// GET all missed check-ins 
const getAllMissedCheckins = async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                m.checkin_id,
                m.user_id,
                u.full_name AS senior_name,
                m.last_checkin_date,
                m.days_missed,
                m.status,
                m.notes,
                m.created_at
            FROM missed_checkins m
            JOIN users u ON m.user_id = u.user_id
            ORDER BY m.last_checkin_date DESC
        `);
        return result.recordset;
    } catch (error) {
        throw error;
    }
};

// UPDATE missed check-in by ID
const updateMissedCheckinById = async (checkin_id, status, notes) => {
    try {
        const pool = await poolPromise;
        const request = await pool.request().input("checkin_id", sql.Int, checkin_id)

        let setClauses = [];
        
        if (status !== null && status !== undefined) {
            request.input("status", sql.VarChar(50), status);
            setClauses.push("status = @status");
        }

        if (notes !== null && notes !== undefined) {
            request.input("notes", sql.VarChar(sql.MAX), notes)
            setClauses.push("notes = @notes");
        }

        if (setClauses.length === 0) return false;

        const query = `
            UPDATE missed_checkins
            SET ${setClauses.join(", ")}
            WHERE checkin_id = @checkin_id
        `;
        const result = await request.query(query);
        return result.rowsAffected[0] > 0;
    } catch (error) {
        throw error;
    }
};

// DELETE missed check-in by ID
const deleteMissedCheckinById = async (checkin_id) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
        .input("checkin_id", sql.Int, checkin_id)
        .query(`
            DELETE FROM missed_checkins 
            WHERE checkin_id = @checkin_id
        `);
        return true;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllMissedCheckins,
    createMissedCheckin, 
    updateMissedCheckinById,
    deleteMissedCheckinById
}
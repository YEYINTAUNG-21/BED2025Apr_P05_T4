const sql = require('mssql');
const config = require('../../db_config');

async function getAllEvents() {
    let connection;
    try {
        connection = await sql.connect(config);
        const result = await connection.request()
            .query(`SELECT * FROM EventsTable ORDER BY datetime`);
        return result.recordset;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function getEventById(id) {
    let connection;
    try {
        connection = await sql.connect(config);
        const result = await connection.request()
            .input('id', sql.Int, id)
            .query(`SELECT * FROM EventsTable WHERE event_id = @id`);
        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createEvent(event){
    let connection;
    try {
        connection = await sql.connect(config);
        await connection.request()
            .input('title', sql.NVarChar, event.title)
            .input('description', sql.NVarChar, event.description)
            .input('datetime', sql.DateTime, event.datetime)
            .input('youtube_link', sql.NVarChar, event.youtube_link)
            .input('thumbnail', sql.NVarChar, event.thumbnail) // fixed typo here
            .input('video_title', sql.NVarChar, event.video_title)
            .input('duration', sql.VarChar, event.duration)
            .input('created_by_admin_id', sql.Int, event.created_by_admin_id)
            .query(`
                INSERT INTO EventsTable 
                (title, description, datetime, youtube_link, thumbnail, video_title, duration, created_by_admin_id)
                VALUES 
                (@title, @description, @datetime, @youtube_link, @thumbnail, @video_title, @duration, @created_by_admin_id)
            `);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateEvent(id, event) {
  let connection;
  try {
    connection = await sql.connect(config);
    await connection.request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, event.title)
      .input('description', sql.NVarChar, event.description)
      .input('datetime', sql.DateTime, event.datetime)
      .input('youtube_link', sql.NVarChar, event.youtube_link)
      .input('thumbnail', sql.NVarChar, event.thumbnail)
      .input('video_title', sql.NVarChar, event.video_title)
      .input('duration', sql.VarChar, event.duration)
      .input('created_by_admin_id', sql.Int, event.created_by_admin_id)
      .query(`
        UPDATE EventsTable SET
          title = @title,
          description = @description,
          datetime = @datetime,
          youtube_link = @youtube_link,
          thumbnail = @thumbnail,
          video_title = @video_title,
          duration = @duration,
          created_by_admin_id = @created_by_admin_id
        WHERE event_id = @id
      `);
  } finally {
    if (connection) 
        await connection.close();
  }
}

async function deleteEvent(id) {
    let connection;
    try {
        connection = await sql.connect(config);
        await connection.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM EventsTable WHERE event_id = @id`);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};

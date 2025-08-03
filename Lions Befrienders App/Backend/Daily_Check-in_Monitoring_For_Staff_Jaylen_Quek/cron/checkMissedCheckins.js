const cron = require('node-cron');
const { poolPromise } = require('../../dbConfig');

// Main function to check and insert/update missed check-ins
const runCheckinDetection = async () => {
  console.log("Running missed check-in detection...");

  try {
    const pool = await poolPromise;
    const todayDateStr = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const today = new Date(todayDateStr);

    const usersResult = await pool.request().query(`SELECT user_id, full_name, created_Time FROM users`);
    const users = usersResult.recordset;

    for (const user of users) {
      const { user_id, full_name, created_Time } = user;

      // Try to get latest check-in date
      const checkinResult = await pool.request()
        .input('userId', user_id)
        .query(`
          SELECT TOP 1 CAST(checkin_time AS DATE) AS checkin_date
          FROM daily_checkins
          WHERE user_id = @userId
          ORDER BY checkin_time DESC
        `);

      let lastCheckinDate;

      if (checkinResult.recordset.length === 0) {
        // No check-ins at all – use account creation date
        lastCheckinDate = new Date(created_Time.toISOString().split('T')[0]);
        console.log(`No check-in for ${full_name}, using created_Time (${lastCheckinDate})`);
      } else {
        lastCheckinDate = new Date(checkinResult.recordset[0].checkin_date);
      }

      const timeDiff = today - lastCheckinDate;
      const daysMissed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      if (daysMissed <= 0) {
        // User checked in today or future – clear missed entry if any
        await pool.request()
          .input('userId', user_id)
          .query(`DELETE FROM missed_checkins WHERE user_id = @userId`);
        console.log(`${full_name} checked in. Missed check-in record removed.`);
        continue;
      }

      // Check if a missed_checkins entry already exists
      const missedResult = await pool.request()
        .input('userId', user_id)
        .query(`SELECT * FROM missed_checkins WHERE user_id = @userId`);

      if (missedResult.recordset.length === 0) {
        // Insert new missed check-in
        await pool.request()
          .input('userId', user_id)
          .input('lastCheckinDate', lastCheckinDate.toISOString().split('T')[0])
          .input('daysMissed', daysMissed)
          .input('status', 'Unresolved')
          .input('notes', '')
          .query(`
            INSERT INTO missed_checkins (user_id, last_checkin_date, days_missed, status, notes)
            VALUES (@userId, @lastCheckinDate, @daysMissed, @status, @notes)
          `);
        console.log(`Missed check-in added for ${full_name} (${daysMissed} days missed)`);
      } else {
        // Update days missed
        await pool.request()
          .input('userId', user_id)
          .input('daysMissed', daysMissed)
          .query(`
            UPDATE missed_checkins
            SET days_missed = @daysMissed
            WHERE user_id = @userId
          `);
        console.log(`Updated missed check-in for ${full_name} (${daysMissed} days missed)`);
      }
    }
  } catch (err) {
    console.error("Error in missed check-in job:", err);
  }
};

// Schedule: run every midnight
cron.schedule('0 0 * * *', runCheckinDetection);

// Also run once on startup (for dev/testing)
runCheckinDetection();
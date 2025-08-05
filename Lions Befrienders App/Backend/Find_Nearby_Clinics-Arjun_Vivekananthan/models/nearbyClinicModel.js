const db = require('../Backend/db_config.js');

async function addFavorite(clinic) {
  const query = `
    IF NOT EXISTS (SELECT 1 FROM Favorites WHERE clinic_id = @clinic_id)
    BEGIN
      INSERT INTO Favorites (clinic_id, text, rating)
      VALUES (@clinic_id, @text, @rating)
    END
  `;

  const request = db.request();
  request.input('clinic_id', clinic.clinic_id);
  request.input('text', clinic.text);
  request.input('rating', clinic.rating || null);

  await request.query(query);
}

async function getFavorites() {
  const query = `SELECT clinic_id, text, rating FROM Favorites ORDER BY text ASC`;
  const result = await db.request().query(query);
  return result.recordset;
}

async function removeFavorite(clinic_id) {
  const query = `DELETE FROM Favorites WHERE clinic_id = @clinic_id`;
  await db.request()
    .input('clinic_id', clinic_id)
    .query(query);
}

module.exports = { addFavorite, getFavorites, removeFavorite };

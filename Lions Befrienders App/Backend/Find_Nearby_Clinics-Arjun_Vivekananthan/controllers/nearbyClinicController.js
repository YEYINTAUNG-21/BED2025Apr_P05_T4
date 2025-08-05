const favoriteModel = require('../models/nearbyClinicModel');

exports.getFavorites = async (req, res) => {
  try {
    const data = await favoriteModel.getFavorites();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const clinic = req.body;
    await favoriteModel.addFavorite(clinic);
    res.status(200).json({ message: 'Clinic added to favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const clinic_id = req.params.clinic_id;
    await favoriteModel.removeFavorite(clinic_id);
    res.status(200).json({ message: 'Favorite removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
};

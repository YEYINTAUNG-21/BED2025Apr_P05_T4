exports.validateContact = (req, res, next) => {
  const { email, subject, description } = req.body;
  if (!email || !subject || !description) {
    return res.status(400).json({ error: 'All fields required.' });
  }
  next();
};

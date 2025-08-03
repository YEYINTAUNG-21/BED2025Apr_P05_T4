const Joi = require('joi');

const eventSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  datetime: Joi.date().required(),
  youtube_link: Joi.string().uri().required()
});

function validateEvent(req, res, next) {
  const { error } = eventSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = validateEvent;

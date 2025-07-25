const Joi = require('joi');

exports.addToCartSchema = Joi.object({
  cakeId: Joi.string().required()
});

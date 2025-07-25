const Joi = require('joi');

exports.registerValidation = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

exports.loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

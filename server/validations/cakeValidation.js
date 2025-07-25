const Joi = require('joi');

exports.createCakeSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Cake name is required',
    'string.empty': 'Cake name cannot be empty',
  }),
  description: Joi.string().allow('', null),
  price: Joi.number().positive().required().messages({
    'any.required': 'Price is required',
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be greater than zero',
  }),
  image: Joi.string().allow('', null), // Allow any string, not just URI
  category: Joi.string().valid('Birthday', 'Wedding', 'Custom', 'Anniversary', 'Cupcake', 'Other'),
  flavor: Joi.string().allow('', null),
  isFeatured: Joi.boolean(),
  stock: Joi.number().integer().min(0),
});

exports.updateCakeSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow('', null),
  price: Joi.number().positive(),
  image: Joi.string().allow('', null), // Allow any string, not just URI
  category: Joi.string().valid('birthday', 'wedding', 'custom', 'other'),
  stock: Joi.number().integer().min(0),
  isFeatured: Joi.boolean(),
});

exports.validateCake = (data) => {
  return exports.createCakeSchema.validate(data);
};

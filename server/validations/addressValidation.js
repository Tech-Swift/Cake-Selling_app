const { body } = require('express-validator');

exports.validateAddress = [
  body('recipientName').notEmpty().withMessage('Recipient name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('street').notEmpty().withMessage('Street is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('country').notEmpty().withMessage('Country is required')
];
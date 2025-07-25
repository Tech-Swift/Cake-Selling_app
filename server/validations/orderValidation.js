const { body } = require('express-validator');

// Validation for placing an order (cart or direct)
exports.validatePlaceOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.cakeId')
    .notEmpty()
    .withMessage('Each item must have a cakeId'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

// Validation for updating order status
exports.validateOrderStatus = [
  body('status')
    .isIn(['pending', 'accepted', 'on_progress', 'ready', 'picked', 'delivered'])
    .withMessage('Invalid status value')
];

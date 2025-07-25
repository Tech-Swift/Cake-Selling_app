const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, sellerOnly, adminOnly } = require('../middleware/authMiddleware');
const { validatePlaceOrder, validateOrderStatus } = require('../validations/orderValidation');
const { validationResult } = require('express-validator');

// Helper middleware to handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Place an order (from cart or direct)
router.post('/', protect, validatePlaceOrder, handleValidation, orderController.placeOrder);

// Get all orders for the logged-in user
router.get('/my-orders', protect, orderController.getUserOrders);

// Get a single order by ID (for the user)
router.get('/:orderId', protect, orderController.getOrderById);

// Get all orders (admin only)
router.get('/admin/all', protect, adminOnly, orderController.getAllOrders);

// Get all orders for the logged-in seller
router.get('/seller/all', protect, sellerOnly, orderController.getSellerOrders);

// Get sales stats for the logged-in seller
router.get('/seller/sales-stats', protect, sellerOnly, orderController.getSellerSalesStats);

// Update order status (admin or seller)
router.patch('/:orderId/status', protect, validateOrderStatus, handleValidation, orderController.updateOrderStatus);

// Delete an order (admin only)
router.delete('/:orderId', protect, adminOnly, orderController.deleteOrder);

module.exports = router;
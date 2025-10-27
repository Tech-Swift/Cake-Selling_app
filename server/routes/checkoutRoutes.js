const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

// Get payment options (countries and methods)
router.get('/payment-options', checkoutController.getPaymentOptions);

// Get cart summary for checkout
router.get('/cart-summary', protect, checkoutController.getCartSummary);

// Process checkout with payment method
router.post('/process', protect, checkoutController.processCheckout);

// Verify payment after completion
router.get('/verify-payment/:reference', checkoutController.verifyPayment);

// Get order status
router.get('/order-status/:orderId', protect, checkoutController.getOrderStatus);

module.exports = router;


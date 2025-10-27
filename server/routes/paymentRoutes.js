const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Paystack payment routes
router.post('/initialize', protect, paymentController.initializePayment);
router.get('/verify/:reference', paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/status/:paymentId', protect, paymentController.getPaymentStatus);

// Legacy routes (kept for backward compatibility)
router.post('/initiate', protect, paymentController.initiatePayment);
router.post('/confirm', protect, paymentController.confirmPayment);
router.get('/:paymentId', protect, paymentController.getPaymentById);

module.exports = router;
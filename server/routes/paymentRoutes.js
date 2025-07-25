const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Initiate payment
router.post('/initiate', protect, paymentController.initiatePayment);

// Confirm payment (simulate webhook)
router.post('/confirm', protect, paymentController.confirmPayment);

//status of payment
router.get('/:paymentId', protect, paymentController.getPaymentById);

module.exports = router;
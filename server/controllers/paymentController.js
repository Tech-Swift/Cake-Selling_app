const paymentService = require('../services/paymentService');
const Payment = require('../models/Payment');

// Initialize Paystack payment
exports.initializePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, email, amount, metadata } = req.body;
    
    // Validate required fields
    if (!orderId || !email || !amount) {
      return res.status(400).json({ 
        error: 'OrderId, email, and amount are required' 
      });
    }

    const result = await paymentService.initializePayment({
      orderId,
      userId,
      email,
      amount,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        paymentId: result.payment._id,
        authorizationUrl: result.authorizationUrl,
        accessCode: result.accessCode,
        reference: result.reference,
        amount: result.payment.amount
      }
    });
  } catch (err) {
    console.error('Payment initialization error:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Verify Paystack payment
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({ 
        error: 'Payment reference is required' 
      });
    }

    const result = await paymentService.verifyPayment(reference);
    
    res.status(200).json({
      success: result.success,
      message: result.success ? 'Payment verified successfully' : 'Payment verification failed',
      data: {
        payment: result.payment,
        transaction: result.transaction
      }
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Handle Paystack webhook
exports.handleWebhook = async (req, res) => {
  try {
    const eventData = req.body;
    
    // Verify webhook signature (recommended for production)
    // const signature = req.headers['x-paystack-signature'];
    // if (!paystack.webhook.verify(eventData, signature)) {
    //   return res.status(400).json({ error: 'Invalid webhook signature' });
    // }

    const result = await paymentService.handleWebhook(eventData);
    
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: result
    });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentService.getPaymentStatus(paymentId);
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (err) {
    console.error('Get payment status error:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Legacy methods (kept for backward compatibility)
exports.initiatePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, amount, method } = req.body;
    const payment = await paymentService.createPayment({ orderId, userId, amount, method });
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;
    const payment = await paymentService.markPaymentAsPaid(paymentId, transactionId);
    res.status(200).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('order');
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.status(200).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
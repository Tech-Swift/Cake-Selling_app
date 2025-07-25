const paymentService = require('../services/paymentService');

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

// Simulate payment confirmation (in real life, this would be a webhook)
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
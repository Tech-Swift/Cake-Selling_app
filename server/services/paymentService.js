const Payment = require('../models/Payment');
const Order = require('../models/Order');
const notificationService = require('./notificationService');

exports.createPayment = async ({ orderId, userId, amount, method }) => {
  // Optionally: check if order exists and belongs to user
  const payment = new Payment({
    order: orderId,
    user: userId,
    amount,
    method,
    status: 'pending'
  });
  await payment.save();
  return payment;
};

exports.markPaymentAsPaid = async (paymentId, transactionId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');
  payment.status = 'paid';
  payment.transactionId = transactionId;
  payment.paidAt = new Date();
  await payment.save();
  //notify the paid payment
  await notificationService.createNotification({
    user: payment.user,
    type: 'payment',
    message: `Your payment of ${payment.amount} has been confirmed.`,
    data: { paymentId: payment._id, orderId: payment.order }
  });

  // Update order status as well
  await Order.findByIdAndUpdate(payment.order, { status: 'confirmed' });

  return payment;
};
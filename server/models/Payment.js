const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true }, // e.g., 'mpesa', 'stripe', 'paypal'
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  transactionId: { type: String }, // from payment gateway
  paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
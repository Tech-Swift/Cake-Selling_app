const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true }, // e.g., 'paystack', 'stripe', 'paypal'
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  transactionId: { type: String }, // from payment gateway
  paidAt: { type: Date },
  
  // Paystack-specific fields
  paystackReference: { type: String, sparse: true }, // Paystack transaction reference
  authorizationUrl: { type: String }, // Paystack authorization URL
  paystackData: { type: mongoose.Schema.Types.Mixed }, // Store full Paystack response data
  
  // Additional metadata
  metadata: { type: mongoose.Schema.Types.Mixed }, // Custom metadata
}, { timestamps: true });

// Index for faster queries
paymentSchema.index({ paystackReference: 1 });
paymentSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
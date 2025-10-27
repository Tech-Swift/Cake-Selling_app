const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        cake: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Cake',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'accepted', 'on_progress', 'ready', 'picked', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'online_payment'],
      required: true
    },
    paymentCountry: {
      type: String,
      enum: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Rwanda', 'Côte d\'Ivoire'],
      required: function() {
        return this.paymentMethod === 'online_payment';
      }
    },
    paymentGateway: {
      type: String,
      enum: ['paystack', 'flutterwave', 'stripe'],
      required: function() {
        return this.paymentMethod === 'online_payment';
      }
    },
    paymentReference: {
      type: String,
      sparse: true
    },
    paymentData: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

// Indexes for better performance
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ paymentReference: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
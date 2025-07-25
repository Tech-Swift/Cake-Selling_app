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
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'on_progress', 'ready', 'picked', 'delivered'],
      default: 'pending'
    },
    address: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Card'],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
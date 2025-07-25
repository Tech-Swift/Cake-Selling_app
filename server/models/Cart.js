const mongoose = require('mongoose');

// Subdocument: items inside the cart
const CartItemSchema = new mongoose.Schema({
  cake: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cake',
    required: [true, 'Cake reference is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  }
});

// Main cart schema
const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true // One cart per user
  },
  items: [CartItemSchema]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Cart', CartSchema);

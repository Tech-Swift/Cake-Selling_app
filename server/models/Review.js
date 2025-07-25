const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  cake: { type: mongoose.Schema.Types.ObjectId, ref: 'Cake' }, // no longer required
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isOrderReview: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

reviewSchema.index({ cake: 1, user: 1 }, { unique: true, partialFilterExpression: { cake: { $exists: true, $ne: null } } }); // One review per user per cake
reviewSchema.index({ order: 1, user: 1 }, { unique: true, partialFilterExpression: { isOrderReview: true } }); // One order review per user per order

module.exports = mongoose.model('Review', reviewSchema);
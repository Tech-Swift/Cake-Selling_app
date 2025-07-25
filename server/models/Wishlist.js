const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      cake: { type: mongoose.Schema.Types.ObjectId, ref: 'Cake', required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
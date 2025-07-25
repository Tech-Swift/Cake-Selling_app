const reviewService = require('../services/reviewService');

// Add a review to a cake
exports.addReview = async (req, res) => {
  console.log('addReview called');
  console.log('addReview req.body:', req.body);
  try {
    const userId = req.user.id;
    const { cakeId, rating, comment, orderId, sellerId, sellerRating, sellerComment } = req.body;
    const review = await reviewService.addReview({ cakeId, userId, rating, comment, orderId, sellerId, sellerRating, sellerComment });
    res.status(201).json(review);
  } catch (err) {
    console.log('addReview error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Get all reviews for a cake
exports.getCakeReviews = async (req, res) => {
  try {
    const { cakeId } = req.params;
    const reviews = await reviewService.getCakeReviews(cakeId);
    res.status(200).json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all reviews by the logged-in user
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await reviewService.getUserReviews(userId);
    res.status(200).json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a review (user or admin)
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { reviewId } = req.params;
    const result = await reviewService.deleteReview(reviewId, userId, isAdmin);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get recent/top reviews for testimonials
const Review = require('../models/Review');
exports.getRecentReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    // Sort by most recent. Change to { rating: -1 } for top-rated
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name')
      .populate('cake', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
};

exports.getSellerReviews = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const reviews = await reviewService.getSellerReviews(sellerId);
    res.status(200).json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSellerOrderReviews = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const reviews = await reviewService.getSellerOrderReviews(sellerId);
    res.status(200).json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
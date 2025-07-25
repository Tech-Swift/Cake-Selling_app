const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Add a review to a cake
router.post('/', protect, reviewController.addReview);

// Get all reviews for a cake
router.get('/cake/:cakeId', reviewController.getCakeReviews);

// Get all reviews by the logged-in user
router.get('/my', protect, reviewController.getUserReviews);

// Get all reviews for a seller's cakes
router.get('/seller', protect, reviewController.getSellerReviews);

// Get all order-level reviews for a seller's orders
router.get('/seller-orders', protect, reviewController.getSellerOrderReviews);

// Delete a review (user or admin)
router.delete('/:reviewId', protect, reviewController.deleteReview);

// Get recent/top reviews for testimonials
router.get('/', reviewController.getRecentReviews);

module.exports = router;
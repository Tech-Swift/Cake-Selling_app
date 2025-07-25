const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// Get the user's wishlist
router.get('/', protect, wishlistController.getWishlist);

// Add a cake to the wishlist
router.post('/add', protect, wishlistController.addToWishlist);

// Remove a cake from the wishlist
router.delete('/remove/:cakeId', protect, wishlistController.removeFromWishlist);

module.exports = router;
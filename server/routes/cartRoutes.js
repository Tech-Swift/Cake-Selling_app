const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, cartController.getCart);
router.post('/add', protect, cartController.addToCart);
router.delete('/remove/:itemId', protect, cartController.removeFromCart);
router.post('/checkout', protect, cartController.checkoutCart);

module.exports = router;

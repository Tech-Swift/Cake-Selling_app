const express = require('express');
const router = express.Router();

const cakeController = require('../controllers/cakeController');
const { protect, sellerOnly, sellerOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', cakeController.getAllCakes);
router.get('/featured', cakeController.getFeaturedCakes);
router.get('/my-cakes', protect, sellerOrAdmin, cakeController.getCakesByUser);
router.get('/:id', cakeController.getCakeById);

// Seller/Admin routes
router.post('/', protect, sellerOrAdmin, upload.single('image'), cakeController.createCake);
router.put('/:id', protect, sellerOrAdmin, upload.single('image'), cakeController.updateCake);
router.delete('/:id', protect, sellerOrAdmin, cakeController.deleteCake);

module.exports = router;

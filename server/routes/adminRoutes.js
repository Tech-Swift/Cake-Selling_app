const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User management
router.get('/users', protect, adminOnly, adminController.listUsers);
router.patch('/users/:userId/activate', protect, adminOnly, adminController.activateUser);
router.patch('/users/:userId/deactivate', protect, adminOnly, adminController.deactivateUser);
router.get('/users/:userId/orders', protect, adminOnly, adminController.getUserOrders);
router.get('/users/:userId/reviews', protect, adminOnly, adminController.getUserReviews);

// Cake management
router.get('/cakes', protect, adminOnly, adminController.listCakes);
router.delete('/cakes/:cakeId', protect, adminOnly, adminController.deleteCake);

// Order management
router.get('/orders', protect, adminOnly, adminController.listOrders);
router.patch('/orders/:orderId/status', protect, adminOnly, adminController.updateOrderStatus);
router.delete('/orders/:orderId', protect, adminOnly, adminController.deleteOrder);

// Review moderation
router.get('/reviews', protect, adminOnly, adminController.listReviews);
router.delete('/reviews/:reviewId', protect, adminOnly, adminController.deleteReview);

// Analytics
router.get('/sales-stats', protect, adminOnly, adminController.getSalesStats);
router.get('/sales-chart', protect, adminOnly, adminController.getSalesChart);
router.get('/export-sales', protect, adminOnly, adminController.exportSales);
router.get('/top-cakes', protect, adminOnly, adminController.getTopCakes);
router.get('/top-sellers', protect, adminOnly, adminController.getTopSellers);
router.get('/order-stats', protect, adminOnly, adminController.getOrderStats);

module.exports = router;
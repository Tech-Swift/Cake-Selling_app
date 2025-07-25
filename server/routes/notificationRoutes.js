const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, notificationController.getNotifications);
router.patch('/:notificationId/read', protect, notificationController.markNotificationAsRead);
router.patch('/mark-all-read', protect, notificationController.markAllAsRead);

module.exports = router;
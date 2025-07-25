const express = require('express');
const router = express.Router();

const {
  getMe,
  updateMe,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Logged-in user routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

// Admin-only routes
router.get('/', protect, adminOnly, getAllUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;

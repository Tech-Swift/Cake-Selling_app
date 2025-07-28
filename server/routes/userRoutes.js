const express = require('express');
const router = express.Router();

const {
  getMe,
  updateMe,
  getAllUsers,
  updateUserRole,
  updateMyRole,
  requestRoleChange,
  getMyRoleRequest,
  getPendingRoleRequests,
  handleRoleRequest,
  deleteUser,
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Logged-in user routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/role', protect, updateMyRole); // Allow users to update their own role (testing)
router.post('/me/role-request', protect, requestRoleChange); // Request role change
router.get('/me/role-request', protect, getMyRoleRequest); // Get role request status

// Admin-only routes
router.get('/', protect, adminOnly, getAllUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.get('/role-requests/pending', protect, adminOnly, getPendingRoleRequests); // Get pending requests
router.put('/:userId/role-request', protect, adminOnly, handleRoleRequest); // Handle role request
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;

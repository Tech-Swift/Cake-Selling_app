const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// Get current user
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

// Update current user's info
exports.updateMe = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = await bcrypt.hash(password, 10);

  await user.save();

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// Admin: Update user role
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!['customer', 'seller', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    message: 'User role updated',
    user,
  });
};

// Allow user to update their own role (for testing purposes)
exports.updateMyRole = async (req, res) => {
  const { role } = req.body;

  if (!['customer', 'seller', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    message: 'Your role has been updated',
    user,
  });
};

// Request role change (requires admin approval)
exports.requestRoleChange = async (req, res) => {
  const { requestedRole, reason } = req.body;

  if (!['seller', 'admin'].includes(requestedRole)) {
    return res.status(400).json({ message: 'Invalid role request' });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if user already has this role
  if (user.role === requestedRole) {
    return res.status(400).json({ message: `You already have the ${requestedRole} role` });
  }

  // Check if there's already a pending request
  if (user.roleRequest && user.roleRequest.status === 'pending') {
    return res.status(400).json({ message: 'You already have a pending role request' });
  }

  // Create role request
  user.roleRequest = {
    requestedRole,
    requestDate: new Date(),
    status: 'pending',
    adminNotes: null
  };

  await user.save();

  res.json({
    message: 'Role change request submitted successfully',
    roleRequest: user.roleRequest
  });
};

// Get user's role request status
exports.getMyRoleRequest = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    roleRequest: user.roleRequest
  });
};

// Admin: Get all pending role requests
exports.getPendingRoleRequests = async (req, res) => {
  const users = await User.find({
    'roleRequest.status': 'pending'
  }).select('-password');

  res.json(users);
};

// Admin: Approve or reject role request
exports.handleRoleRequest = async (req, res) => {
  const { userId } = req.params;
  const { action, adminNotes } = req.body; // action: 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!user.roleRequest || user.roleRequest.status !== 'pending') {
    return res.status(400).json({ message: 'No pending role request found' });
  }

  if (action === 'approve') {
    user.role = user.roleRequest.requestedRole;
    user.roleRequest.status = 'approved';
  } else {
    user.roleRequest.status = 'rejected';
  }

  user.roleRequest.adminNotes = adminNotes || null;
  await user.save();

  res.json({
    message: `Role request ${action}ed successfully`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleRequest: user.roleRequest
    }
  });
};

// Admin: Delete a user
exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ message: 'User deleted successfully' });
};

// Allow a logged-in user to delete their own account and all related data
exports.deleteMe = async (req, res) => {
  const userId = req.user.id;
  // Delete user-related data
  await Promise.all([
    Cart.deleteOne({ user: userId }),
    Wishlist.deleteOne({ user: userId }),
    Address.deleteMany({ user: userId }),
    Order.deleteMany({ user: userId }),
    Review.deleteMany({ user: userId }),
    Notification.deleteMany({ user: userId }),
  ]);
  // Delete the user
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ message: 'Account and all related data deleted successfully' });
};

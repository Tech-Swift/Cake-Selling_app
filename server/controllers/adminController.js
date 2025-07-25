const adminService = require('../services/adminService');
const User = require('../models/User');
const Cake = require('../models/Cake');
const Order = require('../models/Order');
const Review = require('../models/Review');

// --- Analytics Endpoints ---
exports.getSalesStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { from: start, to: end } = exports.getDateRange(req.query);
    const stats = await adminService.getSalesStats(start, end);
    res.json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSalesChart = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { from: start, to: end } = exports.getDateRange(req.query);
    const chart = await adminService.getSalesChart(start, end);
    res.json(chart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.exportSales = async (req, res) => {
  try {
    const { from, to, format } = req.query;
    const { from: start, to: end } = exports.getDateRange(req.query);
    const buffer = await adminService.exportSales(start, end, format);
    res.setHeader('Content-Disposition', 'attachment; filename="sales.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTopCakes = async (req, res) => {
  try {
    const cakes = await adminService.getTopCakes();
    res.json(cakes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTopSellers = async (req, res) => {
  try {
    const sellers = await adminService.getTopSellers();
    res.json(sellers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const stats = await adminService.getOrderStats();
    res.json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- User Management ---
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { isActive: true });
    res.json({ message: 'User activated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { isActive: false });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId });
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- Cake Management ---
exports.listCakes = async (req, res) => {
  try {
    const cakes = await Cake.find().populate('createdBy', 'name email');
    res.json(cakes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCake = async (req, res) => {
  try {
    await Cake.findByIdAndDelete(req.params.cakeId);
    res.json({ message: 'Cake deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- Order Management ---
exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.orderId, { status });
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.orderId);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- Review Moderation ---
exports.listReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'name').populate('cake', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- Helper for date range parsing ---
exports.getDateRange = (query) => {
  const from = query.from ? new Date(query.from) : new Date('2000-01-01');
  const to = query.to ? new Date(query.to) : new Date();
  to.setHours(23, 59, 59, 999);
  return { from, to };
};
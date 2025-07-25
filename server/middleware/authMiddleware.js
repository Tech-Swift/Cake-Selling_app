const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Extract token helper
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

// Protect routes (must be logged in)
exports.protect = async (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized: Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Admin-only access
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admins only' });
};

// Seller-only access
exports.sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Sellers only' });
};

// Seller or Admin access
exports.sellerOrAdmin = (req, res, next) => {
  if (req.user && ['seller', 'admin'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Sellers or Admins only' });
};

// Dynamic role middleware
exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: `Access denied: Only [${roles.join(', ')}] allowed` });
    }
    next();
  };
};

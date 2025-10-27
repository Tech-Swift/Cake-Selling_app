const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Set default NODE_ENV if not provided
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

console.log(`🚀 Starting server in ${process.env.NODE_ENV} mode`);

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI_PRODUCTION', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please set these variables in your .env file or deployment environment');
  process.exit(1);
}

console.log('✅ All required environment variables are set');

const app = express();

// CORS configuration based on environment
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : [
      'http://localhost:5173', 
      'http://localhost:3000',
      'https://cake-selling-app.onrender.com',
      'https://cake-selling-app.vercel.app',
      'https://cake-selling-app.netlify.app'
    ];

console.log('🌐 CORS origins:', corsOrigins);

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Connect to DB
connectDB();

// Middleware
app.use(express.json());
app.use(compression()); // Enable gzip compression

// Serve uploaded images statically with caching
app.use('/uploads', express.static('uploads', {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString());
  }
}));

// Import routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const cakeRoutes = require('./routes/cakeRoutes');
app.use('/api/cakes', cakeRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

const wishlistRoutes = require('./routes/wishlistRoutes');
app.use('/api/wishlist', wishlistRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const addressRoutes = require('./routes/addressRoutes');
app.use('/api/addresses', addressRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const checkoutRoutes = require('./routes/checkoutRoutes');
app.use('/api/checkout', checkoutRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('Cake Selling API is running...');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({ 
      message: 'Duplicate field value entered' 
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Invalid token' 
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expired' 
    });
  }
  
  // Default error
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler - simplified for Express 5.x
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

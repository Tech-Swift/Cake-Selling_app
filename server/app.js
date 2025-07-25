const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();



const app = express();

//Enable Cors for frontend at localhost:5173
app.use(cors({
  origin: "*",
}))

// Connect to DB
connectDB();

// Middleware
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

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
// Routes (we'll create them next)
app.get('/', (req, res) => {
  res.send('Cake Selling API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

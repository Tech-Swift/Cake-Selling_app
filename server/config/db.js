const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI_PRODUCTION;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    
    // Log more details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;

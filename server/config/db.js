const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('👉 MONGO_URI_PRODUCTION:', process.env.MONGO_URI_PRODUCTION);
    await mongoose.connect(process.env.MONGO_URI_PRODUCTION);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

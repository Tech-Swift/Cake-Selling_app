const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.registerUser = async ({ name, email, password }) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });

    // Generate token
    const token = generateToken(user._id);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    };
  } catch (error) {
    // Re-throw validation errors
    if (error.name === 'ValidationError') {
      throw new Error('Please provide all required fields');
    }
    
    // Re-throw duplicate key errors
    if (error.code === 11000) {
      throw new Error('User with this email already exists');
    }
    
    // Re-throw other errors
    throw error;
  }
};

exports.loginUser = async ({ email, password }) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    };
  } catch (error) {
    throw error;
  }
};

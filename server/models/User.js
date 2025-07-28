const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  roleRequest: {
    requestedRole: {
      type: String,
      enum: ['seller', 'admin'],
      default: null
    },
    requestDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: null
    },
    adminNotes: {
      type: String,
      default: null
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

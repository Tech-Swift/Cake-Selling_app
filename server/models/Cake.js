const mongoose = require('mongoose');

const cakeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Cake name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Cake price is required'],
      min: 0,
    },
    category: {
      type: String,
      enum: ['Birthday', 'Wedding', 'Custom', 'Anniversary', 'Cupcake', 'Other'],
      default: 'Other',
    },
    flavor: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Removed ratings and averageRating fields
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cake', cakeSchema);

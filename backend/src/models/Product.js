const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  images: [{
    type: String,
    required: true,
  }],
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'running',
      'casual',
      'formal',
      'sports',
      'sneakers',
      'boots',
      'sandals',
      'training',
    ],
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  sizes: [{
    size: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  }],
  colors: [{
    type: String,
    trim: true,
  }],
  features: [{
    type: String,
    trim: true,
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

// Virtual for total stock
productSchema.virtual('totalStock').get(function () {
  return this.sizes.reduce((total, size) => total + size.stock, 0);
});

module.exports = mongoose.model('Product', productSchema);

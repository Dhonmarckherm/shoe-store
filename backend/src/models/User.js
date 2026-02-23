const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user',
  },
  isSeller: {
    type: Boolean,
    default: false,
  },
  sellerInfo: {
    storeName: String,
    description: String,
    phone: String,
    verified: {
      type: Boolean,
      default: false,
    },
  },
  passwordChangedAt: Date,
  notificationSettings: {
    emailOnPasswordChange: {
      type: Boolean,
      default: true,
    },
  },
  faceDescriptor: {
    type: String,
    default: null,
  },
  browsingHistory: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
    category: String,
  }],
  purchaseHistory: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add to browsing history
userSchema.methods.addToBrowsingHistory = async function (productId, category) {
  // Remove if already exists to avoid duplicates
  this.browsingHistory = this.browsingHistory.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  
  // Add to beginning
  this.browsingHistory.unshift({
    productId,
    category,
    viewedAt: new Date(),
  });
  
  // Keep only last 50 items
  if (this.browsingHistory.length > 50) {
    this.browsingHistory = this.browsingHistory.slice(0, 50);
  }
  
  await this.save();
};

module.exports = mongoose.model('User', userSchema);

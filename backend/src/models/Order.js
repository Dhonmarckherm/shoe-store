const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    required: true
  },
  variant: {
    type: String
  }
});

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String },
  country: { type: String, default: 'Philippines' },
  label: { type: String, default: 'Home' }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined values initially, unique only when set
  },
  items: [orderItemSchema],
  shippingAddress: addressSchema,
  paymentMethod: {
    type: String,
    enum: ['cod', 'gcash', 'paymaya', 'grabpay', 'shopeepay', 'coins'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['to-pay', 'to-ship', 'to-receive', 'completed', 'cancelled', 'return'],
    default: 'to-pay'
  },
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  // For returns/cancellations
  cancelReason: {
    type: String
  },
  returnReason: {
    type: String
  },
  // Tracking info
  trackingNumber: {
    type: String
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique order ID
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const date = new Date();
    const prefix = 'ORD';
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderId = `${prefix}-${timestamp}-${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);

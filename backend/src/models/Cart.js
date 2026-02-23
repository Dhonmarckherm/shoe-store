const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
    default: 1,
  },
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: null,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Update the updatedAt timestamp on every save
cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for cart total
cartSchema.virtual('totalAmount').get(function () {
  return this.items.reduce((total, item) => {
    return total + (item.productId?.price || 0) * item.quantity;
  }, 0);
});

// Virtual for total items count
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to add or update item in cart
cartSchema.methods.addItem = async function (productId, quantity, size, color) {
  const existingItemIndex = this.items.findIndex(
    (item) => 
      item.productId.toString() === productId.toString() && 
      item.size === size &&
      item.color === color
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      productId,
      quantity,
      size,
      color,
    });
  }

  return await this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function (itemId) {
  this.items = this.items.filter(
    (item) => item._id.toString() !== itemId.toString()
  );
  return await this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function (itemId, quantity) {
  const item = this.items.find(
    (item) => item._id.toString() === itemId.toString()
  );

  if (item) {
    item.quantity = quantity;
    return await this.save();
  }

  throw new Error('Item not found in cart');
};

// Method to clear cart
cartSchema.methods.clearCart = async function () {
  this.items = [];
  return await this.save();
};

module.exports = mongoose.model('Cart', cartSchema);

const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId', 'name price images brand');

    if (!cart) {
      // Return empty cart if none exists
      return res.json({
        success: true,
        data: {
          items: [],
          totalItems: 0,
          totalAmount: 0,
        },
      });
    }

    // Calculate totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        items: cart.items,
        totalItems,
        totalAmount,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if size is available
    const sizeInfo = product.sizes.find((s) => s.size === size);
    if (!sizeInfo) {
      return res.status(400).json({
        success: false,
        message: 'Selected size is not available',
      });
    }

    // Check stock
    if (sizeInfo.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${sizeInfo.stock} items available in stock`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId.toString() &&
        item.size === size &&
        item.color === (color || null)
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > sizeInfo.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${sizeInfo.stock} items available`,
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        size,
        color: color || null,
      });
    }

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images brand');

    const totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = updatedCart.items.reduce(
      (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
      0
    );

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        items: updatedCart.items,
        totalItems,
        totalAmount,
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const item = cart.items.find((item) => item._id.toString() === itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    // Check stock availability
    const product = await Product.findById(item.productId);
    const sizeInfo = product.sizes.find((s) => s.size === item.size);

    if (!sizeInfo || sizeInfo.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${sizeInfo?.stock || 0} items available in stock`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images brand');

    const totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = updatedCart.items.reduce(
      (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
      0
    );

    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        items: updatedCart.items,
        totalItems,
        totalAmount,
      },
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images brand');

    const totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = updatedCart.items.reduce(
      (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
      0
    );

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items: updatedCart.items,
        totalItems,
        totalAmount,
      },
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared',
      data: {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      },
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart',
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const {
  cartItemValidation,
  updateCartItemValidation,
} = require('../middleware/validation');

// All cart routes are protected
router.get('/', protect, getCart);
router.post('/', protect, cartItemValidation, addToCart);
router.put('/:itemId', protect, updateCartItemValidation, updateCartItem);
router.delete('/:itemId', protect, removeFromCart);
router.delete('/', protect, clearCart);

module.exports = router;

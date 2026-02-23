const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  searchProducts,
  getFeaturedProducts,
  getCategories,
  createProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.get('/', getProducts);

// Protected routes (for admin operations)
router.post('/', protect, createProduct);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRecommendationsForUser, getSimilarProducts } = require('../services/recommendation');

/**
 * @desc    Get personalized recommendations for logged-in user
 * @route   GET /api/recommendations
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const recommendations = await getRecommendationsForUser(req.user._id, limit);

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommendations',
      error: error.message,
    });
  }
});

/**
 * @desc    Get similar products for a specific product
 * @route   GET /api/recommendations/similar/:productId
 * @access  Public
 */
router.get('/similar/:productId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const similarProducts = await getSimilarProducts(req.params.productId, limit);

    res.json({
      success: true,
      data: similarProducts,
    });
  } catch (error) {
    console.error('Get similar products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching similar products',
      error: error.message,
    });
  }
});

module.exports = router;

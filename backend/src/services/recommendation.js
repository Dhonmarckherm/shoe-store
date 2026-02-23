const Product = require('../models/Product');
const User = require('../models/User');

/**
 * AI Recommendation Service
 * Uses collaborative filtering and content-based filtering
 */

/**
 * Get personalized product recommendations for a user
 * @param {String} userId - User ID
 * @param {Number} limit - Number of recommendations to return
 * @returns {Promise<Array>} - Array of recommended products
 */
const getRecommendationsForUser = async (userId, limit = 8) => {
  try {
    // Get user with browsing and purchase history
    const user = await User.findById(userId);
    
    if (!user) {
      // Return popular products if user not found
      return await getPopularProducts(limit);
    }

    // If user has no history, return popular products
    if (user.browsingHistory.length === 0 && user.purchaseHistory.length === 0) {
      return await getPopularProducts(limit);
    }

    // Get categories from user's browsing history
    const categoryCounts = {};
    const viewedProductIds = [];

    user.browsingHistory.forEach((item) => {
      viewedProductIds.push(item.productId.toString());
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
    });

    // Get categories from purchase history
    user.purchaseHistory.forEach((item) => {
      viewedProductIds.push(item.productId.toString());
    });

    // Sort categories by frequency
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);

    let recommendations = [];

    // Content-based filtering: Get products from preferred categories
    if (sortedCategories.length > 0) {
      const categoryProducts = await Product.find({
        category: { $in: sortedCategories.slice(0, 3) },
        _id: { $nin: viewedProductIds },
        isActive: true,
      })
        .sort({ rating: -1, numReviews: -1 })
        .limit(Math.ceil(limit * 0.6));

      recommendations.push(...categoryProducts);
    }

    // Collaborative filtering: Find similar users (simplified version)
    // In a real scenario, you'd use more sophisticated algorithms
    if (recommendations.length < limit) {
      const remainingSlots = limit - recommendations.length;
      
      // Get products from similar categories that the user hasn't viewed
      const additionalProducts = await Product.find({
        _id: { 
          $nin: [
            ...viewedProductIds, 
            ...recommendations.map((p) => p._id.toString())
          ] 
        },
        isActive: true,
      })
        .sort({ rating: -1, createdAt: -1 })
        .limit(remainingSlots);

      recommendations.push(...additionalProducts);
    }

    // If still not enough, fill with popular products
    if (recommendations.length < limit) {
      const existingIds = [
        ...viewedProductIds,
        ...recommendations.map((p) => p._id.toString()),
      ];

      const popularProducts = await Product.find({
        _id: { $nin: existingIds },
        isActive: true,
      })
        .sort({ numReviews: -1, rating: -1 })
        .limit(limit - recommendations.length);

      recommendations.push(...popularProducts);
    }

    return recommendations;
  } catch (error) {
    console.error('Recommendation error:', error);
    return await getPopularProducts(limit);
  }
};

/**
 * Get popular/trending products
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of popular products
 */
const getPopularProducts = async (limit = 8) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ numReviews: -1, rating: -1, createdAt: -1 })
      .limit(limit);

    return products;
  } catch (error) {
    console.error('Get popular products error:', error);
    return [];
  }
};

/**
 * Get similar products based on a product
 * @param {String} productId - Product ID
 * @param {Number} limit - Number of similar products
 * @returns {Promise<Array>} - Array of similar products
 */
const getSimilarProducts = async (productId, limit = 4) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return [];
    }

    // Find products in the same category, excluding the current product
    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: productId },
      isActive: true,
    })
      .sort({ rating: -1, numReviews: -1 })
      .limit(limit);

    return similarProducts;
  } catch (error) {
    console.error('Get similar products error:', error);
    return [];
  }
};

/**
 * Get frequently bought together products
 * @param {String} productId - Product ID
 * @param {Number} limit - Number of products
 * @returns {Promise<Array>} - Array of complementary products
 */
const getFrequentlyBoughtTogether = async (productId, limit = 3) => {
  try {
    // In a real implementation, this would analyze order history
    // For now, return products from the same category
    const product = await Product.findById(productId);

    if (!product) {
      return [];
    }

    const complementaryProducts = await Product.find({
      category: product.category,
      _id: { $ne: productId },
      isActive: true,
    })
      .sort({ rating: -1 })
      .limit(limit);

    return complementaryProducts;
  } catch (error) {
    console.error('Get frequently bought together error:', error);
    return [];
  }
};

module.exports = {
  getRecommendationsForUser,
  getPopularProducts,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
};

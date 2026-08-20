const Interaction = require('../models/Interaction');
const Product = require('../models/Product');

// GET /recommendations/me
const getMyRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user interactions (view_product, add_to_cart, purchase)
    const userInteractions = await Interaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('productId');

    let recommendedProducts = [];

    if (userInteractions.length > 0) {
      // Extract unique categories from user interactions
      const categories = [...new Set(
        userInteractions
          .filter(i => i.productId && i.productId.category)
          .map(i => i.productId.category)
      )];

      const interactedProductIds = userInteractions
        .filter(i => i.productId)
        .map(i => i.productId._id);

      recommendedProducts = await Product.find({
        category: { $in: categories },
        _id: { $nin: interactedProductIds }
      }).limit(10);
    }

    // Popularity Fallback: Fill remaining slots with newest products if < 10
    if (recommendedProducts.length < 10) {
      const limitRemaining = 10 - recommendedProducts.length;
      const existingIds = recommendedProducts.map(p => p._id);

      const fallbackProducts = await Product.find({ _id: { $nin: existingIds } })
        .sort({ createdAt: -1 })
        .limit(limitRemaining);

      recommendedProducts = [...recommendedProducts, ...fallbackProducts];
    }

    res.json({ success: true, count: recommendedProducts.length, data: recommendedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate recommendations.', error: error.message });
  }
};

module.exports = { getMyRecommendations };
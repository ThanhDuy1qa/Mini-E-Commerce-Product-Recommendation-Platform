const Interaction = require('../models/Interaction');
const Product = require('../models/Product');

const getPopularProductIds = async (limit, excludeProductIds = []) => {
  const populars = await Interaction.aggregate([
    { $match: { productId: { $nin: excludeProductIds } } },
    {
      $group: {
        _id: '$productId',
        score: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'purchase'] }, 5,
              { $cond: [{ $eq: ['$type', 'add_to_cart'] }, 3, 1] }
            ]
          }
        }
      }
    },
    { $sort: { score: -1 } },
    { $limit: limit * 2 }
  ]);

  return populars.map((p) => p._id);
};

// GET /api/recommendations
const getMyRecommendations = async (req, res) => {
  try {
    // 1. Kiểm tra an toàn người dùng (undefined nếu chưa đăng nhập)
    const userId = req.user?.id || req.user?._id; 
    const LIMIT = 5;

    let recommendedProducts = [];
    let excludedIds = [];

    // 2. Nếu ĐÃ DĂNG NHẬP: Lấy danh mục quan tâm dựa trên tương tác cá nhân
    if (userId) {
      const purchaseInteractions = await Interaction.find({ userId, type: 'purchase' }).distinct('productId');
      excludedIds = [...purchaseInteractions];

      const userInteractions = await Interaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(30)
        .populate('productId');

      if (userInteractions.length > 0) {
        const interestedCategories = [
          ...new Set(
            userInteractions
              .filter((i) => i.productId && i.productId.category)
              .map((i) => i.productId.category)
          )
        ];

        recommendedProducts = await Product.find({
          category: { $in: interestedCategories },
          _id: { $nin: excludedIds },
          stock: { $gt: 0 }
        }).limit(LIMIT);
      }
    }

    // 3. FALLBACK (Chưa đăng nhập / Người dùng mới / Không đủ 5 SP): Lấy sản phẩm phổ biến nhất
    if (recommendedProducts.length < LIMIT) {
      const remainingSlots = LIMIT - recommendedProducts.length;
      const currentRecIds = recommendedProducts.map((p) => p._id);
      excludedIds = [...excludedIds, ...currentRecIds];

      // Lấy danh sách ID sản phẩm phổ biến nhất hệ thống
      let popularIds = await getPopularProductIds(remainingSlots, excludedIds);

      let fallbackProducts = [];
      if (popularIds.length > 0) {
        fallbackProducts = await Product.find({
          _id: { $in: popularIds },
          stock: { $gt: 0 }
        }).limit(remainingSlots);
      }

      // Nếu hệ thống mới chưa có nhiều Interaction, lấy sản phẩm mới nhất còn hàng
      if (fallbackProducts.length < remainingSlots) {
        const stillNeeded = remainingSlots - fallbackProducts.length;
        const fetchedIds = [...excludedIds, ...fallbackProducts.map((p) => p._id)];

        const newestProducts = await Product.find({
          _id: { $nin: fetchedIds },
          stock: { $gt: 0 }
        })
          .sort({ createdAt: -1 })
          .limit(stillNeeded);

        fallbackProducts = [...fallbackProducts, ...newestProducts];
      }

      recommendedProducts = [...recommendedProducts, ...fallbackProducts];
    }

    // Đảm bảo luôn chốt đúng Top 5
    const finalProducts = recommendedProducts.slice(0, LIMIT);

    res.json({
      success: true,
      count: finalProducts.length,
      data: finalProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations.',
      error: error.message
    });
  }
};

module.exports = { getMyRecommendations };
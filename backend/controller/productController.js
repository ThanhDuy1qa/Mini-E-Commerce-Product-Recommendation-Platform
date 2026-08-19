const Product = require('../models/Product');
const Interaction = require('../models/Interaction');

// 1. Lấy danh sách sản phẩm (Hỗ trợ Tìm kiếm, Lọc danh mục, Phân trang)
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, main_cat, sort } = req.query;
    let query = {};

    // Tìm kiếm theo tên hoặc mã ASIN
    if (search) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { asin: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Lọc theo danh mục chính
    if (main_cat && main_cat !== 'ALL') {
      query.main_cat = main_cat;
    }

    // Xử lý sắp xếp giá
    let sortOptions = { createdAt: -1 }; // Mặc định mới nhất
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate('seller_id', 'name email username')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách sản phẩm!', error: error.message });
  }
};

// 2. Xem chi tiết sản phẩm (Tìm theo ID hoặc ASIN)
const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm theo Mongo ObjectId hoặc theo ASIN
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { asin: id };
    
    const product = await Product.findOne(query).populate('seller_id', 'name email username');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết sản phẩm!', error: error.message });
  }
};

// 3. Thêm sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const { title, main_cat, description, image_url, price, asin } = req.body;

    if (!title || !main_cat || price === undefined) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
    }

    // Tự sinh mã ASIN nếu không truyền vào
    const generatedAsin = asin || `B${Date.now().toString(36).toUpperCase()}`;

    // Kiểm tra trùng ASIN
    const existingProduct = await Product.findOne({ asin: generatedAsin });
    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'Mã ASIN sản phẩm đã tồn tại!' });
    }

    const newProduct = await Product.create({
      asin: generatedAsin,
      title,
      main_cat,
      description: description || '',
      image_url: image_url || '',
      price: Number(price),
      seller_id: req.user._id // Lấy ID của Seller/Admin đang đăng nhập
    });

    res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công!', product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo sản phẩm!', error: error.message });
  }
};

// 4. Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, main_cat, description, image_url, price } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại!' });
    }

    // Kiểm tra quyền: Chỉ chính Seller sở hữu sản phẩm hoặc Admin (role 2) mới được sửa
    if (product.seller_id.toString() !== req.user._id.toString() && req.user.role !== 2) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa sản phẩm này!' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title || product.title,
          main_cat: main_cat || product.main_cat,
          description: description !== undefined ? description : product.description,
          image_url: image_url !== undefined ? image_url : product.image_url,
          price: price !== undefined ? Number(price) : product.price
        }
      },
      { new: true }
    );

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công!', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật sản phẩm!', error: error.message });
  }
};

// 5. Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại!' });
    }

    // Kiểm tra quyền: Chỉ chính Seller sở hữu hoặc Admin (role 2) mới được xóa
    if (product.seller_id.toString() !== req.user._id.toString() && req.user.role !== 2) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa sản phẩm này!' });
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: 'Xóa sản phẩm thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa sản phẩm!', error: error.message });
  }
};

// 6. Lấy danh sách sản phẩm của từng cửa hàng (Seller)
const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find({ seller_id: sellerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ seller_id: sellerId })
    ]);

    res.json({
      success: true,
      sellerId,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy sản phẩm theo cửa hàng!', error: error.message });
  }
};

// 7. Lấy Top sản phẩm hot nhất / tương tác nhiều nhất của cửa hàng
const getTopProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    // Lấy toàn bộ ID sản phẩm thuộc về cửa hàng này
    const sellerProducts = await Product.find({ seller_id: sellerId }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    if (productIds.length === 0) {
      return res.json({ success: true, topProducts: [] });
    }

    // Gom nhóm trong bảng Interaction theo tổng điểm tương tác (weight)
    const topInteractions = await Interaction.aggregate([
      { $match: { productId: { $in: productIds } } },
      {
        $group: {
          _id: '$productId',
          totalScore: { $sum: '$weight' },
          interactionCount: { $sum: 1 }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: limit }
    ]);

    // Trích xuất chi tiết sản phẩm
    const topProductIds = topInteractions.map(item => item._id);
    const products = await Product.find({ _id: { $in: topProductIds } }).lean();

    // Ghép điểm tương tác vào kết quả trả về
    const topProducts = topInteractions.map(item => {
      const productDetail = products.find(p => p._id.toString() === item._id.toString());
      return {
        ...productDetail,
        score: item.totalScore,
        interactions: item.interactionCount
      };
    });

    // Fallback: Nếu shop chưa có lượt tương tác nào, trả về sản phẩm mới nhất
    if (topProducts.length === 0) {
      const recentProducts = await Product.find({ seller_id: sellerId }).sort({ createdAt: -1 }).limit(limit);
      return res.json({ success: true, topProducts: recentProducts });
    }

    res.json({ success: true, topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy Top sản phẩm của cửa hàng!', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  getTopProductsBySeller
};
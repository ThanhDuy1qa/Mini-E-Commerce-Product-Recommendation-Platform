const Product = require('../models/Product');

// 1. Lấy danh sách sản phẩm (Hỗ trợ Tìm kiếm, Lọc danh mục, Phân trang)
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, category, sort } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
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

// 2. Xem chi tiết sản phẩm
const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { asin: id };
    
    const product = await Product.findOne(query);

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
    const { name, category, description, image, price, stock } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
    }

    const newProduct = await Product.create({
      name,
      category,
      description: description || '',
      image: image || '',
      price: Number(price),
      stock: Number(stock) || 0
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
    const { name, category, description, image, price, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại!' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name: name || product.name,
          category: category || product.category,
          description: description !== undefined ? description : product.description,
          image: image !== undefined ? image : product.image,
          price: price !== undefined ? Number(price) : product.price,
          stock: stock !== undefined ? Number(stock) : product.stock
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

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: 'Xóa sản phẩm thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa sản phẩm!', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct
};
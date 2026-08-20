const Product = require('../models/Product');
const { logInteraction } = require('../utils/interactionHelper');

// 1. Get product list (Search, Filter, Pagination)
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
    res.status(500).json({ success: false, message: 'Server error while fetching products.', error: error.message });
  }
};

// 2. Get product details & log view_product interaction
const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { asin: id };

    const product = await Product.findOne(query);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Log view_product action if user is authenticated
    const userId = req.user?.id || req.user?._id;
    if (userId) {
      logInteraction(userId, product._id, 'view_product');
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching product details.', error: error.message });
  }
};

// 3. Create product
const createProduct = async (req, res) => {
  try {
    const { name, category, description, image, price, stock } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const newProduct = await Product.create({
      name,
      category,
      description: description || '',
      image: image || '',
      price: Number(price),
      stock: Number(stock) || 0
    });

    res.status(201).json({ success: true, message: 'Product created successfully.', product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while creating product.', error: error.message });
  }
};

// 4. Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, image, price, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
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

    res.json({ success: true, message: 'Product updated successfully.', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while updating product.', error: error.message });
  }
};

// 5. Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while deleting product.', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct
};
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controller/productController');

const { verifyAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductDetail);

// Protected routes (Chỉ Admin mới có quyền thao tác)
router.post('/', verifyAdmin, createProduct);
router.put('/:id', verifyAdmin, updateProduct);
router.delete('/:id', verifyAdmin, deleteProduct);

module.exports = router;
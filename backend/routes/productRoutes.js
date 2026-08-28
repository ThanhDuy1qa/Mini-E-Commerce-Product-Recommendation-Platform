const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controller/productController');
const { verifyToken, verifyAdmin, verifyOptionalToken } = require('../middleware/authMiddleware');

// Public Routes (Tất cả mọi người đều xem được)
router.get('/', getProducts);
router.get('/:id', verifyOptionalToken, getProductDetail);

// Admin Routes (Chỉ Admin mới có quyền Thêm / Sửa / Xóa)
router.post('/', verifyToken, verifyAdmin, createProduct);
router.put('/:id', verifyToken, verifyAdmin, updateProduct);
router.delete('/:id', verifyToken, verifyAdmin, deleteProduct);

module.exports = router;
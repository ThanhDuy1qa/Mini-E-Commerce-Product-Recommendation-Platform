const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controller/categoryController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Public Routes (Mọi người đều xem được danh mục)
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin Routes (Chỉ Admin mới thêm/sửa/xóa danh mục)
router.post('/', verifyToken, verifyAdmin, createCategory);
router.put('/:id', verifyToken, verifyAdmin, updateCategory);
router.delete('/:id', verifyToken, verifyAdmin, deleteCategory);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controller/categoryController');
const { verifyAdmin } = require('../middleware/authMiddleware'); // Điều chỉnh đường dẫn tới file auth middleware của bạn

// Public Routes (Người dùng xem danh mục)
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected Routes (Chỉ Admin mới có quyền thêm, sửa, xóa)
router.post('/', verifyAdmin, createCategory);
router.put('/:id', verifyAdmin, updateCategory);
router.delete('/:id', verifyAdmin, deleteCategory);

module.exports = router;
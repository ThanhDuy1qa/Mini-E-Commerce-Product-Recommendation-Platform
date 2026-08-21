const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controller/categoryController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Public Routes 
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected Routes
router.post('/', verifyAdmin, createCategory);
router.put('/:id', verifyAdmin, updateCategory);
router.delete('/:id', verifyAdmin, deleteCategory);

module.exports = router;
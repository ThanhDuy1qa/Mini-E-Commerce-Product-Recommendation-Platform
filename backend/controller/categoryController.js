const Category = require('../models/Category');

// Lấy toàn bộ danh sách Category
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy chi tiết 1 Category theo ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo Category mới (Yêu cầu quyền Admin)
const createCategory = async (req, res) => {
  try {
    const { name, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Category name already exists" });
    }

    const category = await Category.create({ name, image_url });
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật Category (Yêu cầu quyền Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, image_url } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, image_url },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa Category (Yêu cầu quyền Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
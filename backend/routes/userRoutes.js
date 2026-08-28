const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  updateUserStatus, 
  deleteUser
} = require('../controller/userController');

// Import middlewares
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// =========================
// USER PROFILE ROUTES
// =========================
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

// =========================
// ADMIN ROUTES (Quản lý người dùng)
// =========================
router.get('/', verifyToken, verifyAdmin, getAllUsers);
router.put('/:id/role', verifyToken, verifyAdmin, updateUserRole);
router.put('/:id/status', verifyToken, verifyAdmin, updateUserStatus);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);

module.exports = router;
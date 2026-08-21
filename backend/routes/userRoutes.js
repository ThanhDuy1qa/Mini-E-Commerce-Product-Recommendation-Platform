const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controller/userController');

// Import middleware
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// =========================
// USER PROFILE ROUTES
// =========================
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

// =========================
// ADMIN ROUTES
// =========================
router.get('/', verifyAdmin, getAllUsers);
router.put('/:id/role', verifyAdmin, updateUserRole);
router.delete('/:id', verifyAdmin, deleteUser);

module.exports = router;
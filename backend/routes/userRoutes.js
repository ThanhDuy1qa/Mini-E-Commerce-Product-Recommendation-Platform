const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controller/userController');

// Middleware giai ma Token va tim User ID linh hoat
const protect = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized - Missing Token' });
    }

    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'baomatkeyhihi');
    
    // Tieu hop moi cau truc Token payload (id, _id, userId, user.id)
    const userId = decoded.id || decoded._id || decoded.userId || (decoded.user && (decoded.user.id || decoded.user._id));

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid Token structure' });
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

// User Profile Routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin Routes
router.get('/', protect, getAllUsers);
router.put('/:id/role', protect, updateUserRole);
router.delete('/:id', protect, deleteUser);

module.exports = router;
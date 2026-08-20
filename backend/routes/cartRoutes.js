const express = require('express');
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
} = require('../controller/cartController');

const {
  verifyToken
} = require('../middleware/authMiddleware');

// Get current user's cart
router.get('/', verifyToken, getCart);

// Add product to cart
router.post('/items', verifyToken, addToCart);

// Update product quantity
router.put('/items/:productId', verifyToken, updateCartItem);

// Remove product from cart
router.delete('/items/:productId', verifyToken, removeCartItem);

module.exports = router;
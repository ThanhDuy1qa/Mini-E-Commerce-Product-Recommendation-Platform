const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById
} = require('../controller/orderController');

const {
  verifyToken
} = require('../middleware/authMiddleware');

// Create order from cart
router.post('/', verifyToken, createOrder);

// Get current user's order history
router.get('/', verifyToken, getMyOrders);

// Get one order
router.get('/:id', verifyToken, getOrderById);

module.exports = router;
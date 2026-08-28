const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controller/orderController');

const {
  verifyToken,
  verifyAdmin
} = require('../middleware/authMiddleware');

// =========================
// USER ROUTES
// =========================
router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);

// =========================
// ADMIN ROUTES
// =========================
router.get('/', verifyToken, verifyAdmin, getAllOrders);
router.put('/:id', verifyToken, verifyAdmin, updateOrderStatus);

// =========================
// USER + ADMIN GET ORDER DETAIL
// =========================
router.get('/:id', verifyToken, getOrderById);

module.exports = router;
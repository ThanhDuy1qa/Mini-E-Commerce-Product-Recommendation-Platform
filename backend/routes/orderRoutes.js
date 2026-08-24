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
// USER CREATE ORDER
// =========================
router.post(
  '/',
  verifyToken,
  createOrder
);


// =========================
// USER ORDER HISTORY
// =========================
router.get(
  '/my-orders',
  verifyToken,
  getMyOrders
);


// =========================
// ADMIN GET ALL ORDERS
// =========================
router.get(
  '/',
  verifyAdmin,
  getAllOrders
);


// =========================
// ADMIN UPDATE ORDER STATUS
// =========================
router.put(
  '/:id',
  verifyAdmin,
  updateOrderStatus
);

// =========================
// USER + ADMIN GET ORDER DETAIL
// =========================
router.get(
  '/:id',
  verifyToken,
  getOrderById
);


module.exports = router;
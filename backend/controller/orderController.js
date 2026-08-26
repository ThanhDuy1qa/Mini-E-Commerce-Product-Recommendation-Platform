const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { logInteraction } = require('../utils/interactionHelper');

// POST /api/orders
// Create an order from the current user's cart
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Nhận thông tin từ Frontend (bao gồm cả mảng products được chọn)
    const { phone, shippingAddress, products: selectedProducts } = req.body;

    if (!phone || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and shipping address are required.'
      });
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. It must be exactly 10 digits starting with 0.'
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty.'
      });
    }

    // 2. Lọc chỉ lấy những sản phẩm người dùng chọn thanh toán
    let itemsToOrder = cart.items;

    if (Array.isArray(selectedProducts) && selectedProducts.length > 0) {
      const selectedIds = selectedProducts.map((p) => (p.product || p._id || p.asin)?.toString());
      itemsToOrder = cart.items.filter(
        (item) => item.product && selectedIds.includes(item.product._id.toString())
      );
    }

    if (itemsToOrder.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No matching products found in cart for checkout.'
      });
    }

    const orderProducts = [];
    let totalPrice = 0;
    const orderedProductIds = [];

    // 3. Tính tiền và kiểm tra tồn kho CHỈ CHO CÁC SẢN PHẨM ĐƯỢC CHỌN
    for (const item of itemsToOrder) {
      const product = item.product;

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'A product in the cart no longer exists.'
        });
      }

      const productName = product.title || product.name || 'Product';

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product ${productName}.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${productName}.`
        });
      }

      orderProducts.push({
        product: product._id,
        name: productName,
        price: product.price,
        quantity: item.quantity,
        image_url: product.image_url || product.image || ''
      });

      totalPrice += product.price * item.quantity;
      orderedProductIds.push(product._id.toString());
    }

    // 4. Tạo đơn hàng với đúng các sản phẩm được chọn
    const order = await Order.create({
      user: userId,
      products: orderProducts,
      totalPrice,
      phone,
      shippingAddress,
      status: 'Pending'
    });

    // 5. Trừ kho và log tương tác
    for (const item of itemsToOrder) {
      if (item.product && item.product._id) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity }
        });
        logInteraction(userId, item.product._id, 'purchase');
      }
    }

    // 6. CHỈ XÓA các sản phẩm đã đặt khỏi giỏ hàng (giữ lại các sản phẩm chưa tick chọn)
    cart.items = cart.items.filter(
      (item) => item.product && !orderedProductIds.includes(item.product._id.toString())
    );
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create order.',
      error: error.message
    });
  }
};

// GET /api/orders
// Get order history of current user
const getMyOrders = async (req, res) => {
  try {
    const userId =  req.user._id;
    const orders = await Order.find({ user: userId })
      .populate('products.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order history.',
      error: error.message
    });
  }
};

// GET /api/orders/:id
// Get one order belonging to the current user
const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;

    let query = {
      _id: req.params.id
    };

    if (req.user.role !== 1) {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('user', 'username name email')
      .populate('products.product');

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET ALL ORDERS FOR ADMIN
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username name email')
      .populate('products.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE ORDER STATUS FOR ADMIN
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      'Pending',
      'Confirmed',
      'Completed',
      'Cancelled'
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status"
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
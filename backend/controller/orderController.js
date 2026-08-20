const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { logInteraction } = require('../utils/interactionHelper'); // Fixed: Imported helper

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const orderProducts = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(404).json({ success: false, message: 'A product in cart no longer exists.' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Product ${product.name} is out of stock.` });
      }

      orderProducts.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      totalPrice += product.price * item.quantity;
    }

    const order = await Order.create({
      user: userId,
      products: orderProducts,
      totalPrice,
      status: 'Pending'
    });

    // Update stock and log purchase interactions
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
      logInteraction(userId, item.product._id, 'purchase');
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: 'Order created successfully.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create order.', error: error.message });
  }
};

// GET /api/orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ user: userId })
      .populate('products.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order history.', error: error.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }

    const order = await Order.findOne({ _id: id, user: userId }).populate('products.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order details.', error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
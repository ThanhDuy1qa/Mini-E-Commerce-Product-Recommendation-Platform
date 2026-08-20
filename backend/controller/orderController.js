const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { logInteraction } = require('../utils/interactionHelper');

// POST /api/orders
// Create an order from the current user's cart
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    // Cart does not exist or is empty
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty.'
      });
    }

    const orderProducts = [];
    let totalPrice = 0;

    // Validate every product before creating the order
    for (const item of cart.items) {
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
    }

    // Create the order
    const order = await Order.create({
      user: userId,
      products: orderProducts,
      totalPrice,
      status: 'Pending'
    });

    // Reduce product stock and log purchase interactions
    for (const item of cart.items) {
      if (item.product && item.product._id) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity }
        });
        logInteraction(userId, item.product._id, 'purchase');
      }
    }

    // Clear cart after successful checkout
    cart.items = [];
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
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.'
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: userId
    }).populate('products.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details.',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
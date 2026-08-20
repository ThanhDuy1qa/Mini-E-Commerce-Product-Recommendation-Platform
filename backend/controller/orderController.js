const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Interaction = require('../models/Interaction');

// POST /api/orders
// Create an order from the current user's cart
const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id
    }).populate('items.product');

    // Cart does not exist or is empty
    if (!cart || cart.items.length === 0) {
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

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product ${product.name}.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}.`
        });
      }

      orderProducts.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      totalPrice += product.price * item.quantity;
    }

    // Create the order
    const order = await Order.create({
      user: req.user.id,
      products: orderProducts,
      totalPrice,
      status: 'Pending'
    });

    // Reduce product stock
    for (const item of cart.items) {

      // Trừ stock
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stock: -item.quantity
          }
        }
      );


      // Lưu hành vi mua hàng
      await Interaction.create({
        userId: req.user.id,
        productId: item.product._id,
        type: 'purchase'
      });

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
    const orders = await Order.find({
      user: req.user.id
    })
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
      message: 'Failed to get order history.',
      error: error.message
    });
  }
};

// GET /api/orders/:id
// Get one order belonging to the current user
const getOrderById = async (req, res) => {

  try {

    let query = {
      _id: req.params.id
    };


    // Nếu không phải admin
    // chỉ xem order của bản thân
    if (req.user.role !== 1) {

      query.user = req.user.id;

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
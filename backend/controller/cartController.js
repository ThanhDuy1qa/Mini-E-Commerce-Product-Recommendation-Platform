const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Calculate cart total
const calculateTotal = (cart) => {
  return cart.items.reduce((total, item) => {
    if (!item.product) return total;

    return total + item.product.price * item.quantity;
  }, 0);
};

// GET /api/cart
// Get current user's cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user.id
    }).populate('items.product');

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          user: req.user.id,
          items: []
        },
        total: 0
      });
    }

    const total = calculateTotal(cart);

    res.status(200).json({
      success: true,
      cart,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cart.',
      error: error.message
    });
  }
};

// POST /api/cart/items
// Add product to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.'
      });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer.'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (product.stock < parsedQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient product stock.'
      });
    }

    let cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + parsedQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Requested quantity exceeds available stock.'
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: parsedQuantity
      });
    }

    await cart.save();

    await cart.populate('items.product');

    const total = calculateTotal(cart);

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully.',
      cart,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart.',
      error: error.message
    });
  }
};

// PUT /api/cart/items/:productId
// Change product quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer.'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (parsedQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock.'
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product is not in the cart.'
      });
    }

    cartItem.quantity = parsedQuantity;

    await cart.save();

    await cart.populate('items.product');

    const total = calculateTotal(cart);

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully.',
      cart,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item.',
      error: error.message
    });
  }
};

// DELETE /api/cart/items/:productId
// Remove product from cart
const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Product is not in the cart.'
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    await cart.populate('items.product');

    const total = calculateTotal(cart);

    res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully.',
      cart,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from cart.',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
};
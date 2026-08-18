const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  getTopProductsBySeller
} = require('../controller/productController'); //[cite: 5]

// Import Authentication & Authorization Middleware
const { verifySeller } = require('../middleware/authMiddleware'); //[cite: 5]

// Public routes
router.get('/', getProducts); //[cite: 5]
router.get('/seller/:sellerId', getProductsBySeller); //[cite: 5]
router.get('/seller/:sellerId/top', getTopProductsBySeller); //[cite: 5]
router.get('/:id', getProductDetail); //[cite: 5]

// Protected routes (Requires Login & Seller / Admin role)
router.post('/', verifySeller, createProduct); //[cite: 5]
router.put('/:id', verifySeller, updateProduct); //[cite: 5]
router.delete('/:id', verifySeller, deleteProduct); //[cite: 5]

module.exports = router; //[cite: 5]
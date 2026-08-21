const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controller/productController');
const { verifyToken, verifyOptionalToken } = require('../middleware/authMiddleware');


// Route xem chi tiết sản phẩm (Sử dụng verifyOptionalToken nếu muốn lấy req.user khi đã đăng nhập)
router.get('/:id', verifyOptionalToken, getProductDetail);

router.get('/', getProducts);
router.post('/', verifyToken, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;
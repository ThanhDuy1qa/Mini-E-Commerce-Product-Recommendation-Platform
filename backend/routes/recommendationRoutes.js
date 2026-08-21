const express = require('express');
const router = express.Router();
const { getMyRecommendations } = require('../controller/recommendationController');
const { verifyOptionalToken } = require('../middleware/authMiddleware'); // Đổi sang verifyOptionalToken

// Cho phép cả khách chưa đăng nhập truy cập API gợi ý
router.get('/', verifyOptionalToken, getMyRecommendations);

module.exports = router;
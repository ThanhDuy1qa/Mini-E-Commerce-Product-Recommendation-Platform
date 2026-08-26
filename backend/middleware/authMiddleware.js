const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Guard 1: Check if the user is logged in & Active
const verifyToken = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Access denied! You are not logged in." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied! Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.id;

    // Tìm user trong Database để kiểm tra status thực tế
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // 🔴 CHẶN NẾU TÀI KHOẢN ĐANG BỊ BLOCK
    if (user.status === 'Blocked') {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired session!" });
  }
};

// Guard 2: Check if the user is Admin (role = 1)
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    const isUserAdmin = Number(req.user?.role) === 1 || String(req.user?.role).toLowerCase() === 'admin';
    if (isUserAdmin) {
      next();
    } else {
      return res.status(403).json({ success: false, message: "Warning: Only Admins can perform this action!" });
    }
  });
};

// Guard 3: Optional Token Verification
const verifyOptionalToken = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id || decoded.id;
        const user = await User.findById(userId);
        if (user && user.status !== 'Blocked') {
          req.user = user;
        }
      } catch (error) {
        // Token không hợp lệ hoặc hết hạn -> tiếp tục mà không gán req.user
      }
    }
  }
  next();
};

module.exports = { verifyToken, verifyAdmin, verifyOptionalToken };
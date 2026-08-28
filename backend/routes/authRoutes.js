const express = require('express');
const router = express.Router();

const { register, login } = require('../controller/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Routes
router.get('/profile', verifyToken, (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Successfully accessed protected route!", 
        user: req.user 
    });
});

// Admin Route
router.get('/admin/dashboard', verifyToken, verifyAdmin, (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Supreme area: Welcome Admin!" 
    });
});

module.exports = router;
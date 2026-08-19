const express = require('express');
const router = express.Router();

// 1. Import functions from the Controller
const { register, login } = require('../controller/authController');

// 2. Import Guards (Middleware) for authorization
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Register new account API
router.post('/register', register);

// Login API
router.post('/login', login);

// ==========================================
// PROTECTED ROUTES
// ==========================================

// Route for any logged-in User
router.get('/profile', verifyToken, (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Successfully accessed protected route!", 
        user: req.user 
    });
});

// Route specifically for Administrators (Admin: Role 1)
router.get('/admin/dashboard', verifyAdmin, (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Supreme area: Welcome Admin!" 
    });
});

module.exports = router;
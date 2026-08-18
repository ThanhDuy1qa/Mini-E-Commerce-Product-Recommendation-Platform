const express = require('express');
const router = express.Router();

// 1. Import functions from the Controller (contains register, login logic)
const { register, login } = require('../controller/authController');
// 2. Import Guards (Middleware) for authorization
const { verifyToken, verifySeller, verifyAdmin } = require('../middleware/authMiddleware'); //[cite: 6]

// ==========================================
// PUBLIC ROUTES (NO LOGIN REQUIRED)
// ==========================================

// Register new account API
router.post('/register', register); //[cite: 6]

// Login API
router.post('/login', login); //[cite: 6]


// ==========================================
// PROTECTED ROUTES (AUTHORIZATION REQUIRED)
// ==========================================

// Route for any logged-in User
// Guard 1: verifyToken checks if the user has a valid token
router.get('/profile', verifyToken, (req, res) => { //[cite: 6]
    res.status(200).json({ 
        success: true, 
        message: "Successfully accessed the protected route!", //[cite: 6]
        user: req.user // Get user info from token decoding middleware
    });
});

// Route specifically for Sellers and Admins
// Guard 2: verifySeller checks if the role is 1 (Seller) or 2 (Admin)
router.get('/seller/dashboard', verifySeller, (req, res) => { //[cite: 6]
    res.status(200).json({ 
        success: true, 
        message: "Welcome to the Seller dashboard." //[cite: 6]
    });
});

// Route specifically for Administrators (Admin)
// Guard 3: verifyAdmin checks if the role is strictly 2 (Admin)
router.get('/admin/dashboard', verifyAdmin, (req, res) => { //[cite: 6]
    res.status(200).json({ 
        success: true, 
        message: "Supreme area: Welcome Admin!" //[cite: 6]
    });
});

module.exports = router; //[cite: 6]
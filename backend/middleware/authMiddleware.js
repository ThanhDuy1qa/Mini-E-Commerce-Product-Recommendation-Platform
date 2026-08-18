const jwt = require('jsonwebtoken');

// Guard 1: Check if the user is logged in
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: "Access denied! You are not logged in." }); //[cite: 4]

    const token = authHeader.split(" ")[1]; // Get token from "Bearer <token>" string
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'datn_secret_key_sieu_bao_mat'); //[cite: 4]
        req.user = decoded; // Attach user info to the request for next functions
        next(); // Allow to proceed
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired session!" }); //[cite: 4]
    }
};

// Guard 2: Check if the user is a Seller or Admin
const verifySeller = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 1 || req.user.role === 2) { //[cite: 4]
            next();
        } else {
            res.status(403).json({ message: "Warning: You do not have Seller permissions!" }); //[cite: 4]
        }
    });
};

// Guard 3: Check if the user is a Supreme Admin
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 2) { //[cite: 4]
            next();
        } else {
            res.status(403).json({ message: "Warning: Only Admins can perform this action!" }); //[cite: 4]
        }
    });
};

module.exports = { verifyToken, verifySeller, verifyAdmin }; //[cite: 4]
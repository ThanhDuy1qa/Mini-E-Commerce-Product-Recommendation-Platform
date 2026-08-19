const jwt = require('jsonwebtoken');

// Guard 1: Check if the user is logged in
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: "Access denied! You are not logged in." });[cite: 5]

    const token = authHeader.split(" ")[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'datn_secret_key_sieu_bao_mat');[cite: 5]
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired session!" });[cite: 5]
    }
};

// Guard 2: Check if the user is Admin (role = 1)
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 1) { // 1: Admin
            next();
        } else {
            res.status(403).json({ message: "Warning: Only Admins can perform this action!" });[cite: 5]
        }
    });
};

module.exports = { verifyToken, verifyAdmin };
const jwt = require('jsonwebtoken');

// Guard 1: Check if the user is logged in
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: "Access denied! You are not logged in." });

    const token = authHeader.split(" ")[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired session!" });
    }
};

// Guard 2: Check if the user is Admin (role = 1)
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 1) {
            next();
        } else {
            res.status(403).json({ message: "Warning: Only Admins can perform this action!" });
        }
    });
};

// Guard 3: Optional Token Verification (Does not block unauthenticated users)
const verifyOptionalToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // Token invalid or expired, continue without setting req.user
        }
    }
    next();
};

module.exports = { verifyToken, verifyAdmin, verifyOptionalToken };
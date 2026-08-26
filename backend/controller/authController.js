const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User (Name, Email, Password)
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long, with at least 1 uppercase and 1 lowercase letter.'
      });
    }
    const formattedEmail = email.toLowerCase().trim();

    // Check if Email already exists
    const existingUser = await User.findOne({ email: formattedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (default status is Active)
    const user = await User.create({
      name,
      email: formattedEmail,
      password: hashedPassword,
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        status: user.status 
      }
    });
  } catch (error) {
    console.error("❌ Register Error Details:", error);

    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
  }
};

// Login User (Email & Password)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const formattedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: formattedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 🔴 BLOCK LOGIN IF ACCOUNT STATUS IS BLOCKED
    if (user.status === 'Blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    const accessToken = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
  }
};

module.exports = { register, login };
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

    const formattedEmail = email.toLowerCase().trim();

    // Kiểm tra Email đã tồn tại chưa
    const existingUser = await User.findOne({ email: formattedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Tạo user mới
    const user = await User.create({
      name,
      email: formattedEmail,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    // In lỗi chi tiết ra Terminal
    console.error("❌ Register Error Details:", error);

    // Nếu Mongoose báo lỗi trùng E11000 (Duplicate Email)
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

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
  }
};

module.exports = { register, login };
const User = require('../models/User');[cite: 1, 6]
const bcrypt = require('bcryptjs');[cite: 3, 6]

// 1. Get current logged-in user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');[cite: 1, 2, 6]
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user profile.', error: error.message });
  }
};

// 2. Update user profile (Name, amazon_id)
const updateProfile = async (req, res) => {
  try {
    const { name, amazon_id } = req.body;[cite: 1, 6]
    const user = await User.findById(req.user.id);[cite: 2, 6]

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name;[cite: 1, 6]
    if (amazon_id !== undefined) user.amazon_id = amazon_id;[cite: 1, 6]

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.', error: error.message });
  }
};

// 3. Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords.' });
    }

    const user = await User.findById(req.user.id);[cite: 1, 2, 6]
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);[cite: 1, 3, 6]
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);[cite: 1, 3, 6]
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password.', error: error.message });
  }
};

// ==================== ADMIN CONTROLLERS ====================

// 4. Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });[cite: 1, 6]
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users list.', error: error.message });
  }
};

// 5. Update user role (Admin only: 0 - Customer, 1 - Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (![0, 1].includes(Number(role))) {
      return res.status(400).json({ success: false, message: 'Invalid role value (0: Customer, 1: Admin).' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: Number(role) },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User role updated successfully.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user role.', error: error.message });
  }
};

// 6. Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user.', error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  deleteUser
};
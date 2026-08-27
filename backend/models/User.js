const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Number, default: 0 }, // 0: Customer, 1: Admin
  status: { type: String, default: 'Active', enum: ['Active', 'Blocked'] } // Trạng thái tài khoản
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
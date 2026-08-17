const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  amazon_id: { type: String, default: null },
  role: { type: Number, default: 0 }, // 0: Customer, 1: Seller, 2: Admin
  name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
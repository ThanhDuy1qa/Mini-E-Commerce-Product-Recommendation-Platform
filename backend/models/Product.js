const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  asin: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  main_cat: { type: String, required: true }, // Danh mục chính
  description: { type: String, default: '' },
  image_url: { type: String, default: '' },
  price: { type: Number, required: true },
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
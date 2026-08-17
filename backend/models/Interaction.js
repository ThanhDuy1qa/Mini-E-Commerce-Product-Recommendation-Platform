const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  asin: { type: String, required: true },
  main_cat: { type: String, required: true }, // Lưu danh mục để gợi ý theo Category
  action: { 
    type: String, 
    enum: ['view', 'add_to_cart', 'purchase'], 
    required: true 
  },
  weight: { type: Number, default: 1 } // view = 1, add_to_cart = 3, purchase = 5
}, { timestamps: true });

module.exports = mongoose.model('Interaction', interactionSchema);
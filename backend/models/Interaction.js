const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: {
    type: String,
    enum: ['view_product', 'add_to_cart', 'purchase'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Interaction', interactionSchema);
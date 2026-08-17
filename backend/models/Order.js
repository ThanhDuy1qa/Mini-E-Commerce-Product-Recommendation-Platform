const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  asin: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingInfo: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  paymentMethod: { type: String, default: 'COD' },
  status: { type: String, default: 'Hoàn thành' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
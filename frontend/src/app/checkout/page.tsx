'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart(); 
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'COD',
  });

  const subtotal = cart.reduce((acc, item) => {
    return acc + (item.price || 0) * (item.quantity || 1);
  }, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      // 1. Định dạng mảng sản phẩm hỗ trợ cả 2 dạng tên trường (title/name, image/image_url)
      const formattedItems = cart.map((item) => ({
        product: item._id || item.asin,
        productId: item._id || item.asin,
        title: item.title,
        name: item.title,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image_url,
        image_url: item.image_url,
      }));

      // 2. Tạo Payload tổng hợp tương thích mọi Mongoose Order Schema
      const payload = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        },
        paymentMethod: formData.paymentMethod,
        items: formattedItems,
        orderItems: formattedItems,
        products: formattedItems,
        totalAmount: subtotal,
        totalPrice: subtotal,
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // 3. Xóa giỏ hàng local state & gửi API xóa giỏ hàng trên DB
        if (clearCart) {
          await clearCart();
        } else {
          localStorage.removeItem('mini_cart');
        }

        await fetch('http://localhost:5000/api/cart', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});

        alert('Order placed successfully!');
        router.push('/orders');
      } else {
        console.error('Backend rejected order:', data);
        alert(`Order failed: ${data.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Unable to connect to server!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Form điền thông tin */}
      <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Shipping Information</h2>
        <form onSubmit={handleSubmitOrder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Main Street, Suite 100"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="BankTransfer">Bank Transfer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || cart.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition duration-200 mt-6 disabled:opacity-50"
          >
            {submitting ? 'Processing...' : `Place Order ($${subtotal.toFixed(2)})`}
          </button>
        </form>
      </div>

      {/* Tóm tắt đơn hàng */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h3>

        {cart.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">Your cart is empty.</p>
        ) : (
          <div className="divide-y divide-gray-100 mb-4 max-h-80 overflow-y-auto pr-1">
            {cart.map((item, index) => (
              <div key={item._id || index} className="py-3 flex items-center justify-between gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity} × ${(item.price).toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Shipping</span>
            <span className="text-emerald-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-3 mt-2">
            <span>Total</span>
            <span className="text-emerald-600">${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
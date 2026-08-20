'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  _id?: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'COD',
  });

  // Lấy dữ liệu giỏ hàng chuẩn từ Backend API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          const items = data.cart?.items || data.items || [];
          setCartItems(items);
        }
      } catch (err) {
        console.error('Error fetching cart from server:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.productId?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            address: formData.address,
          },
          paymentMethod: formData.paymentMethod,
          items: cartItems,
          totalAmount: subtotal,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Order placed successfully!');
        router.push('/orders');
      } else {
        alert(`Order failed: ${data.message || 'Please try again'}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Unable to connect to server!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-600 font-medium">Loading checkout details...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Form điền thông tin giao hàng */}
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
            disabled={submitting || cartItems.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition duration-200 mt-6 disabled:opacity-50"
          >
            {submitting ? 'Processing...' : `Place Order ($${subtotal.toFixed(2)})`}
          </button>
        </form>
      </div>

      {/* Tóm tắt đơn hàng */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h3>

        {cartItems.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">Your cart is empty.</p>
        ) : (
          <div className="divide-y divide-gray-100 mb-4 max-h-80 overflow-y-auto pr-1">
            {cartItems.map((item, index) => (
              <div key={item._id || index} className="py-3 flex items-center justify-between gap-3">
                {item.productId?.image && (
                  <img
                    src={item.productId.image}
                    alt={item.productId?.name || 'Product'}
                    className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {item.productId?.name || 'Product'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity} × ${(item.productId?.price || 0).toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  ${((item.productId?.price || 0) * item.quantity).toFixed(2)}
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
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, clearCart, removeFromCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'COD',
  });

  // 1. Lấy danh sách ID sản phẩm được tick chọn từ URL parameter
  const selectedParam = searchParams.get('selected');
  const selectedIds = selectedParam ? selectedParam.split(',') : [];

  // 2. Lọc ra các sản phẩm thực sự được chọn trong giỏ hàng
  const checkoutItems = cart.filter((item) => {
    const id = item._id || item.asin;
    return id && selectedIds.includes(id);
  });

  // Nếu có truyền parameter `selected` thì chỉ hiển thị sản phẩm được chọn, ngược lại hiển thị cả giỏ
  const displayItems = selectedIds.length > 0 ? checkoutItems : cart;

  // 3. Tính tổng tiền dựa trên danh sách sản phẩm hiển thị
  const subtotal = displayItems.reduce((acc, item) => {
    return acc + (item.price || 0) * (item.quantity || 1);
  }, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to complete your order!');
      router.push('/login');
      return;
    }

    if (displayItems.length === 0) {
      alert('No products selected for checkout!');
      return;
    }

    const phone = formData.phone.trim();
    const shippingAddress = formData.address.trim();

    // Validate số điện thoại 10 chữ số
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid 10-digit phone number (e.g., 0901234567)!');
      return;
    }

    if (!shippingAddress) {
      alert('Please enter shipping address!');
      return;
    }

    setSubmitting(true);

    try {
      // Chuẩn hóa danh sách sản phẩm gửi lên Backend
      const formattedItems = displayItems.map((item) => ({
        product: item._id || item.asin,
        name: item.title || 'Product',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image_url: item.image_url || '',
      }));

      const payload = {
        phone,
        shippingAddress,
        fullName: formData.fullName.trim(),
        paymentMethod: formData.paymentMethod,
        products: formattedItems,
        totalPrice: subtotal,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Nếu mua toàn bộ giỏ hàng -> xóa hết; nếu mua một phần -> chỉ xóa sản phẩm đã mua
        if (displayItems.length === cart.length) {
          await clearCart();
        } else if (typeof removeFromCart === 'function') {
          for (const item of displayItems) {
            const id = item._id || item.asin;
            if (id) await removeFromCart(id);
          }
        }

        alert('Order placed successfully!');
        router.push('/orders');
      } else {
        alert(`Order failed: ${data.message || data.error || 'Server error'}`);
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
      {/* Cột trái: Thông tin giao hàng */}
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
              placeholder="Your Name"
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
              placeholder="Your phone number"
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
              placeholder="Your Address"
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
            disabled={submitting || displayItems.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition duration-200 mt-6 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Processing...' : `Place Order ($${subtotal.toFixed(2)})`}
          </button>
        </form>
      </div>

      {/* Cột phải: Tóm tắt đơn hàng */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h3>

        {displayItems.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">No products selected for checkout.</p>
        ) : (
          <div className="divide-y divide-gray-100 mb-4 max-h-80 overflow-y-auto pr-1">
            {displayItems.map((item, index) => (
              <div key={item._id || item.asin || index} className="py-3 flex items-center justify-between gap-3">
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
                    Qty: {item.quantity || 1} × ${(Number(item.price) || 0).toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
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

// Bọc Component bằng Suspense để tránh lỗi Render SSR khi dùng useSearchParams trong Next.js App Router
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-gray-500 font-medium">
          Loading checkout...
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
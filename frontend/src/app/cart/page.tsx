"use client";
import Link from "next/link";
// Đường dẫn lùi 2 cấp (../../) ra ngoài
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  // Lấy thêm hàm updateQuantity ra để sử dụng
  const { cart, removeFromCart, updateQuantity } = useCart();

  const subtotal = (Array.isArray(cart) ? cart : []).reduce(
    (sum, item) => sum + item.price * (item.quantity || 1), 0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-6 text-xl">Your cart is empty.</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="lg:w-2/3 space-y-4">
            {/* Thêm tham số index ở .map() */}
            {cart.map((item, index) => (
              <div 
                key={item._id || item.id || item.asin || index} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-5 flex items-center gap-6"
              >
                <img src={item.image_url} alt={item.title} className="w-24 h-24 object-cover rounded-xl border border-gray-100" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.title}</h3>
                  <p className="text-red-600 font-extrabold mt-1">${item.price.toFixed(2)}</p>
                  
                  {/* THANH TĂNG GIẢM SỐ LƯỢNG (+/-) */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-sm font-semibold text-gray-500">Quantity:</span>
                    <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <button 
                        onClick={() => updateQuantity(item.asin, -1)} 
                        className="px-3 py-1 text-gray-600 hover:bg-gray-200 hover:text-red-500 transition font-bold"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 font-bold text-gray-900 bg-white border-x border-gray-200">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.asin, 1)} 
                        className="px-3 py-1 text-gray-600 hover:bg-gray-200 hover:text-green-600 transition font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                </div>
                <button
                  onClick={() => removeFromCart(item.asin)}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition whitespace-nowrap"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-lg font-medium text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mb-8 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-black text-red-600">${subtotal.toFixed(2)}</span>
              </div>
              
              <Link
                href="/checkout"
                className="block text-center w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition shadow-xl shadow-green-500/30"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
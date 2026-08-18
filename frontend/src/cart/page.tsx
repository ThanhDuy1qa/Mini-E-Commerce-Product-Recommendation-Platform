import Link from "next/link";

const mockCartItems = [
  { id: 1, name: "Men's Basic T-Shirt", price: 15.99, quantity: 2, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80", category: "Fashion" },
  { id: 3, name: "Waterproof Laptop Backpack", price: 30.50, quantity: 1, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80", category: "Accessories" },
];

export default function CartPage() {
  const total = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 bg-white rounded-2xl shadow-md overflow-hidden">
          {mockCartItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">Your cart is empty.</p>
              <Link href="/" className="text-blue-600 font-semibold hover:underline">Continue Shopping</Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {mockCartItems.map((item) => (
                <li key={item.id} className="p-6 flex items-center flex-col sm:flex-row gap-4 sm:gap-0">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl shadow-sm" />
                  
                  <div className="sm:ml-6 flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="text-blue-600 font-semibold mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors">-</button>
                      <span className="px-4 py-2 font-semibold text-gray-900">{item.quantity}</span>
                      <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors">+</button>
                    </div>
                    <button className="text-red-500 hover:text-red-700 font-bold transition-colors">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600">
              <span>Shipping:</span>
              <span className="text-green-600 font-semibold">Free</span>
            </div>
            
            <div className="flex justify-between mb-8 border-t border-gray-200 pt-6">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-2xl font-black text-red-600">${total.toFixed(2)}</span>
            </div>
            
            <Link href="/checkout" className="block text-center w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
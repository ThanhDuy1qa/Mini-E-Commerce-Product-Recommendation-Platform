import Link from "next/link";

// Mock data 20 sản phẩm (Đã bổ sung Size, Màu sắc và Lời nhắc ghi chú vào Description cho đồ thời trang)
export const mockProducts = [
  // Fashion
  { asin: "PROD001", title: "Men's Basic T-Shirt", price: 15.99, main_cat: "Fashion", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80", description: "100% breathable cotton T-shirt. Available sizes: S, M, L, XL. Colors: Black, White, Navy. (Please specify your size and color in the order notes at checkout).", stock: 25 },
  { asin: "PROD002", title: "Classic Denim Jacket", price: 49.99, main_cat: "Fashion", image_url: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&q=80", description: "Vintage blue denim jacket. Perfect for autumn wear. Available sizes: M, L, XL. Colors: Light Blue, Dark Wash. (Please leave a size/color note at checkout).", stock: 12 },
  { asin: "PROD003", title: "Women's Summer Dress", price: 29.50, main_cat: "Fashion", image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80", description: "Floral summer dress with a comfortable fit. Available sizes: S, M. Colors: Red Floral, Yellow Floral. (Note your preference at checkout).", stock: 8 },
  { asin: "PROD004", title: "Cotton Sweatpants", price: 22.00, main_cat: "Fashion", image_url: "https://images.unsplash.com/photo-1584865288642-42078afe6942?w=500&q=80", description: "Cozy sweatpants for lounging or working out. Sizes: S, M, L. Colors: Grey, Black. (Specify size and color when checking out).", stock: 30 },

  // Footwear
  { asin: "PROD005", title: "Running Sneakers", price: 45.00, main_cat: "Footwear", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", description: "Lightweight running shoes with high-elasticity rubber sole. Sizes: 39, 40, 41. Colors: Neon Green, Black. (Leave a note for size and color).", stock: 18 },
  { asin: "PROD006", title: "Leather Oxford Shoes", price: 65.00, main_cat: "Footwear", image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80", description: "Genuine leather formal shoes. Classic design. Sizes: 41, 42, 43. Colors: Brown, Black. (Add a note at checkout).", stock: 10 },
  { asin: "PROD007", title: "Casual Canvas Sneakers", price: 25.00, main_cat: "Footwear", image_url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80", description: "Everyday canvas shoes. Easy to clean. Sizes: 38, 39, 40. Colors: White, Classic Black. (Note size/color at checkout).", stock: 40 },
  { asin: "PROD008", title: "Women's High Heels", price: 55.00, main_cat: "Footwear", image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80", description: "Elegant black high heels for parties. Heel height: 7cm. Sizes: 36, 37, 38. Colors: Nude, Black. (Specify size and color at checkout).", stock: 0 }, 

  // Accessories
  { asin: "PROD009", title: "Waterproof Backpack", price: 30.50, main_cat: "Accessories", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80", description: "Fits up to 15.6-inch laptops. 100% waterproof material. Colors: Black, Navy. (Specify color at checkout).", stock: 14 },
  { asin: "PROD010", title: "Sports Baseball Cap", price: 8.99, main_cat: "Accessories", image_url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80", description: "Sporty baseball cap, breathable cotton material, adjustable fit. Colors: Red, White, Blue. (Note your color at checkout).", stock: 22 },
  { asin: "PROD011", title: "Leather Wallet", price: 20.00, main_cat: "Accessories", image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80", description: "Minimalist bifold leather wallet with RFID blocking.", stock: 35 },
  { asin: "PROD012", title: "Polarized Sunglasses", price: 18.50, main_cat: "Accessories", image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80", description: "UV400 protection sunglasses with scratch-resistant lenses.", stock: 0 }, 

  // Electronics
  { asin: "PROD013", title: "Smart Fitness Watch", price: 120.00, main_cat: "Electronics", image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", description: "Health tracking, heart rate monitor, step counter, and smart notifications.", stock: 15 },
  { asin: "PROD014", title: "Wireless Bluetooth Earbuds", price: 55.00, main_cat: "Electronics", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", description: "High-quality sound, 24h battery life, ergonomic design.", stock: 28 },
  { asin: "PROD015", title: "Mechanical Keyboard", price: 85.00, main_cat: "Electronics", image_url: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80", description: "RGB gaming keyboard with tactile blue switches.", stock: 0 }, 
  { asin: "PROD016", title: "Gaming Mouse", price: 35.99, main_cat: "Electronics", image_url: "https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=500&q=80", description: "High-precision 10,000 DPI sensor mouse with customizable buttons.", stock: 11 },

  // Home & Living
  { asin: "PROD017", title: "Ceramic Coffee Mug", price: 10.50, main_cat: "Home & Living", image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80", description: "Minimalist 12oz ceramic mug, microwave and dishwasher safe.", stock: 60 },
  { asin: "PROD018", title: "Aromatherapy Diffuser", price: 28.00, main_cat: "Home & Living", image_url: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=500&q=80", description: "Ultrasonic essential oil diffuser with 7-color LED lights.", stock: 16 },
  { asin: "PROD019", title: "Orthopedic Pillow", price: 32.00, main_cat: "Home & Living", image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80", description: "Memory foam pillow designed to relieve neck and back pain.", stock: 0 }, 
  { asin: "PROD020", title: "Non-Stick Frying Pan", price: 42.00, main_cat: "Home & Living", image_url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&q=80", description: "10-inch scratch-resistant pan, suitable for all stovetops.", stock: 10 },
];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-blue-600 rounded-2xl p-8 mb-10 text-white text-center shadow-lg">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to MiniShop</h1>
        <p className="text-blue-100 text-lg">Discover products recommended just for you!</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <div key={product.asin} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <img src={product.image_url} alt={product.title} className="w-full h-56 object-cover" />
            <div className="p-5">
              <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">{product.main_cat}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">{product.title}</h3>
              <p className="text-red-600 font-bold mt-2 text-xl">${product.price.toFixed(2)}</p>
              
              <Link href={`/product/${product.asin}`} className="mt-4 block w-full text-center bg-gray-100 text-gray-800 font-semibold py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
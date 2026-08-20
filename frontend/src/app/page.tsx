'use client';

import { useState } from "react";
import Link from "next/link";

export const mockProducts = [
  // Fashion
  { asin: "PROD001", title: "Men's Basic T-Shirt", price: 15.99, main_cat: "Fashion", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80", description: "100% breathable cotton T-shirt. Available sizes: S, M, L, XL. Colors: Black, White, Navy.", stock: 25 },
  { asin: "PROD002", title: "Classic Denim Jacket", price: 49.99, main_cat: "Fashion", image_url: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&q=80", description: "Vintage blue denim jacket. Available sizes: M, L, XL.", stock: 12 },
  { asin: "PROD003", title: "Women's Summer Dress", price: 29.50, main_cat: "Fashion", image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80", description: "Floral summer dress. Available sizes: S, M.", stock: 8 },
  { asin: "PROD004", title: "Cotton Sweatpants", price: 22.00, main_cat: "Fashion", image_url: "https://images.unsplash.com/photo-1584865288642-42078afe6942?w=500&q=80", description: "Cozy sweatpants. Sizes: S, M, L.", stock: 30 },

  // Footwear
  { asin: "PROD005", title: "Running Sneakers", price: 45.00, main_cat: "Footwear", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", description: "Lightweight running shoes. Sizes: 39, 40, 41.", stock: 18 },
  { asin: "PROD006", title: "Leather Oxford Shoes", price: 65.00, main_cat: "Footwear", image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80", description: "Genuine leather formal shoes. Sizes: 41, 42, 43.", stock: 10 },
  { asin: "PROD007", title: "Casual Canvas Sneakers", price: 25.00, main_cat: "Footwear", image_url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80", description: "Everyday canvas shoes. Sizes: 38, 39, 40.", stock: 40 },
  { asin: "PROD008", title: "Women's High Heels", price: 55.00, main_cat: "Footwear", image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80", description: "Elegant black high heels. Sizes: 36, 37, 38.", stock: 0 }, 

  // Accessories
  { asin: "PROD009", title: "Waterproof Backpack", price: 30.50, main_cat: "Accessories", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80", description: "Fits up to 15.6-inch laptops.", stock: 14 },
  { asin: "PROD010", title: "Sports Baseball Cap", price: 8.99, main_cat: "Accessories", image_url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80", description: "Sporty adjustable baseball cap.", stock: 22 },
  { asin: "PROD011", title: "Leather Wallet", price: 20.00, main_cat: "Accessories", image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80", description: "Minimalist bifold leather wallet.", stock: 35 },
  { asin: "PROD012", title: "Polarized Sunglasses", price: 18.50, main_cat: "Accessories", image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80", description: "UV400 protection sunglasses.", stock: 0 }, 

  // Electronics
  { asin: "PROD013", title: "Smart Fitness Watch", price: 120.00, main_cat: "Electronics", image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", description: "Health tracking and smart notifications.", stock: 15 },
  { asin: "PROD014", title: "Wireless Bluetooth Earbuds", price: 55.00, main_cat: "Electronics", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", description: "High-quality sound, 24h battery.", stock: 28 },
  { asin: "PROD015", title: "Mechanical Keyboard", price: 85.00, main_cat: "Electronics", image_url: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80", description: "RGB gaming keyboard.", stock: 0 }, 
  { asin: "PROD016", title: "Gaming Mouse", price: 35.99, main_cat: "Electronics", image_url: "https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=500&q=80", description: "High-precision 10,000 DPI sensor mouse.", stock: 11 },

  // Home & Living
  { asin: "PROD017", title: "Ceramic Coffee Mug", price: 10.50, main_cat: "Home & Living", image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80", description: "Minimalist 12oz ceramic mug.", stock: 60 },
  { asin: "PROD018", title: "Aromatherapy Diffuser", price: 28.00, main_cat: "Home & Living", image_url: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=500&q=80", description: "Ultrasonic essential oil diffuser.", stock: 16 },
  { asin: "PROD019", title: "Orthopedic Pillow", price: 32.00, main_cat: "Home & Living", image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80", description: "Memory foam pillow.", stock: 0 }, 
  { asin: "PROD020", title: "Non-Stick Frying Pan", price: 42.00, main_cat: "Home & Living", image_url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&q=80", description: "10-inch scratch-resistant pan.", stock: 10 },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Fashion", "Footwear", "Accessories", "Electronics", "Home & Living"];
  const mockRecommendations = mockProducts.slice(12, 16);

  const trackInteraction = (eventType, productId) => {
    console.log(`[EVENT TRACKING] Sent '${eventType}' for Product ID: ${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    trackInteraction('add_to_cart', product.asin);
    alert(`Added "${product.title}" to cart!`);
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.main_cat === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Banner Hero */}
      <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-white text-center shadow-md">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Welcome to MiniShop</h1>
        <p className="text-blue-100 text-base md:text-lg">Discover products recommended just for you!</p>
      </div>

      {/* RECOMMENDED FOR YOU */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Recommended For You ✨
          </h2>
          <p className="text-sm text-gray-500 mt-1">Based on your browsing history</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {mockRecommendations.map((product) => (
            <Link 
              key={product.asin}
              href={`/product/${product.asin}`}
              onClick={() => trackInteraction('view_product', product.asin)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="w-full h-48 object-cover bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block">
                    {product.main_cat}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mt-2 truncate group-hover:text-blue-600 transition-colors">{product.title}</h3>
                  <p className="text-red-600 font-extrabold text-xl mt-1">${product.price.toFixed(2)}</p>
                </div>
              </div>

              
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="space-y-6">
        {/* Header + Search Bar + Category Filters */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-xs text-gray-500 mt-0.5">Showing {filteredProducts.length} results</p>
            </div>

            {/* Ô Search Tương Tác Cao (Nổi bật rõ ràng) */}
            <div className="w-full md:w-80 relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 text-sm font-semibold placeholder-gray-500 shadow-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition duration-200"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-base">🔍</span>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 text-xs font-bold bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-semibold transition text-sm ${
                  selectedCategory === cat 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <p className="text-gray-500 text-base font-semibold">No products found matching "{searchTerm}"</p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
              className="text-sm text-blue-600 font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link 
                key={product.asin}
                href={`/product/${product.asin}`}
                onClick={() => trackInteraction('view_product', product.asin)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className="w-full h-48 object-cover bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block">
                      {product.main_cat}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-2 truncate group-hover:text-blue-600 transition-colors">{product.title}</h3>
                    <p className="text-red-600 font-extrabold text-xl mt-1">${product.price.toFixed(2)}</p>
                  </div>
                </div>
                
                
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
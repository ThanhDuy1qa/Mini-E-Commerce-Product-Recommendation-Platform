"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  _id?: string;
  asin?: string;
  name?: string;
  title?: string;
  price: number;
  category?: string;
  main_cat?: string;
  image?: string;
  image_url?: string;
  description?: string;
  stock?: number;
}

interface Category {
  _id?: string;
  name: string;
  image_url?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]); // BỔ SUNG STATE GỢI Ý
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Cấu hình header linh hoạt
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 1. Gọi API Gợi Ý (Chạy cho cả khách chưa đăng nhập lẫn người dùng đã đăng nhập)
  fetch("http://localhost:5000/api/recommendations", { headers })
    .then((res) => res.json())
    .then((data) => {
      if (data?.success && Array.isArray(data.data)) {
        setRecommendations(data.data.slice(0, 5));
      }
    })
    .catch((err) => console.error("Error fetching recommendations:", err));

  // 2. Gọi API lấy tất cả sản phẩm
  fetch("http://localhost:5000/api/products")
    .then((res) => res.json())
    .then((data) => {
      if (data?.success) setProducts(data.products || []);
    })
    .catch((err) => console.error("Error fetching products:", err))
    .finally(() => setIsLoading(false));

  // 3. Gọi API lấy danh mục
  fetch("http://localhost:5000/api/categories")
    .then((res) => res.json())
    .then((data) => {
      if (data?.success && Array.isArray(data.categories)) {
        const fetchedNames = data.categories.map((cat: Category) => cat.name);
        setCategories(["All", ...fetchedNames]);
      }
    })
    .catch((err) => console.error("Error fetching categories:", err));
}, []);

  // Lọc sản phẩm theo tìm kiếm và danh mục
  const filteredProducts = products.filter((product) => {
    const productName = product.name || product.title || "";
    const productCategory = product.category || product.main_cat || "";

    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || productCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner & Ô tìm kiếm */}
      <div className="bg-blue-600 rounded-2xl p-8 mb-8 text-white text-center shadow-lg">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to MiniShop</h1>
        <p className="text-blue-100 text-lg mb-6">Discover products recommended just for you!</p>
        
        <div className="max-w-md mx-auto">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-md"
          />
        </div>
      </div>

      {/* KHỐI HIỂN THỊ Top 5 Sản phẩm Gợi ý (Chỉ hiện khi có dữ liệu) */}
      {recommendations.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ✨ Recommended For You
            </h2>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">
              Top 5 Personal Picks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recommendations.map((product) => {
              const id = product._id || product.asin;
              const name = product.name || product.title;
              const image = product.image || product.image_url;
              const category = product.category || product.main_cat;

              return (
                <div 
                  key={`rec-${id}`} 
                  className="bg-white rounded-xl shadow-md border-2 border-blue-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
                >
                  <div>
                    <img src={image} alt={name} className="w-full h-44 object-cover" />
                    <div className="p-4">
                      <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider">{category}</span>
                      <h3 className="text-sm font-bold text-gray-900 mt-2 truncate" title={name}>{name}</h3>
                      <p className="text-red-600 font-bold mt-1 text-lg">${product.price?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 pt-0">
                    <Link 
                      href={`/product/${id}`} 
                      className="block w-full text-center bg-blue-600 text-white font-semibold text-sm py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bộ lọc Danh mục động từ Backend */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl font-semibold transition ${
              selectedCategory === cat 
                ? "bg-blue-600 text-white shadow-md" 
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Header Danh sách tất cả sản phẩm */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
        <span className="text-sm text-gray-500">Showing {filteredProducts.length} results</span>
      </div>
      
      {/* Hiển thị sản phẩm hoặc trạng thái Loading/Rỗng */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm text-gray-500">
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 text-lg">No products found matching your request.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const id = product._id || product.asin;
            const name = product.name || product.title;
            const image = product.image || product.image_url;
            const category = product.category || product.main_cat;

            return (
              <div 
                key={id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <img src={image} alt={name} className="w-full h-56 object-cover" />
                  <div className="p-5">
                    <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">{category}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">{name}</h3>
                    <p className="text-red-600 font-bold mt-2 text-xl">${product.price?.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="p-5 pt-0">
                  <Link 
                    href={`/product/${id}`} 
                    className="block w-full text-center bg-gray-100 text-gray-800 font-semibold py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
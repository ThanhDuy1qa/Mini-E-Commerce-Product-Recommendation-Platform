"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  _id?: string;
  asin?: string;
  id?: string;
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
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 1. Gọi API Gợi ý thật từ Backend
    fetch("http://localhost:5000/api/recommendations", { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        return res.json();
      })
      .then((data) => {
        const recList = data?.data || data?.recommendations || (Array.isArray(data) ? data : []);
        if (Array.isArray(recList)) {
          setRecommendations(recList.slice(0, 5));
        }
      })
      .catch((err) => {
        console.error("Error fetching recommendations:", err);
        setRecommendations([]);
      });

    // 2. Gọi API lấy tất cả sản phẩm
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setProducts(data.products || []);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
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
        } else if (Array.isArray(data)) {
          const fetchedNames = data.map((cat: Category | string) =>
            typeof cat === "string" ? cat : cat.name
          );
          setCategories(["All", ...fetchedNames]);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Lọc sản phẩm theo từ khóa tìm kiếm và danh mục
  const filteredProducts = products.filter((product) => {
    const productName = product.name || product.title || "";
    const productCategory = product.category || product.main_cat || "";

    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || productCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner chào mừng */}
      <div className="bg-blue-600 rounded-2xl p-8 text-white text-center shadow-lg">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">Welcome to MiniShop</h1>
        <p className="text-blue-100 text-base md:text-lg mb-6">
          Discover products recommended just for you!
        </p>

        {/* Ô Tìm kiếm nhanh trên Banner */}
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-md text-sm font-medium"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Block Sản phẩm Gợi ý Thực tế (Recommended For You) */}
      {recommendations.length > 0 && (
        <section className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-6 md:p-8 rounded-3xl border border-blue-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>✨</span> Recommended For You
              </h2>

            </div>
            <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
              Personalized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recommendations.map((item) => {
              const id = item._id || item.asin || item.id;
              const name = item.name || item.title || "Recommended Item";
              const image = item.image || item.image_url || "https://via.placeholder.com/300";
              const category = item.category || item.main_cat || "General";

              return (
                <div
                  key={`rec-${id}`}
                  className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="overflow-hidden rounded-xl bg-gray-50 mb-3 aspect-square">
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors" title={name}>
                      {name}
                    </h3>
                    <p className="text-red-600 font-extrabold text-lg mt-1">
                      ${item.price?.toFixed(2)}
                    </p>
                  </div>

                  <Link
                    href={`/product/${id}`}
                    className="mt-3 block w-full text-center bg-blue-50 text-blue-700 font-bold py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors text-xs"
                  >
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Khu vực Tiêu đề & Bộ lọc Danh mục */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-xs text-gray-500 mt-0.5">Showing {filteredProducts.length} results</p>
          </div>
        </div>

        {/* Nút lọc danh mục */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
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

      {/* Danh sách sản phẩm chính */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500 font-semibold">
          Loading products from server...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <p className="text-gray-500 text-base font-semibold">
            No products found matching "{searchTerm}"
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="text-sm text-blue-600 font-bold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const id = product._id || product.asin || product.id;
            const name = product.name || product.title || "Product";
            const image = product.image || product.image_url || "https://via.placeholder.com/300";
            const category = product.category || product.main_cat || "General";

            return (
              <div
                key={id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="overflow-hidden">
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-48 object-cover bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block">
                      {category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-2 truncate group-hover:text-blue-600 transition-colors" title={name}>
                      {name}
                    </h3>
                    <p className="text-red-600 font-extrabold text-xl mt-1">
                      ${product.price?.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    href={`/product/${id}`}
                    className="block w-full text-center bg-gray-100 text-gray-800 font-bold py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors text-sm"
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
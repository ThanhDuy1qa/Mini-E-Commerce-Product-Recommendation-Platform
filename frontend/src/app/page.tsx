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

// Dữ liệu mẫu gợi ý khi chưa đăng nhập hoặc API Backend chưa hoàn tất
const MOCK_RECOMMENDATIONS: Product[] = [
  {
    _id: "rec1",
    name: "Bàn phím cơ Custom K87 RGB",
    price: 120.0,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
  },
  {
    _id: "rec2",
    name: "Chuột Gaming Không Dây Ergonomic",
    price: 45.5,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
  },
  {
    _id: "rec3",
    name: "Tai nghe Bluetooth Over-Ear",
    price: 85.5,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  },
  {
    _id: "rec4",
    name: "Lót chuột Chống Nước RGB XL",
    price: 25.0,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [recommendations, setRecommendations] = useState<Product[]>(MOCK_RECOMMENDATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    // 1. Lấy danh sách sản phẩm từ Backend
    fetch("http://localhost:5000/api/products")
      .then((res) => {
        if (!res.ok) throw new Error(`Products API error status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          setProducts(data.products || []);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setIsLoading(false));

    // 2. Lấy danh sách Category động từ Backend
    fetch("http://localhost:5000/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error(`Categories API error status: ${res.status}`);
        return res.json();
      })
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

    // 3. Lấy sản phẩm gợi ý dựa trên User Token
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      fetch("http://localhost:5000/api/recommendations/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Recommendations API not ready");
          return res.json();
        })
        .then((data) => {
          const recList = Array.isArray(data) ? data : data?.recommendations || [];
          if (recList.length > 0) {
            setRecommendations(recList);
          }
        })
        .catch(() => {
          // Giữ nguyên MOCK_RECOMMENDATIONS khi backend chưa xong
        });
    }
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
      {/* Banner chào mừng gọn gàng */}
      <div className="bg-blue-600 rounded-2xl p-8 text-white text-center shadow-lg">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">Welcome to MiniShop</h1>
        <p className="text-blue-100 text-base md:text-lg">
          Discover products recommended just for you!
        </p>
      </div>

      {/* Block Sản phẩm Gợi ý (Recommended For You) */}
      <section className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-6 md:p-8 rounded-3xl border border-blue-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>✨</span> Recommended For You
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sản phẩm đề xuất dựa trên sở thích và tương tác của bạn
            </p>
          </div>
          <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
            Personalized
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {recommendations.slice(0, 4).map((item) => {
            const id = item._id || item.asin || item.id;
            const name = item.name || item.title || "Recommended Item";
            const image = item.image || item.image_url || "https://via.placeholder.com/300";

            return (
              <div
                key={id}
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
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
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

      {/* Khu vực Tiêu đề, Ô Tìm kiếm & Bộ lọc Danh mục */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-xs text-gray-500 mt-0.5">Showing {filteredProducts.length} results</p>
          </div>

          {/* Ô Tìm kiếm được di chuyển xuống đây */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
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
                    <h3 className="font-bold text-gray-900 text-base mt-2 truncate group-hover:text-blue-600 transition-colors">
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
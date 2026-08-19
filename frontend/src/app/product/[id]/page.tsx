"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

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
  stock: number;
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy thông tin chi tiết sản phẩm từ Backend
  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.product);
        }
      })
      .catch((err) => console.error("Error fetching product detail:", err))
      .finally(() => setIsLoading(false));
  }, [resolvedParams.id]);

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading product detail...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">Product Not Found!</h1>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const productName = product.name || product.title || "Product";
  const productImage = product.image || product.image_url || "";
  const productCategory = product.category || product.main_cat || "General";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-block mb-8 text-blue-600 font-semibold hover:text-blue-800 transition-colors">
        ← Back to Products
      </Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src={productImage} 
              alt={productName} 
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
          </div>
          
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">{productCategory}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-4">{productName}</h1>
            <p className="text-3xl font-bold text-red-600 mb-6">${product.price?.toFixed(2)}</p>
            
            <div className="border-t border-b border-gray-200 py-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
              
              <p className="text-sm font-semibold">
                Availability: <span className={isOutOfStock ? "text-red-500" : "text-green-600"}>
                  {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock} items)`}
                </span>
              </p>
            </div>
            
            <button 
              disabled={isOutOfStock}
              onClick={() => addToCart(product)}
              className={`w-full font-bold text-lg py-4 rounded-xl transition-all shadow-lg 
                ${isOutOfStock 
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed shadow-none" 
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30"}`}
            >
              {isOutOfStock ? "🚫 Out of Stock" : "🛒 Add to Cart"}
            </button>
            
          </div>
        </div>
      </div>

      {/* KHU VỰC RECOMMENDATION UI CHÈN THÊM VÀO DƯỚI CÙNG CỦA PRODUCT DETAIL */}
      <div className="mt-16 border-t border-gray-300 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Lấy tạm 4 sản phẩm đầu tiên làm gợi ý */}
          {mockProducts.slice(0, 4).map((recProduct) => (
            <div key={recProduct.asin} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <img src={recProduct.image_url} alt={recProduct.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900 truncate">{recProduct.title}</h3>
                <p className="text-red-600 font-bold mt-1">${recProduct.price.toFixed(2)}</p>
                <Link href={`/product/${recProduct.asin}`} className="mt-3 block text-center bg-blue-50 text-blue-600 text-sm font-bold py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-blue-600 rounded-2xl p-8 mb-10 text-white text-center shadow-lg">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to MiniShop</h1>
        <p className="text-blue-100 text-lg">Discover products recommended just for you!</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img src={product.image} alt={product.name} className="w-full h-56 object-cover" />
              <div className="p-5">
                <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">{product.category}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">{product.name}</h3>
                <p className="text-red-600 font-bold mt-2 text-xl">${product.price.toFixed(2)}</p>
                
                <Link href={`/product/${product._id}`} className="mt-4 block w-full text-center bg-gray-100 text-gray-800 font-semibold py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
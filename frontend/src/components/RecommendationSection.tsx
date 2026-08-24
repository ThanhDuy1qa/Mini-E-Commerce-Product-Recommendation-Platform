'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const MOCK_RECOMMENDATIONS = [
  { _id: 'rec1', name: 'Bàn phím cơ Custom K87', price: 120.0, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
  { _id: 'rec2', name: 'Chuột Gaming Không Dây', price: 45.5, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' },
  { _id: 'rec3', name: 'Tai nghe Bluetooth Over-Ear', price: 85.5, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
  { _id: 'rec4', name: 'Lót chuột RGB XL', price: 25.0, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' },
];

export default function RecommendationSection() {
  const [products, setProducts] = useState<any[]>(MOCK_RECOMMENDATIONS);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/recommendations/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <section className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>
          <p className="text-sm text-gray-500">Based on your browsing history and preferences</p>
        </div>
        <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">AI Powered</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((item) => (
          <Link
            key={item._id}
            href={`/products/${item._id}`}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 group"
          >
            <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 mb-3">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h3>
            <p className="text-red-600 font-extrabold text-base mt-1">${Number(item.price).toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
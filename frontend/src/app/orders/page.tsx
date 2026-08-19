'use client';

import { useState } from "react";
import Link from "next/link";

// 1. Thay URL ảnh bằng Unsplash thực tế để không bị lỗi không hiện hình
const mockOrders = [
  { 
    id: "ORD-00123", 
    date: "August 18, 2026", 
    total: 120.00, 
    status: "Pending", 
    items: [
      {
        id: "p1",
        name: "Wireless Headphones",
        price: 120.00,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80"
      }
    ]
  },
];

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Badge màu sắc chuẩn 4 trạng thái
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {mockOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-4 text-lg">You haven't placed any orders yet.</p>
            <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
              Start Shopping
            </Link>
          </div>
        ) : (
          mockOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              {/* Thông tin mã đơn và ngày tháng */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-bold text-gray-900">{order.id}</span></p>
                <p className="text-sm text-gray-500">Date: {order.date} • {order.items.length} Items</p>
              </div>
              
              {/* Thông tin giá tiền và trạng thái */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-red-600">${order.total.toFixed(2)}</p>
                </div>
                
                <span className={`px-4 py-2 rounded-xl font-bold text-sm text-center min-w-[120px] ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
                
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-gray-100 text-gray-800 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
              
            </div>
          ))
        )}
      </div>

      {/* Modal hiển thị kích thước lớn (max-w-lg), font chữ to rõ */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Order Details #{selectedOrder.id}
            </h2>
            <p className="text-sm text-gray-500 mb-6">Date: {selectedOrder.date}</p>

            {/* Danh sách sản phẩm trong đơn */}
            <div className="border-t border-b border-gray-100 divide-y divide-gray-100 max-h-80 overflow-y-auto my-4 py-2">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 rounded-2xl object-cover bg-gray-50 border border-gray-100 shadow-sm" 
                  />
                  <div className="flex-1">
                    <p className="font-bold text-base text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-extrabold text-base text-gray-900">
                    ${(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tổng quan trạng thái & tiền */}
            <div className="flex justify-between items-center pt-3 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-500">Status:</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusBadgeClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Total Amount</span>
                <span className="text-2xl font-black text-gray-900">
                  ${selectedOrder.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const getStatusBadgeClass = (status: string) => {
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

  if (loading) {
    return <div className="p-12 text-center text-gray-600 font-medium">Loading orders...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-4 text-lg">You haven't placed any orders yet.</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Order ID: <span className="font-bold text-gray-900">{order._id}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Date:{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}{' '}
                  • {order.products?.length || 0} Items
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-red-600">
                    ${Number(order.totalPrice || 0).toFixed(2)}
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-xl font-bold text-sm text-center min-w-[120px] ${getStatusBadgeClass(
                    order.status
                  )}`}
                >
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

      {/* Modal kích thước lớn (max-w-2xl, p-10) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-10 shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 font-bold text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Order Details #{selectedOrder._id}
            </h2>
            <p className="text-base text-gray-500 mb-6">
              Date:{' '}
              {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>

            <div className="border-t border-b border-gray-100 divide-y divide-gray-100 max-h-96 overflow-y-auto my-6 py-4">
              {selectedOrder.products?.map((item: any, idx: number) => {
                const imageUrl =
                  item.image ||
                  item.product?.image ||
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80';

                return (
                  <div key={item._id || idx} className="py-5 flex items-center gap-6">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-gray-50 border border-gray-100 shadow-sm shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">{item.name}</p>
                      <p className="text-base text-gray-500 mt-1">
                        Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-extrabold text-xl text-gray-900">
                      ${(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 mt-2">
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold text-gray-500">Status:</span>
                <span
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold ${getStatusBadgeClass(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block uppercase tracking-wide">Total Amount</span>
                <span className="text-3xl font-black text-gray-900">
                  ${Number(selectedOrder.totalPrice || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
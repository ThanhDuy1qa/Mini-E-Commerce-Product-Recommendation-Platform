'use client';
import { useState, useEffect } from "react";
import Link from 'next/link';

interface OrderItem {
  product?: any;
  quantity?: number;
  price?: number;
  name?: string;
  image_url?: string;
  image?: string;
}

interface Order {
  _id: string;
  user?: any;
  products?: OrderItem[];
  totalPrice?: number;
  phone?: string;          
  shippingAddress?: string;  
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // State quản lý việc mở Popup xem chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch orders, status:", res.status);
        setOrders([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else if (data.data && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders(); // Reload lại danh sách sau khi update thành công
      } else {
        alert("Failed to update status!");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderCustomerInfo = (user: any, phone?: string, shippingAddress?: string) => {
    if (!user && !phone && !shippingAddress) {
      return <span className="text-gray-400 italic">Guest Customer</span>;
    }

    const name = typeof user === "object" ? user?.name : "Customer";
    const email = typeof user === "object" ? user?.email : typeof user === "string" ? user : "";

    return (
      <div>
        <p className="font-bold text-gray-900">{name || "Customer"}</p>
        {email && <p className="text-gray-500 text-xs">{email}</p>}
        {phone && <p className="text-gray-500 text-xs mt-1">📞 {phone}</p>}
        {shippingAddress && <p className="text-gray-500 text-xs mt-1">📍 {shippingAddress}</p>}
      </div>
    );
  };

  // Chuẩn hóa status hiển thị trên dropdown khớp chính xác với option
  const normalizeStatus = (status?: string) => {
    if (!status) return "Pending";
    const s = status.toLowerCase();
    if (s === "pending") return "Pending";
    if (s === "confirmed" || s === "processing") return "Confirmed";
    if (s === "completed" || s === "delivered") return "Completed";
    if (s === "cancelled" || s === "canceled") return "Cancelled";
    return status;
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "pending") return "bg-orange-100 text-orange-600 border-orange-200";
    if (s === "confirmed" || s === "processing") return "bg-blue-100 text-blue-700 border-blue-200";
    if (s === "completed" || s === "delivered") return "bg-green-100 text-green-700 border-green-200";
    if (s === "cancelled" || s === "canceled") return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const idMatch = o._id?.toLowerCase().includes(term);
    const statusMatch = o.status?.toLowerCase().includes(term);
    const custName = typeof o.user === "object" ? o.user?.name || o.user?.email || "" : "";
    const phoneMatch = o.phone?.toLowerCase().includes(term);
    const addressMatch = o.shippingAddress?.toLowerCase().includes(term);

    return idMatch || statusMatch || custName.toLowerCase().includes(term) || phoneMatch || addressMatch;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  const pendingCount = orders.filter((o) => o.status?.toLowerCase() === "pending").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans relative">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-1">Track and update customer order status</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
        >
          🔄 Refresh Orders
        </button>
      </div>

      {/* ---------------- STAT CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🛒</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">TOTAL ORDERS</p>
            <p className="text-3xl font-black text-gray-800">{orders.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-2xl">⏳</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">PENDING ORDERS</p>
            <p className="text-3xl font-black text-orange-500">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-2xl">💰</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">TOTAL REVENUE</p>
            <p className="text-3xl font-black text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="font-bold text-gray-900">All Orders ({filteredOrders.length})</h2>
          <input 
            type="text" 
            placeholder="🔍 Search by ID, customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm w-full sm:w-72 outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ORDER ID</th>
                <th className="px-6 py-4">CUSTOMER & DETAILS</th>
                <th className="px-6 py-4">TOTAL PRICE</th>
                <th className="px-6 py-4">CURRENT STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-blue-600">
                      #{order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      {renderCustomerInfo(order.user, order.phone, order.shippingAddress)}
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">
                      ${Number(order.totalPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg font-bold text-xs border ${getStatusBadge(order.status)}`}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-3">
                      <select 
                        disabled={updatingId === order._id}
                        value={normalizeStatus(order.status)}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- ORDER DETAILS MODAL ---------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Order Details</h3>
                <p className="text-sm text-gray-500 mt-1 font-mono">#{selectedOrder._id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-600 font-bold text-xl transition"
              >
                &times;
              </button>
            </div>

            {/* Danh sách sản phẩm trong Order */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
              <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Ordered Items</h4>
              <div className="divide-y divide-gray-200">
                {selectedOrder.products && selectedOrder.products.length > 0 ? (
                  selectedOrder.products.map((item, idx) => {
                    const itemName = typeof item.product === 'object' 
                      ? (item.product?.title || item.product?.name || item.name) 
                      : (item.name || 'Product');
                      
                    const itemPrice = item.price || 0;
                    const itemQty = item.quantity || 1;

                    // Tự động tìm link ảnh từ OrderItem hoặc Product object
                    const itemImg = item.image_url 
                      || item.image 
                      || item.product?.image_url 
                      || item.product?.image 
                      || item.product?.images?.[0]
                      || 'https://via.placeholder.com/60';

                    return (
                      <div key={idx} className="py-4 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          {/* Hiển thị ảnh sản phẩm */}
                          <img 
                            src={itemImg} 
                            alt={itemName} 
                            className="w-14 h-14 object-cover rounded-xl border border-gray-200 bg-white"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/60?text=No+Img";
                            }}
                          />
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{itemName}</p>
                            <p className="text-xs text-gray-500 mt-1">Qty: {itemQty} x ${itemPrice.toFixed(2)}</p>
                          </div>
                        </div>
                        <span className="font-black text-gray-900">${(itemPrice * itemQty).toFixed(2)}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 italic py-2">No product details available.</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-700">Total Amount:</span>
                <span className="text-2xl font-black text-red-600">${Number(selectedOrder.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
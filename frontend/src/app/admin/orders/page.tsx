"use client";

import { useState, useEffect } from "react";

interface OrderItem {
  product?: any;
  quantity?: number;
  price?: number;
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

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
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

  // Helper to format Customer Info including Phone and Shipping Address
  const renderCustomerInfo = (user: any, phone?: string, shippingAddress?: string) => {
    if (!user && !phone && !shippingAddress) {
      return <span className="text-slate-400 italic">Guest Customer</span>;
    }

    const name = typeof user === "object" ? user?.name : "Customer";
    const email = typeof user === "object" ? user?.email : typeof user === "string" ? user : "";

    return (
      <div className="space-y-1">
        <p className="font-bold text-slate-800">{name || "Customer"}</p>
        {email && <p className="text-[11px] text-slate-400">{email}</p>}
        {phone && (
          <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
            📞 {phone}
          </p>
        )}
        {shippingAddress && (
          <p className="text-[11px] text-slate-500 max-w-xs leading-tight" title={shippingAddress}>
            📍 {shippingAddress}
          </p>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "confirmed" || s === "processing") return "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "completed" || s === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "cancelled") return "bg-red-50 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Filter Orders by ID, Status, Name, Phone, or Address
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-1">Track and update customer order status</p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          🔄 Refresh Orders
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">🛒</div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total Orders</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{orders.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">⏳</div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Pending Orders</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">💰</div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total Revenue</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <span className="font-bold text-slate-800 text-xs">All Orders ({filteredOrders.length})</span>
          <input
            type="text"
            placeholder="🔍 Search by order ID, customer, phone, address, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/80">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Customer & Shipping Details</th>
                <th className="py-3.5 px-6">Total Price</th>
                <th className="py-3.5 px-6">Current Status</th>
                <th className="py-3.5 px-6 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                    Loading order list...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-600">
                      #{order._id.substring(0, 8)}...
                    </td>
                    <td className="py-3.5 px-6">
                      {renderCustomerInfo(order.user, order.phone, order.shippingAddress)}
                    </td>
                    <td className="py-3.5 px-6 font-black text-slate-800 text-sm">
                      ${Number(order.totalPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getStatusBadge(order.status)}`}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <select
                        disabled={updatingId === order._id}
                        value={order.status || "Pending"}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold text-xs">
                    No orders found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
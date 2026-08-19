import Link from "next/link";

// Dữ liệu giả lập danh sách đơn hàng
const mockOrders = [
  { id: "ORD-00123", date: "August 18, 2026", total: 120.00, status: "Processing", items: 1 },
  { id: "ORD-00098", date: "August 15, 2026", total: 46.49, status: "Delivered", items: 2 },
  { id: "ORD-00045", date: "August 02, 2026", total: 210.50, status: "Cancelled", items: 3 },
];

export default function OrdersPage() {
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
                <p className="text-sm text-gray-500">Date: {order.date} • {order.items} Items</p>
              </div>
              
              {/* Thông tin giá tiền và trạng thái */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-red-600">${order.total.toFixed(2)}</p>
                </div>
                
                {/* Badge màu sắc thay đổi theo trạng thái đơn hàng */}
                <span className={`px-4 py-2 rounded-xl font-bold text-sm text-center min-w-[120px] ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                  order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {order.status}
                </span>
                
                <button className="bg-gray-100 text-gray-800 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition whitespace-nowrap">
                  View Details
                </button>
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
}
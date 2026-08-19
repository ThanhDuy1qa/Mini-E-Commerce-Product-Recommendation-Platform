'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || "Thien Qui",
          email: parsedUser.email || "thienqui@gmail.com",
          phone: parsedUser.phone || "0901234567",
          address: parsedUser.address || "TP. Hồ Chí Minh, Việt Nam",
        });
      } catch (e) {
        console.error("Lỗi đọc thông tin tài khoản:", e);
      }
    }
    setLoading(false);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, ...formData };
    
    // Lưu vào localStorage & thông báo tới Navbar để cập nhật lại tên người dùng
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    window.dispatchEvent(new Event("userLogin"));
    
    alert("Đã cập nhật thông tin cá nhân!");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center text-gray-500 font-semibold">
        Đang tải thông tin cá nhân...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-sm text-center border border-gray-100 space-y-4">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-gray-900">Bạn chưa đăng nhập</h2>
        <p className="text-sm text-gray-500">Vui lòng đăng nhập để xem thông tin và quản lý tài khoản.</p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header Avatar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-extrabold text-2xl border-4 border-blue-50 shrink-0">
          {(formData.name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left space-y-1">
          <h1 className="text-2xl font-extrabold text-gray-900">{formData.name}</h1>
          <p className="text-sm font-medium text-gray-500">{formData.email}</p>
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-md mt-2">
            Member Account
          </span>
        </div>
      </div>

      {/* Form thông tin */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            {isEditing ? "Hủy bỏ" : "✏️ Chỉnh sửa"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Họ và tên</p>
              <p className="font-bold text-gray-800 mt-1">{formData.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
              <p className="font-bold text-gray-800 mt-1">{formData.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Số điện thoại</p>
              <p className="font-bold text-gray-800 mt-1">{formData.phone || "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Địa chỉ giao hàng</p>
              <p className="font-bold text-gray-800 mt-1">{formData.address || "Chưa cập nhật"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
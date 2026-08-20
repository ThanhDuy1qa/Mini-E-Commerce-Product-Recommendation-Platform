"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ánh xạ mã Role: 0 - Customer, 1 - Admin
  const roleMap: Record<number, string> = {
    0: "Customer",
    1: "Admin",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 1. Lưu Token và thông tin User vào localStorage
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        // 2. Lấy tên Role từ roleMap
        const userRoleName = roleMap[data.user.role] || "Unknown";

        // 3. Hiển thị thông báo
        setMessage(`Login successful! Role: ${userRoleName}`);

        // PHÁT TÍN HIỆU: Báo cho Navbar biết là có người vừa đăng nhập
        window.dispatchEvent(new Event("userLogin"));

        // 4. Chuyển hướng trang sau khi người dùng kịp đọc thông báo
        setTimeout(() => {
          if (data.user.role === 1) {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/";
          }
        }, 10);
      } else {
        setMessage(data.message || "Login failed!");
      }
    } catch (err) {
      setMessage("Cannot connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
        
        {/* Header Form */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl mb-3 font-black text-xl">
            🛍️
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Please enter your credentials to sign in</p>
        </div>

        {/* Thông báo dạng Banner chuẩn UI */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-semibold border flex items-center gap-2 ${
            message.includes("successful") 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            <span>{message.includes("successful") ? "✅" : "⚠️"}</span>
            <span>{message}</span>
          </div>
        )}

        {/* Form Đăng Nhập */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition duration-200 flex items-center justify-center disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isLoading ? "Processing..." : "Login"}
          </button>
        </form>

        {/* Chuyển trang Register */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Register now
          </Link>
        </div>

      </div>
    </div>
  );
}
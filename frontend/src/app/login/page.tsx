"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function LoginPage() {
  const router = useRouter();
  const { fetchCart } = useCart();
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

        // 2. Tải giỏ hàng chuẩn từ DB của User vừa đăng nhập
        await fetchCart();

        // 3. Lấy tên Role từ roleMap
        const userRoleName = roleMap[data.user.role] || "Unknown";

        // 4. Hiển thị thông báo
        setMessage(`Login successful! Role: ${userRoleName}`);

        // PHÁT TÍN HIỆU: Báo cho Navbar biết người dùng vừa đăng nhập
        window.dispatchEvent(new Event("userLogin"));

        // 5. Chuyển hướng trang
        setTimeout(() => {
          if (data.user.role === 1) {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/";
          }
        }, 500);
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
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleLogin} className="p-6 bg-white rounded-lg shadow-md w-96 space-y-4">
        <h2 className="text-xl font-bold text-center">Login</h2>
        
        {message && (
          <div className={`p-3 text-sm rounded border ${
            message.includes("successful") 
              ? "bg-green-100 text-green-800 border-green-300" 
              : "bg-red-100 text-red-800 border-red-300"
          }`}>
            {message}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isLoading ? "Processing..." : "Login"}
        </button>
      </form>
    </div>
  );
}
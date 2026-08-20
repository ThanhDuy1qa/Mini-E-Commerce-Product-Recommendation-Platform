'use client';

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { cart, clearCart, fetchCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // Kiểm tra trạng thái đăng nhập và cập nhật giỏ hàng
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      // Tải lại giỏ hàng tương ứng với trạng thái auth hiện tại
      fetchCart();
    };

    // Load trạng thái ban đầu
    checkAuth();

    // Lắng nghe các sự kiện đăng nhập
    window.addEventListener("userLogin", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("userLogin", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [fetchCart]);

  // Hàm xử lý khi bấm nút Đăng xuất
  const handleLogout = () => {
    // 1. Xóa thông tin đăng nhập
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // 2. Xóa sạch giỏ hàng trong State & localStorage
    clearCart();
    
    // 3. Cập nhật State giao diện
    setUser(null);
    alert("Logged out successfully!");
    router.push("/login");
  };

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalItems = (Array.isArray(cart) ? cart : []).reduce(
    (sum, item) => sum + (item.quantity || 1), 0
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO */}
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:opacity-80 transition flex items-center gap-2">
            🛍️ MiniShop
          </Link>

          {/* NAVIGATION LINKS */}
          <div className="flex items-center space-x-5 font-semibold text-gray-700">
            
            <Link href="/" className="hover:text-blue-600 transition hidden sm:block">
              Home
            </Link>

            <Link href="/orders" className="hover:text-blue-600 transition flex items-center gap-1">
              My Orders
            </Link>

            <Link href="/cart" className="relative hover:text-blue-600 transition flex items-center gap-1">
              🛒 Cart
              {totalItems > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1 animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* USER PROFILE / AUTH BUTTONS */}
            {user ? (
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                
                {/* 2. Nút quay lại Admin Panel khi tài khoản admin đang xem trang bán hàng */}
                {isAdmin && (
                  <Link
                    href="/admin/products"
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition text-sm font-bold flex items-center gap-1 shadow-xs"
                  >
                    ⚙️ Admin Panel
                  </Link>
                )}

                <Link 
                  href="/profile" 
                  className="text-sm font-bold text-gray-800 hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
                  title="Xem thông tin cá nhân"
                >
                  👤 {user.name || user.email || "User"}
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-100 transition text-sm font-bold cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l border-gray-200 pl-3">
                <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-xl transition text-sm">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-500/20 text-sm">
                  Register
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
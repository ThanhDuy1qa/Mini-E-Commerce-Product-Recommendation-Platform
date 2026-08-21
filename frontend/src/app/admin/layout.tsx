"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// SVG Icons chuẩn UI Dashboard
const Icons = {
  Logo: () => (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Products: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Categories: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Orders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 100 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Store: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Icons;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 1 || user.role === "1" || user.role === "admin") {
          setAdminUser(user);
        } else {
          alert("Access denied! Admin privileges required.");
          router.push("/");
        }
      } catch {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userLogin"));
    router.push("/login");
  };

  const navItems: NavItem[] = [
    { label: "Products Management", href: "/admin/products", icon: "Products" },
    { label: "Categories Management", href: "/admin/categories", icon: "Categories" },
    { label: "Orders Management", href: "/admin/orders", icon: "Orders" },
    { label: "Users Management", href: "/admin/users", icon: "Users" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 flex font-sans select-none">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 p-4 shadow-xs shrink-0">
        <div>
          {/* Brand Header */}
          <Link href="/admin/products" className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100 pb-5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Icons.Logo />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-base tracking-tight leading-none">
                MiniShop
              </h2>
              <span className="inline-block px-2 py-0.5 mt-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 rounded-md">
                Admin Portal
              </span>
            </div>
          </Link>

          {/* Section Label */}
          <div className="px-3 mb-2">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Management
            </p>
          </div>

          {/* Navigation List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const IconComponent = Icons[item.icon];
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 translate-x-1"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`}>
                    <IconComponent />
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* View Store Button */}
        <div className="pt-4 border-t border-slate-100">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-xl border border-slate-200/80 transition cursor-pointer"
          >
            <span>View Storefront</span>
            <Icons.Store />
          </Link>
        </div>
      </aside>

      {/* Right Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Admin Portal</span>
            <span>/</span>
            <span className="text-blue-600 font-extrabold">
              {navItems.find((n) => n.href === pathname)?.label || "Dashboard"}
            </span>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center font-black text-xs shadow-xs">
                {adminUser?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">
                  {adminUser?.name || "Admin"}
                </p>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
                  {adminUser?.email || "admin@gmail.com"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/80 hover:border-red-200 px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <Icons.Logout />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
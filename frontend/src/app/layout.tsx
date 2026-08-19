import type { Metadata } from "next";
import "./globals.css";

// Đổi từ @/ thành ../ (lùi ra 1 cấp thư mục để vào components và context)
import Navbar from "../components/Navbar";
import { CartProvider } from "../context/CartContext";

export const metadata: Metadata = {
  title: "MiniShop E-Commerce",
  description: "Dự án MVP E-Commerce siêu mượt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-blue-200 text-gray-900 antialiased">
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext"; // BƯỚC 1: Import CartProvider

export const metadata: Metadata = {
  title: "Mini E-Commerce",
  description: "Dự án MVP E-Commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-slate-300 text-gray-900 antialiased">
        {/* BƯỚC 2: Bọc CartProvider ra ngoài Navbar và main */}
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
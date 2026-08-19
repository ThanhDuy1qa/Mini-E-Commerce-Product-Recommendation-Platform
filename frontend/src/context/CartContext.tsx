"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  asin: string;
  title: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (asin: string) => void;
  updateQuantity: (asin: string, delta: number) => void; // Bổ sung hàm mới
}

// 1. Tạo Context
export const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
});

// 2. Tạo Provider
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("mini_cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) setCart(parsed);
        }
      } catch (e) {
        console.error("Lỗi đọc giỏ hàng:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mini_cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const currentCart = Array.isArray(prev) ? prev : [];
      const itemAsin = product.asin || product.id?.toString();
      const existing = currentCart.findIndex((item) => item.asin === itemAsin);
      
      if (existing > -1) {
        const updated = [...currentCart];
        updated[existing].quantity = (updated[existing].quantity || 1) + 1;
        return updated;
      }
      return [...currentCart, {
        asin: itemAsin,
        title: product.title || product.name || "Product",
        price: Number(product.price || 0),
        image_url: product.image_url || product.image || "",
        quantity: 1
      }];
    });
    alert("Đã thêm sản phẩm vào giỏ hàng!");
  };

  const removeFromCart = (asin: string) => {
    setCart((prev) => (Array.isArray(prev) ? prev : []).filter((item) => item.asin !== asin));
  };

  // HÀM MỚI: Xử lý tăng giảm số lượng
  const updateQuantity = (asin: string, delta: number) => {
    setCart((prev) => {
      return (Array.isArray(prev) ? prev : []).map(item => {
        if (item.asin === asin) {
          // Math.max để đảm bảo số lượng không bao giờ tụt xuống dưới 1
          const newQuantity = Math.max(1, (item.quantity || 1) + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. Export hàm useCart
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return { cart: [], addToCart: () => {}, removeFromCart: () => {}, updateQuantity: () => {} };
  }
  return context;
};
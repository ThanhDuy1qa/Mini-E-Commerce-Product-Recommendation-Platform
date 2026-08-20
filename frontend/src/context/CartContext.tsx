"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  _id?: string;
  asin?: string;
  title: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
}

export const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
});

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

  const addToCart = async (product: any, quantityToAdd: number = 1) => {
    // 1. Xác định ID chuẩn xác từ product (_id hoặc asin)
    const productId = product._id || product.asin;
    if (!productId) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // 2. Gửi request lên Backend API để lưu DB & Log Interaction (nếu người dùng đã đăng nhập)
    if (token) {
      try {
        await fetch("http://localhost:5000/api/cart/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: productId,
            quantity: quantityToAdd,
          }),
        });
      } catch (err) {
        console.error("Lỗi kết nối Cart API Backend:", err);
      }
    }

    // 3. Cập nhật State cục bộ ở Frontend
    setCart((prev) => {
      const currentCart = Array.isArray(prev) ? prev : [];
      
      // So sánh theo _id hoặc asin chuẩn xác
      const existingIndex = currentCart.findIndex((item) => {
        const itemId = item._id || item.asin;
        return itemId === productId;
      });

      if (existingIndex > -1) {
        const updated = [...currentCart];
        updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + quantityToAdd;
        return updated;
      }

      return [
        ...currentCart,
        {
          _id: product._id,
          asin: product.asin || product._id,
          title: product.title || product.name || "Product",
          price: Number(product.price || 0),
          image_url: product.image_url || product.image || "",
          quantity: quantityToAdd,
        },
      ];
    });

    alert("Đã thêm sản phẩm vào giỏ hàng!");
  };

  const removeFromCart = (id: string) => {
    setCart((prev) =>
      (Array.isArray(prev) ? prev : []).filter(
        (item) => (item._id || item.asin) !== id
      )
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return (Array.isArray(prev) ? prev : []).map((item) => {
        if ((item._id || item.asin) === id) {
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

export const useCart = () => useContext(CartContext);
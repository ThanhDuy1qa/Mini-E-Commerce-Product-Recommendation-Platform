"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  fetchCart: () => Promise<void>;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  fetchCart: async () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Hàm tải giỏ hàng từ DB (nếu đã login) hoặc localStorage (nếu chưa login)
  const fetchCart = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      try {
        const savedCart = localStorage.getItem("mini_cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) setCart(parsed);
        } else {
          setCart([]);
        }
      } catch (e) {
        console.error("Error reading local cart:", e);
      }
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success && data.cart && data.cart.items) {
        const formattedCart: CartItem[] = data.cart.items
          .filter((item: any) => item.product)
          .map((item: any) => ({
            _id: item.product._id,
            asin: item.product.asin || item.product._id,
            title: item.product.title || item.product.name || "Product",
            price: Number(item.product.price || 0),
            image_url: item.product.image_url || item.product.image || "",
            quantity: item.quantity,
          }));

        setCart(formattedCart);
      }
    } catch (err) {
      console.error("Failed to fetch cart from server:", err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Đồng bộ giỏ hàng ra localStorage (CHỈ KHI CHƯA ĐĂNG NHẬP)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.setItem("mini_cart", JSON.stringify(cart));
      }
    }
  }, [cart]);

  // 2. Hàm dọn sạch giỏ hàng local khi Logout
  const clearCart = () => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("mini_cart");
    }
  };

  const addToCart = async (product: any, quantityToAdd: number = 1) => {
    const productId = product._id || product.asin;
    if (!productId) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
        console.error("Cart API connection error:", err);
      }
    }

    setCart((prev) => {
      const currentCart = Array.isArray(prev) ? prev : [];
      
      const existingIndex = currentCart.findIndex((item) => {
        const itemId = item._id || item.asin;
        return itemId === productId;
      });

      if (existingIndex > -1) {
        return currentCart.map((item, index) => {
          if (index === existingIndex) {
            return {
              ...item,
              quantity: (item.quantity || 1) + quantityToAdd,
            };
          }
          return item;
        });
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

    alert("Item added to cart!");
  };

  const removeFromCart = async (id: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      try {
        await fetch(`http://localhost:5000/api/cart/items/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Error removing cart item from server:", err);
      }
    }

    setCart((prev) =>
      (Array.isArray(prev) ? prev : []).filter(
        (item) => (item._id || item.asin) !== id
      )
    );
  };

  const updateQuantity = async (id: string, delta: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    let newQty = 1;

    setCart((prev) => {
      return (Array.isArray(prev) ? prev : []).map((item) => {
        if ((item._id || item.asin) === id) {
          newQty = Math.max(1, (item.quantity || 1) + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });

    if (token) {
      try {
        await fetch(`http://localhost:5000/api/cart/items/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQty }),
        });
      } catch (err) {
        console.error("Error updating cart item on server:", err);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, fetchCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
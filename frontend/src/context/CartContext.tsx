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
  isInitialized: boolean;
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  fetchCart: () => Promise<void>;
  clearCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType>({
  cart: [],
  isInitialized: false,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  fetchCart: async () => {},
  clearCart: async () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  // Biến cờ đánh dấu đã đọc xong dữ liệu ban đầu
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 1. Tải giỏ hàng từ DB hoặc localStorage
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
      } finally {
        setIsInitialized(true); // Đánh dấu nạp xong
      }
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
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
    } finally {
      setIsInitialized(true); // Đánh dấu nạp xong
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 2. CHỈ lưu vào localStorage KHI ĐÃ LƯU DỮ LIỆU BAN ĐẦU XONG (isInitialized === true)
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.setItem("mini_cart", JSON.stringify(cart));
      }
    }
  }, [cart, isInitialized]);


const clearCart = async () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  if (token && cart.length > 0) {
    try {
      // Xóa từng item trên DB vì Backend chưa có route DELETE /api/cart
      await Promise.all(
        cart.map((item) =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items/${item._id || item.asin}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
    } catch (err) {
      console.error("Error clearing backend cart items:", err);
    }
  }

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
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items`, {
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
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items/${id}`, {
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
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items/${id}`, {
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
    <CartContext.Provider value={{ cart, isInitialized, addToCart, removeFromCart, updateQuantity, fetchCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
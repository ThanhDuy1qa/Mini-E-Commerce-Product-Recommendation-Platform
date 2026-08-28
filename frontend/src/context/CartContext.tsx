"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  _id?: string;
  asin?: string;
  title: string;
  price: number;
  image_url: string;
  quantity: number;
  stock?: number;
}

interface CartContextType {
  cart: CartItem[];
  isInitialized: boolean;
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  fetchCart: () => Promise<void>;
  clearCart: () => Promise<void>;
  resetCartOnLogout: () => void; // <--- Thêm hàm này
}

export const CartContext = createContext<CartContextType>({
  cart: [],
  isInitialized: false,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  fetchCart: async () => {},
  clearCart: async () => {},
  resetCartOnLogout: () => {}, // <--- Thêm hàm này
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
            stock: item.product.stock ?? 0, 
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

  // Hàm xóa giỏ hàng khi thanh toán thành công (xóa thật trong DB)
  const clearCart = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (token && cart.length > 0) {
      try {
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

  // Hàm CHỈ reset state ở Client khi ĐĂNG XUẤT (KHÔNG xóa trên DB)
  const resetCartOnLogout = () => {
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
            stock: product.stock ?? 0,
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
              stock: product.stock ?? item.stock ?? 0,
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
          stock: product.stock ?? 0,
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
    const targetItem = cart.find((item) => (item._id || item.asin) === id);
    if (!targetItem) return;

    const newQty = (targetItem.quantity || 1) + delta;

    if (targetItem.stock !== undefined && newQty > targetItem.stock) {
      alert(`Cannot add more. Available stock: ${targetItem.stock}`);
      return;
    }

    if (newQty < 1) return;

    if (token) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQty }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Failed to update quantity");
          fetchCart();
          return;
        }
      } catch (err) {
        console.error("Error updating cart item on server:", err);
        return;
      }
    }

    setCart((prev) =>
      (Array.isArray(prev) ? prev : []).map((item) =>
        (item._id || item.asin) === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        isInitialized, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        fetchCart, 
        clearCart,
        resetCartOnLogout // <--- Thêm vào Provider
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
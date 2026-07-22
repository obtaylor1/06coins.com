import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/lib/products";
import { trackAddToCart } from "@/lib/analytics";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  emptyCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "apa120_cart";
const MAX_CART_QUANTITY = 99;

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.image === "string" &&
    typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0 &&
    typeof item.quantity === "number" && Number.isInteger(item.quantity) &&
    item.quantity > 0 && item.quantity <= MAX_CART_QUANTITY;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (product: Product, quantity: number = 1) => {
    const safeQuantity = Number.isFinite(quantity)
      ? Math.max(1, Math.min(Math.trunc(quantity), MAX_CART_QUANTITY))
      : 1;
    // Track add to cart event in Google Analytics
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: safeQuantity,
    });

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      
      if (existingIndex >= 0) {
        return prev.map((item, index) => index === existingIndex
          ? { ...item, quantity: Math.min(item.quantity + safeQuantity, MAX_CART_QUANTITY) }
          : item
        );
      }
      
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: safeQuantity,
          image: product.image,
        },
      ];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(Math.trunc(quantity), MAX_CART_QUANTITY) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const emptyCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        total,
        itemCount,
        addItem,
        updateQuantity,
        removeItem,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

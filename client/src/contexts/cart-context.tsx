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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
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
    // Track add to cart event in Google Analytics
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image,
        },
      ];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(quantity, 99) } : item
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

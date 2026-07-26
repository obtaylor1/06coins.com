import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ALL_PRODUCTS, Product } from "@/lib/products";
import { trackAddToCart } from "@/lib/analytics";
import {
  getFoundersBundleDiscountCents,
  getFoundersBundlePairCount,
} from "@shared/pricing";

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
  discount: number;
  total: number;
  bundlePairCount: number;
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
      if (!Array.isArray(parsed)) return [];
      const currentProducts = new Map(ALL_PRODUCTS.map((product) => [product.id, product]));
      return parsed.filter(isCartItem).map((item) => {
        const currentProduct = currentProducts.get(item.id);
        return currentProduct
          ? {
              ...item,
              name: currentProduct.name,
              price: currentProduct.price,
              image: currentProduct.image,
            }
          : item;
      });
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0,
  );
  const discountCents = getFoundersBundleDiscountCents(items);
  const subtotal = subtotalCents / 100;
  const discount = discountCents / 100;
  const total = (subtotalCents - discountCents) / 100;
  const bundlePairCount = getFoundersBundlePairCount(items);
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
        discount,
        total,
        bundlePairCount,
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

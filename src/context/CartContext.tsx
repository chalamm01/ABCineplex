import { createContext, useState, type ReactNode } from "react";

export interface CartItem {
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  increaseQuantity: (name: string) => void;
  decreaseQuantity: (name: string) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(item: CartItem) {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);

      if (existing) {
        return prev.map((i) =>
          i.name === item.name
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      }

    return [...prev, { ...item, quantity: 1 }];
  });
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function clearCart() {
    setCart([]);
  }

  function increaseQuantity(name: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.name === name
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(name: string) {
      setCart((prev) =>
        prev
          .map((item) =>
            item.name === name
              ? { ...item, quantity: (item.quantity || 1) - 1 }
              : item
          )
          .filter((item) => (item.quantity || 1) > 0)
      );
    }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity }}>
      {children}
    </CartContext.Provider>
  );
}
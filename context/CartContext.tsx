'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. ინტერფეისში ვამატებთ ახალ ფუნქციებს
interface CartContextType {
  cart: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  increaseQuantity: (productId: number) => void; // რაოდენობის მომატება
  decreaseQuantity: (productId: number) => void; // რაოდენობის მოკლება
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const isItemInCart = prevCart.find((item) => item.id === product.id);
      if (isItemInCart) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // 2. რაოდენობის მომატების ფუნქცია
  const increaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId 
          ? { ...item, quantity: (item.quantity || 1) + 1 } 
          : item
      )
    );
  };

  // 3. რაოდენობის მოკლების ფუნქცია
  const decreaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      searchTerm, 
      setSearchTerm, 
      addToCart, 
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
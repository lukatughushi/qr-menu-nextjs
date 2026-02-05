'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
// 1. შემოგვაქვს თარგმანების ობიექტი
import { translations } from '../translations'; 

interface CartContextType {
  cart: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  // 2. ვამატებთ ენის მართვის ტიპებს
  language: 'ka' | 'en';
  setLanguage: (lang: 'ka' | 'en') => void;
  t: any; // თარგმანების მიმდინარე ლექსიკონი
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 3. ენის მდგომარეობის (State) შექმნა
  const [language, setLanguage] = useState<'ka' | 'en'>('ka'); 

  // 4. მიმდინარე თარგმანის შერჩევა არჩეული ენის მიხედვით
  const t = translations[language];

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

  const increaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId 
          ? { ...item, quantity: (item.quantity || 1) + 1 } 
          : item
      )
    );
  };

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
      clearCart,
      // 5. ენის მნიშვნელობების გადაცემა კომპონენტებისთვის
      language,
      setLanguage,
      t
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
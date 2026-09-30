'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  language: 'ka' | 'en';
  setLanguage: (lang: 'ka' | 'en') => void;
  t: any;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // 1. კალათის საწყისი სტეიტი არის ცარიელი მასივი
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState<'ka' | 'en'>('ka');

  // 2. გვერდის პირველადი ჩატვირთვისას ამოვიღოთ შენახული მონაცემები
  useEffect(() => {
    // ენის ამოღება
    const savedLanguage = localStorage.getItem('app_language') as 'ka' | 'en';
    if (savedLanguage) setLanguage(savedLanguage);

    // კალათის პროდუქტების ამოღება
    const savedCart = localStorage.getItem('app_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart)); // JSON ტექსტს ვაქცევთ ისევ მასივად
      } catch (error) {
        console.error("კალათის მონაცემების წაკითხვის შეცდომა:", error);
      }
    }
  }, []);

  // 3. ყოველ ჯერზე, როცა ენა ან კალათა შეიცვლება, ვინახავთ localStorage-ში
  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('app_cart', JSON.stringify(cart)); // მასივს ვაქცევთ ტექსტად შესანახად
  }, [cart]);

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
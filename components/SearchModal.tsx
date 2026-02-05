'use client';

import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

// 1. მონაცემთა მასივი ფილტრაციისთვის
const menuItems = [
  { id: 1, title: "Delicious Pizza", price: 20, category: "pizza", image: "/images/f1.png" },
  { id: 2, title: "Delicious Burger", price: 15, category: "burger", image: "/images/f2.png" },
  { id: 3, title: "Delicious Pizza", price: 17, category: "pizza", image: "/images/f3.png" },
  { id: 4, title: "Delicious Pasta", price: 18, category: "pasta", image: "/images/f4.png" },
  { id: 5, title: "French Fries", price: 10, category: "fries", image: "/images/f5.png" },
  { id: 6, title: "Delicious Pizza", price: 15, category: "pizza", image: "/images/f6.png" },
  { id: 7, title: "Tasty Burger", price: 12, category: "burger", image: "/images/f7.png" },
  { id: 8, title: "Tasty Burger", price: 14, category: "burger", image: "/images/f8.png" },
  { id: 9, title: "Delicious Pasta", price: 10, category: "pasta", image: "/images/f9.png" },
];

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const { searchTerm, setSearchTerm, addToCart } = useCart(); //
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 2. ფილტრაციის ლოგიკა მოდალის შიგნით
  const filteredResults = searchTerm.trim() === "" 
    ? [] 
    : menuItems.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', marginBottom: '20px' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="რა გსურთ რომ მიირთვათ?..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} //
            style={inputStyle}
          />
          <button onClick={onClose} style={closeBtnStyle}>✖</button>
        </div>

        {/* 3. ძებნის შედეგების სექცია პოპაპში */}
        <div style={resultsContainerStyle}>
          {filteredResults.length > 0 ? (
            filteredResults.map((item) => (
              <div key={item.id} style={resultItemStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={item.image} alt={item.title} style={{ width: '50px', height: '50px', borderRadius: '10px' }} />
                  <div>
                    <h6 style={{ color: 'white', margin: 0 }}>{item.title}</h6>
                    <span style={{ color: '#ffbe33' }}>${item.price}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { addToCart(item); onClose(); }} 
                  style={addBtnStyle}
                >
                  დამატება
                </button>
              </div>
            ))
          ) : searchTerm.trim() !== "" ? (
            <p style={{ color: '#ccc', textAlign: 'center' }}>კერძი ვერ მოიძებნა 😕</p>
          ) : (
            <p style={{ color: '#ccc', textAlign: 'center' }}>დაიწყეთ წერა მოსაძებნად...</p>
          )}
        </div>
      </div>
    </div>
  );
}

// სტილები
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.95)', display: 'flex', justifyContent: 'center',
  paddingTop: '80px', zIndex: 11000,
};

const modalStyle: React.CSSProperties = { width: '90%', maxWidth: '600px' };

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '15px 25px', borderRadius: '30px', border: '2px solid #ffbe33',
  backgroundColor: 'transparent', color: 'white', fontSize: '20px', outline: 'none',
};

const closeBtnStyle: React.CSSProperties = {
  position: 'absolute', right: '20px', background: 'none', border: 'none',
  color: '#ffbe33', fontSize: '24px', cursor: 'pointer',
};

const resultsContainerStyle: React.CSSProperties = {
  maxHeight: '400px', overflowY: 'auto', paddingRight: '10px', marginTop: '20px'
};

const resultItemStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '10px', borderBottom: '1px solid #333', marginBottom: '10px'
};

const addBtnStyle: React.CSSProperties = {
  backgroundColor: '#ffbe33', border: 'none', padding: '5px 15px',
  borderRadius: '20px', color: 'white', cursor: 'pointer', fontWeight: 'bold'
};
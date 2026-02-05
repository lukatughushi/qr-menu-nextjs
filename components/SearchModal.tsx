'use client';

import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

// მონაცემთა მასივი
const menuItems = [
  { id: 1, title_en: "Delicious Pizza", title_ka: "გემრიელი პიცა", price: 20, category: "pizza", image: "/images/f1.png" },
  { id: 2, title_en: "Delicious Burger", title_ka: "გემრიელი ბურგერი", price: 15, category: "burger", image: "/images/f2.png" },
  { id: 3, title_en: "Delicious Pizza", title_ka: "პიკანტური პიცა", price: 17, category: "pizza", image: "/images/f3.png" },
  { id: 4, title_en: "Delicious Pasta", title_ka: "იტალიური პასტა", price: 18, category: "pasta", image: "/images/f4.png" },
  { id: 5, title_en: "French Fries", title_ka: "კარტოფილი ფრი", price: 10, category: "fries", image: "/images/f5.png" },
  { id: 6, title_en: "Delicious Pizza", title_ka: "ყველის პიცა", price: 15, category: "pizza", image: "/images/f6.png" },
  { id: 7, title_en: "Tasty Burger", title_ka: "ცხარე ბურგერი", price: 12, category: "burger", image: "/images/f7.png" },
  { id: 8, title_en: "Tasty Burger", title_ka: "ჩიზბურგერი", price: 14, category: "burger", image: "/images/f8.png" },
  { id: 9, title_en: "Delicious Pasta", title_ka: "პასტა კარბონარა", price: 10, category: "pasta", image: "/images/f9.png" },
];

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const { searchTerm, setSearchTerm, addToCart, language, t } = useCart(); 
  const inputRef = useRef<HTMLInputElement>(null);

  // ფოკუსირება ინპუტზე გახსნისას
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // განახლებული ფილტრაციის ლოგიკა: ეძებს ორივე ენის ველში ერთდროულად
  const filteredResults = searchTerm.trim() === "" 
    ? [] 
    : menuItems.filter((item) => {
        const search = searchTerm.toLowerCase();
        // ამოწმებს ინგლისურ სათაურს ან ქართულ სათაურს
        return (
          item.title_en.toLowerCase().includes(search) || 
          item.title_ka.toLowerCase().includes(search)
        );
      });

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={searchHeaderStyle}>
          <input
            ref={inputRef}
            type="text"
            placeholder={t.search_placeholder} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
          <button onClick={onClose} style={closeBtnStyle}>✖</button>
        </div>

        <div style={resultsContainerStyle}>
          {filteredResults.length > 0 ? (
            filteredResults.map((item) => {
              // ეკრანზე გამოსაჩენი სათაური მაინც დამოკიდებულია არჩეულ ენაზე
              const displayTitle = language === 'ka' ? item.title_ka : item.title_en;
              return (
                <div key={item.id} style={resultItemStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={item.image} alt={displayTitle} style={imageStyle} />
                    <div>
                      <h6 style={titleStyle}>{displayTitle}</h6>
                      <span style={priceStyle}>${item.price}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { 
                      addToCart({
                        id: item.id,
                        title_en: item.title_en,
                        title_ka: item.title_ka,
                        price: item.price,
                        image: item.image
                      }); 
                      onClose(); 
                    }} 
                    style={addBtnStyle}
                  >
                    {t.add}
                  </button>
                </div>
              );
            })
          ) : searchTerm.trim() !== "" ? (
            <p style={infoTextStyle}>{t.no_results}</p>
          ) : (
            <p style={infoTextStyle}>{t.start_typing}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// სტილები უცვლელია
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', justifyContent: 'center',
  paddingTop: '5vh', zIndex: 11000, backdropFilter: 'blur(5px)'
};

const modalStyle: React.CSSProperties = {
  width: '95%', maxWidth: '600px', background: '#222831', 
  padding: '20px', borderRadius: '15px', maxHeight: '80vh', display: 'flex', flexDirection: 'column'
};

const searchHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', position: 'relative', marginBottom: '15px'
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 20px', borderRadius: '25px', border: '2px solid #ffbe33',
  backgroundColor: '#fff', color: '#222', fontSize: '16px', outline: 'none'
};

const closeBtnStyle: React.CSSProperties = {
  position: 'absolute', right: '15px', background: 'none', border: 'none',
  color: '#222', fontSize: '20px', cursor: 'pointer'
};

const resultsContainerStyle: React.CSSProperties = {
  overflowY: 'auto', marginTop: '10px', paddingRight: '5px'
};

const resultItemStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '12px', borderBottom: '1px solid #333', marginBottom: '8px'
};

const imageStyle: React.CSSProperties = {
  width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover'
};

const titleStyle: React.CSSProperties = { color: 'white', margin: 0, fontSize: '14px' };
const priceStyle: React.CSSProperties = { color: '#ffbe33', fontSize: '13px' };
const infoTextStyle: React.CSSProperties = { color: '#ccc', textAlign: 'center', marginTop: '20px', fontSize: '14px' };

const addBtnStyle: React.CSSProperties = {
  backgroundColor: '#ffbe33', border: 'none', padding: '6px 12px',
  borderRadius: '20px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
};
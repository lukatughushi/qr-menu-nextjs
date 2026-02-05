'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

// 1. მონაცემთა მასივი ორივე ენის სათაურით
const menuItems = [
  { id: 1, title_en: "Delicious Pizza", title_ka: "გემრიელი პიცა", price: 20, category: "Pizza", image: "/images/f1.png" },
  { id: 2, title_en: "Delicious Burger", title_ka: "გემრიელი ბურგერი", price: 15, category: "Burger", image: "/images/f2.png" },
  { id: 3, title_en: "Delicious Pizza", title_ka: "პიკანტური პიცა", price: 17, category: "Pizza", image: "/images/f3.png" },
  { id: 4, title_en: "Delicious Pasta", title_ka: "იტალიური პასტა", price: 18, category: "Pasta", image: "/images/f4.png" },
  { id: 5, title_en: "French Fries", title_ka: "კარტოფილი ფრი", price: 10, category: "Fries", image: "/images/f5.png" },
  { id: 6, title_en: "Delicious Pizza", title_ka: "ყველის პიცა", price: 15, category: "Pizza", image: "/images/f6.png" },
  { id: 7, title_en: "Tasty Burger", title_ka: "ცხარე ბურგერი", price: 12, category: "Burger", image: "/images/f7.png" },
  { id: 8, title_en: "Tasty Burger", title_ka: "ჩიზბურგერი", price: 14, category: "Burger", image: "/images/f8.png" },
  { id: 9, title_en: "Delicious Pasta", title_ka: "პასტა კარბონარა", price: 10, category: "Pasta", image: "/images/f9.png" },
];

export default function FoodSection() {
  // 2. შემოგვაქვს საჭირო მნიშვნელობები კონტექსტიდან
  const { addToCart, language, t } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = selectedCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <section className="food_section layout_padding-bottom" id="menu">
      <div className="container">
        <div className="heading_container heading_center">
          {/* თარგმნილი სათაური */}
          <h2>{t.menu}</h2>
        </div>

        {/* განახლებული ფილტრაციის მენიუ */}
        <ul className="filters_menu" style={{ display: 'flex', justifyContent: 'center', listStyle: 'none', gap: '20px', margin: '40px 0' }}>
          {["all", "burger", "pizza", "pasta", "fries"].map((catKey) => {
            const categoryValue = catKey === "all" ? "All" : catKey.charAt(0).toUpperCase() + catKey.slice(1);
            
            return (
              <li 
                key={catKey}
                onClick={() => setSelectedCategory(categoryValue)}
                style={{
                  cursor: 'pointer',
                  padding: '8px 25px',
                  borderRadius: '25px',
                  backgroundColor: selectedCategory === categoryValue ? '#222831' : 'transparent',
                  color: selectedCategory === categoryValue ? '#ffffff' : '#000000',
                  transition: '0.3s'
                }}
              >
                {/* ტექსტს ვიღებთ თარგმანების ფაილიდან გასაღების მიხედვით */}
                {t[catKey]} 
              </li>
            );
          })}
        </ul>

        <div className="filters-content">
          <div className="row grid">
            {filteredItems.map((item) => {
              // დინამიურად ვირჩევთ სათაურს ეკრანზე გამოსაჩენად
              const currentTitle = language === 'ka' ? item.title_ka : item.title_en;

              return (
                <div key={item.id} className="col-sm-6 col-lg-4">
                  <div className="box" style={{ marginTop: '25px' }}>
                    <div className="img-box">
                      <img src={item.image} alt={currentTitle} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                    </div>
                    <div className="detail-box">
                      <h5 style={{ color: 'white' }}>{currentTitle}</h5>
                      <div className="options">
                        <h6 style={{ color: 'white' }}>${item.price}</h6>
                        <button 
                          onClick={() => addToCart({ 
                            id: item.id,
                            title_en: item.title_en,
                            title_ka: item.title_ka,
                            price: item.price,
                            image: item.image
                          })} 
                          style={{ background: '#ffbe33', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}
                        >
                          <i className="fa fa-shopping-cart" style={{ color: 'white' }}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
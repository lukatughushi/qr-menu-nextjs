'use client';

import React from 'react';
import { useCart } from '../context/CartContext';

// 1. მასივი რჩება უცვლელი
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

export default function FoodSection() {
  // 2. ამოვიღეთ searchTerm - აქ ის აღარ გვჭირდება
  const { addToCart } = useCart();

  // 3. წავშალეთ filteredItems-ის ბლოკი. 
  // ახლა პირდაპირ menuItems-ზე გადავივლით map-ით.

  return (
    <section className="food_section layout_padding-bottom" id="menu">
      <div className="container">
        <div className="heading_container heading_center">
          <h2>Our Menu</h2>
        </div>

        <div className="filters-content">
          <div className="row grid">
            {/* 4. ვიყენებთ ორიგინალ menuItems მასივს, რომ მენიუ მუდამ გამოჩნდეს */}
            {menuItems.map((item) => (
              <div key={item.id} className="col-sm-6 col-lg-4">
                <div className="box">
                  <div className="img-box">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="detail-box">
                    <h5>{item.title}</h5>
                    <div className="options">
                      <h6>${item.price}</h6>
                      <button 
                        onClick={() => addToCart(item)} 
                        style={{ background: '#ffbe33', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}
                      >
                        <i className="fa fa-shopping-cart" style={{ color: 'white' }}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
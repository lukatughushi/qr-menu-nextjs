'use client';

import React from 'react';
import Link from 'next/link';

// პროდუქტების მონაცემები
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
  return (
    <section className="food_section layout_padding-bottom">
      <div className="container">
        <div className="heading_container heading_center">
          <h2>Our Menu</h2>
        </div>

        {/* ფილტრაციის ღილაკები */}
        <ul className="filters_menu">
          <li className="active" data-filter="*">All</li>
          <li data-filter=".burger">Burger</li>
          <li data-filter=".pizza">Pizza</li>
          <li data-filter=".pasta">Pasta</li>
          <li data-filter=".fries">Fries</li>
        </ul>

        <div className="filters-content">
          <div className="row grid">
            {menuItems.map((item) => (
              <div key={item.id} className={`col-sm-6 col-lg-4 all ${item.category}`}>
                <div className="box">
                  <div>
                    <div className="img-box">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="detail-box">
                      <h5>{item.title}</h5>
                      <p>
                        Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque.
                      </p>
                      <div className="options">
                        <h6>${item.price}</h6>
                        <Link href="">
                          <svg version="1.1" width="20" height="20" viewBox="0 0 456.029 456.029" style={{fill: 'white'}}>
                            <path d="M345.6,338.862c-29.184,0-53.248,23.552-53.248,53.248c0,29.184,23.552,53.248,53.248,53.248 c29.184,0,53.248-23.552,53.248-53.248C398.336,362.926,374.784,338.862,345.6,338.862z" />
                            <path d="M439.296,84.91c-1.024,0-2.56-0.512-4.096-0.512H112.64l-5.12-34.304C104.448,27.566,84.992,10.67,61.952,10.67H20.48 C9.216,10.67,0,19.886,0,31.15c0,11.264,9.216,20.48,20.48,20.48h41.472c2.56,0,4.608,2.048,5.12,4.608l31.744,216.064 c4.096,27.136,27.648,47.616,55.296,47.616h212.992c26.624,0,49.664-18.944,55.296-45.056l33.28-166.4 C457.728,97.71,450.56,86.958,439.296,84.91z" />
                            <path d="M215.04,389.55c-1.024-28.16-24.576-50.688-52.736-50.688c-29.696,1.536-52.224,26.112-51.2,55.296 c1.024,28.16,24.064,50.688,52.224,50.688h1.024C193.536,443.31,216.576,418.734,215.04,389.55z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="btn-box">
          <Link href="/menu">View More</Link>
        </div>
      </div>
    </section>
  );
}
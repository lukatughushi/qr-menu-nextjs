'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext'; // შემოგვაქვს ჰუკი

export default function Hero() {
  // ვიღებთ თარგმანებს კონტექსტიდან
  const { t } = useCart();

  return (
    <section className="slider_section">
      <div 
        id="customCarousel1" 
        className="carousel slide" 
        data-ride="carousel" 
        data-interval="3000"
      >
        <div className="carousel-inner">
          
          {/* სლაიდი 1 */}
          <div className="carousel-item active">
            <div className="container">
              <div className="row">
                <div className="col-md-7 col-lg-6">
                  <div className="detail-box">
                    <h1>{t.hero_title}</h1>
                    <p>{t.hero_desc}</p>
                    <div className="btn-box">
                      <Link href="#menu" className="btn1">
                        {t.order_now}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* სლაიდი 2 */}
          <div className="carousel-item">
            <div className="container">
              <div className="row">
                <div className="col-md-7 col-lg-6">
                  <div className="detail-box">
                    <h1>{t.hero_title2}</h1>
                    <p>{t.hero_desc}</p>
                    <div className="btn-box">
                      <Link href="#menu" className="btn1">
                        {t.order_now}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* სლაიდი 3 */}
          <div className="carousel-item">
            <div className="container">
              <div className="row">
                <div className="col-md-7 col-lg-6">
                  <div className="detail-box">
                    <h1>{t.hero_title3}</h1>
                    <p>{t.hero_desc}</p>
                    <div className="btn-box">
                      <Link href="#menu" className="btn1">
                        {t.order_now}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="container">
          <ol className="carousel-indicators">
            <li data-target="#customCarousel1" data-slide-to="0" className="active"></li>
            <li data-target="#customCarousel1" data-slide-to="1"></li>
            <li data-target="#customCarousel1" data-slide-to="2"></li>
          </ol>
        </div>
      </div>
    </section>
  );
}
'use client';

import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="slider_section">
      {/* აი ეს დივი აკონტროლებს ფონს, სადაც ბურგერი და ფრია */}
      <div className="bg-box">
         {/* აქ სურათს არ ვსვამთ, მას CSS-ით ჩავტვირთავთ უკეთესი კონტროლისთვის */}
      </div>

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
                    <h1>Fast Food Restaurant</h1>
                    <p>
                      Doloremque, itaque aperiam facilis rerum, commodi, temporibus sapiente ad mollitia laborum quam quisquam esse error unde.
                    </p>
                    <div className="btn-box">
                      <Link href="/menu" className="btn1">Order Now</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ... დანარჩენი სლაიდები იგივე დარჩეს ... */}
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
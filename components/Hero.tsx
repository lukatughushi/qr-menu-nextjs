'use client';

import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="slider_section">
      {/* დავამატე data-ride და data-interval ავტომატური გადასვლისთვის (3 წამი) */}
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
                      Doloremque, itaque aperiam facilis rerum, commodi, temporibus sapiente ad mollitia laborum quam quisquam esse error unde. Tempora ex doloremque, labore, sunt repellat dolore, iste magni quos nihil ducimus libero ipsam.
                    </p>
                    <div className="btn-box">
                      <Link href="/menu" className="btn1">
                        Order Now
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
                    <h1>Delicious Pizza & Burgers</h1>
                    <p>
                      Doloremque, itaque aperiam facilis rerum, commodi, temporibus sapiente ad mollitia laborum quam quisquam esse error unde. Tempora ex doloremque, labore, sunt repellat dolore, iste magni quos nihil ducimus libero ipsam.
                    </p>
                    <div className="btn-box">
                      <Link href="/menu" className="btn1">
                        Order Now
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
                    <h1>Best Quality Food</h1>
                    <p>
                      Doloremque, itaque aperiam facilis rerum, commodi, temporibus sapiente ad mollitia laborum quam quisquam esse error unde. Tempora ex doloremque, labore, sunt repellat dolore, iste magni quos nihil ducimus libero ipsam.
                    </p>
                    <div className="btn-box">
                      <Link href="/menu" className="btn1">
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* სლაიდერის ინდიკატორები (წერტილები) */}
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
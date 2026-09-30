'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext'; // შემოგვაქვს კონტექსტი

export default function About() {
  // ვიღებთ თარგმანებს
  const { t } = useCart();

  return (
    <section className="about_section layout_padding">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="img-box">
              <img src="/images/about-img.png" alt="About Feane" />
            </div>
          </div>
          <div className="col-md-6">
            <div className="detail-box">
              <div className="heading_container">
                {/* თარგმნილი სათაური */}
                <h2>{t.about_title}</h2>
              </div>
              <p>
                {/* თარგმნილი აღწერა */}
                {t.about_text}
              </p>
              <Link href="#about">
                {/* თარგმნილი ღილაკი */}
                {t.read_more}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import React from 'react';
import { useCart } from '../context/CartContext'; // შემოგვაქვს კონტექსტი

export default function BookSection() {
  const { t } = useCart(); // ვიღებთ თარგმანებს
  const googleMapsUrl = "https://www.google.com/maps";

  return (
    <section className="book_section layout_padding" id="book">
      <div className="container">
        <div className="heading_container">
          {/* თარგმნილი სათაური */}
          <h2>{t.book_title}</h2>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form_container">
              <form action="">
                <div>
                  <input type="text" className="form-control" placeholder={t.name_placeholder} />
                </div>
                <div>
                  <input type="text" className="form-control" placeholder={t.phone_placeholder} />
                </div>
                <div>
                  <input type="email" className="form-control" placeholder={t.email_placeholder} />
                </div>
                <div>
                  <select className="form-control nice-select wide" defaultValue="">
                    <option value="" disabled>{t.persons_placeholder}</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
                <div>
                  <input type="date" className="form-control" />
                </div>
                <div className="btn_box">
                  {/* თარგმნილი ღილაკი */}
                  <button type="submit">{t.book_now}</button>
                </div>
              </form>
            </div>
          </div>
          <div className="col-md-6">
            <div className="map_container">
              <iframe
                src="https://www.google.com/maps/embed" // გამოიყენე რეალური embed ლინკი
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '15px' }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
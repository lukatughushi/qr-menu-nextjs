'use client';

import React from 'react';
import { useCart } from '../context/CartContext';

export default function BookSection() {
  // ვიღებთ t ობიექტს და language-ს კონტექსტიდან
  const { t, language } = useCart(); 

  return (
    <section className="book_section layout_padding" id="book">
      <div className="container">
        <div className="heading_container">
          {/* თარგმნილი სათაური translations.ts-დან */}
          <h2>{t.book_title}</h2>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form_container">
              <form action="">
                <div>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={t.name_placeholder} 
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={t.phone_placeholder} 
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder={t.email_placeholder} 
                  />
                </div>
                <div>
                  {/* key={language} აიძულებს select-ს განახლდეს ენის შეცვლისას */}
                  <select 
                    key={language} 
                    className="form-control nice-select wide" 
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {t.persons_placeholder}
                    </option>
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.1286071444054!2d44.783333!3d41.716667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDQzJzAwLjAiTiA0NMKwNDcnMDAuMCJF!5e0!3m2!1sen!2sge!4v1631234567890!5m2!1sen!2sge"
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
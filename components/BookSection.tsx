'use client';

import React from 'react';

export default function BookSection() {
  // მისამართის ლინკი Google Maps-ისთვის (შეგიძლია შეცვალო შენი რესტორნის ლოკაციით)
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=40.712775,-74.005973";

  return (
    <section className="book_section layout_padding">
      <div className="container">
        <div className="heading_container">
          <h2>Book A Table</h2>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form_container">
              <form action="">
                <div>
                  <input type="text" className="form-control" placeholder="Your Name" />
                </div>
                <div>
                  <input type="text" className="form-control" placeholder="Phone Number" />
                </div>
                <div>
                  <input type="email" className="form-control" placeholder="Your Email" />
                </div>
                <div>
                  <select className="form-control nice-select wide" defaultValue="">
                    <option value="" disabled>How many persons?</option>
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
                  <button type="submit">Book Now</button>
                </div>
              </form>
            </div>
          </div>
          <div className="col-md-6">
            <div className="map_container">
              {/* ბმული, რომელიც გადაიყვანს მომხმარებელს Google Maps-ზე */}
              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'block', width: '100%', height: '100%' }}
              >
             <div className="map_container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.127202303533!2d44.7788461!3d41.7177534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40440cd7e64f6241%3A0x6aa67cf2436f5629!2sTbilisi%2C%20Georgia!5e0!3m2!1sen!2sge!4v1706630000000!5m2!1sen!2sge"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '15px' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
                          </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
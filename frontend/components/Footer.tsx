'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext'; //

export default function Footer() {
  const { t } = useCart(); //

  return (
    <footer className="footer_section">
      <div className="container">
        <div className="row">
          {/* კონტაქტები */}
          <div className="col-md-4 footer-col">
            <div className="footer_contact">
              <h4>{t.footer_contact}</h4>
              <div className="contact_link_box">
                <Link href="">
                  <i className="fa fa-map-marker" aria-hidden="true"></i>
                  <span>{t.footer_location}</span>
                </Link>
                <Link href="">
                  <i className="fa fa-phone" aria-hidden="true"></i>
                  <span>Call +01 1234567890</span>
                </Link>
                <Link href="">
                  <i className="fa fa-envelope" aria-hidden="true"></i>
                  <span>demo@gmail.com</span>
                </Link>
              </div>
            </div>
          </div>

          {/* დეტალები და სოციალური ქსელები */}
          <div className="col-md-4 footer-col">
            <div className="footer_detail">
              <Link href="/" className="footer-logo">
                Pumpkins
              </Link>
              <p>{t.footer_desc}</p>
              <div className="footer_social">
                <Link href=""><i className="fa fa-facebook" aria-hidden="true"></i></Link>
                <Link href=""><i className="fa fa-twitter" aria-hidden="true"></i></Link>
                <Link href=""><i className="fa fa-linkedin" aria-hidden="true"></i></Link>
                <Link href=""><i className="fa fa-instagram" aria-hidden="true"></i></Link>
                <Link href=""><i className="fa fa-pinterest" aria-hidden="true"></i></Link>
              </div>
            </div>
          </div>

          {/* სამუშაო საათები */}
          <div className="col-md-4 footer-col">
            <h4>{t.footer_opening}</h4>
            <p>{t.footer_everyday}</p>
            <p>10.00 Am - 10.00 Pm</p>
          </div>
        </div>

        <div className="footer-info">
          <p>
            &copy; 2026 {t.footer_rights}{' '}
          </p>
        </div>
      </div>
    </footer>
  );
}
'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer_section">
      <div className="container">
        <div className="row">
          {/* კონტაქტები */}
          <div className="col-md-4 footer-col">
            <div className="footer_contact">
              <h4>Contact Us</h4>
              <div className="contact_link_box">
                <Link href="">
                  <i className="fa fa-map-marker" aria-hidden="true"></i>
                  <span>Location</span>
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
                Feane
              </Link>
              <p>
                Necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with
              </p>
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
            <h4>Opening Hours</h4>
            <p>Everyday</p>
            <p>10.00 Am -10.00 Pm</p>
          </div>
        </div>

        {/* საავტორო უფლებები - აქ მუშაობს displayYear */}
        <div className="footer-info">
          <p>
            &copy; <span id="displayYear"></span> All Rights Reserved By{' '}
            <a href="https://html.design/" target="_blank" rel="noreferrer">Free Html Templates</a>
            <br /><br />
            &copy; <span id="displayYear"></span> Distributed By{' '}
            <a href="https://themewagon.com/" target="_blank" rel="noreferrer">ThemeWagon</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
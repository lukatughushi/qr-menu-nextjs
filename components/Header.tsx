'use client';

import React, { useState } from 'react'; 
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import CartModal from './CartModal'; 
// 1. შემოვიტანოთ საძიებო მოდალი (ჯერ უნდა შექმნა ეს ფაილი)
import SearchModal from './SearchModal'; 

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // საძიებო მოდალისთვის
  const { cart } = useCart();

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <header className="header_section">
      <div className="container">
        <nav className="navbar navbar-expand-lg custom_nav-container">
          <Link className="navbar-brand" href="#home">
            <Image src="/images/logo.png" alt="Logo" width={150} height={50} priority />
          </Link>

          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
            <span className=""> </span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item active"><Link className="nav-link" href="#home">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" href="#menu">Menu</Link></li>
              <li className="nav-item"><Link className="nav-link" href="#about">About</Link></li>
              <li className="nav-item"><Link className="nav-link" href="#book">Book Table</Link></li>
            </ul>

            <div className="user_option">
              {/* კალათის ღილაკი */}
              <div className="cart_link" onClick={toggleCart} style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <svg version="1.1" width="20" height="20" viewBox="0 0 456.029 456.029" style={{fill: 'white'}}>
                  <path d="M345.6,338.862c-29.184,0-53.248,23.552-53.248,53.248c0,29.184,23.552,53.248,53.248,53.248 c29.184,0,53.248-23.552,53.248-53.248C398.336,362.926,374.784,338.862,345.6,338.862z" />
                  <path d="M439.296,84.91c-1.024,0-2.56-0.512-4.096-0.512H112.64l-5.12-34.304C104.448,27.566,84.992,10.67,61.952,10.67H20.48 C9.216,10.67,0,19.886,0,31.15c0,11.264,9.216,20.48,20.48,20.48h41.472c2.56,0,4.608,2.048,5.12,4.608l31.744,216.064 c4.096,27.136,27.648,47.616,55.296,47.616h212.992c26.624,0,49.664-18.944,55.296-45.056l33.28-166.4 C457.728,97.71,450.56,86.958,439.296,84.91z" />
                  <path d="M215.04,389.55c-1.024-28.16-24.576-50.688-52.736-50.688c-29.696,1.536-52.224,26.112-51.2,55.296 c1.024,28.16,24.064,50.688,52.224,50.688h1.024C193.536,443.31,216.576,418.734,215.04,389.55z" />
                </svg>
                {cart.length > 0 && (
                  <span style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#ffbe33', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold' }}>
                    {cart.length}
                  </span>
                )}
              </div>

              {/* საძიებო ღილაკი - ახლა ხსნის მოდალს 🔍 */}
              <button className="btn nav_search-btn" onClick={toggleSearch} style={{ border: 'none', background: 'none', color: 'white', marginLeft: '15px' }}>
                <i className="fa fa-search" aria-hidden="true" style={{ fontSize: '20px' }}></i>
              </button>

              <Link href="#menu" className="order_online">Order Online</Link>
            </div>
          </div>
        </nav>
      </div>

      {/* მოდალების გამოჩენა */}
      {isCartOpen && <CartModal onClose={toggleCart} />}
      {isSearchOpen && <SearchModal onClose={toggleSearch} />}
    </header>
  );
}
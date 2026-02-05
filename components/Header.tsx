'use client';

import React, { useState } from 'react'; 
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import CartModal from './CartModal'; 
import SearchModal from './SearchModal'; 

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // 1. მენიუს მართვის სტეიტი
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { cart, language, setLanguage, t } = useCart();

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <header className="header_section">
      <div className="container">
        <nav className="navbar navbar-expand-lg custom_nav-container" style={{ flexWrap: 'nowrap' }}>
          <Link className="navbar-brand" href="#home" style={{ minWidth: '120px' }}>
            <Image src="/images/logo.png" alt="Logo" width={130} height={40} priority />
          </Link>

          {/* 2. Toggler ღილაკი, რომელიც ცვლის fa-bars და fa-times ხატულებს */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
          >
            <span className="navbar-toggler-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <i className={`fa ${isMenuOpen ? 'fa-times' : 'fa-bars'}`} style={{ color: 'white' }}></i>
            </span>
          </button>

          <div className={`collapse navbar-collapse ${language === 'ka' ? 'geo-nav' : ''} ${isMenuOpen ? 'show' : ''}`} id="navbarSupportedContent">
            <ul className="navbar-nav mx-auto" style={{ flexDirection: 'row', gap: '5px' }}>
              {/* 3. ლინკზე დაჭერისას მენიუ იხურება და ხატულა ბრუნდება საწყის სახეში */}
              <li className="nav-item active">
                <Link className="nav-link" href="#home" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>
                  {language === 'ka' ? 'მთავარი' : 'Home'}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="#menu" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>
                  {t.menu}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="#about" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>
                  {t.about}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="#book" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>
                  {t.book}
                </Link>
              </li>
            </ul>

            <div className="user_option" style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
              <button 
                onClick={() => setLanguage(language === 'ka' ? 'en' : 'ka')}
                style={langButtonStyle}
              >
                {language === 'ka' ? 'EN' : 'KA'}
              </button>

              <div className="cart_link" onClick={toggleCart} style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', margin: '0 10px' }}>
                <svg version="1.1" width="20" height="20" viewBox="0 0 456.029 456.029" style={{fill: 'white'}}>
                  <path d="M345.6,338.862c-29.184,0-53.248,23.552-53.248,53.248c0,29.184,23.552,53.248,53.248,53.248 c29.184,0,53.248-23.552,53.248-53.248C398.336,362.926,374.784,338.862,345.6,338.862z" />
                  <path d="M439.296,84.91c-1.024,0-2.56-0.512-4.096-0.512H112.64l-5.12-34.304C104.448,27.566,84.992,10.67,61.952,10.67H20.48 C9.216,10.67,0,19.886,0,31.15c0,11.264,9.216,20.48,20.48,20.48h41.472c2.56,0,4.608,2.048,5.12,4.608l31.744,216.064 c4.096,27.136,27.648,47.616,55.296,47.616h212.992c26.624,0,49.664-18.944,55.296-45.056l33.28-166.4 C457.728,97.71,450.56,86.958,439.296,84.91z" />
                  <path d="M215.04,389.55c-1.024-28.16-24.576-50.688-52.736-50.688c-29.696,1.536-52.224,26.112-51.2,55.296 c1.024,28.16,24.064,50.688,52.224,50.688h1.024C193.536,443.31,216.576,418.734,215.04,389.55z" />
                </svg>
                {cart.length > 0 && (
                  <span style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#ffbe33', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </div>

              <button className="btn nav_search-btn" onClick={toggleSearch} style={{ border: 'none', background: 'none', color: 'white', marginRight: '10px' }}>
                <i className="fa fa-search" aria-hidden="true" style={{ fontSize: '18px' }}></i>
              </button>

              <Link href="#menu" className="order_online" style={{ whiteSpace: 'nowrap', padding: '8px 15px' }} onClick={() => setIsMenuOpen(false)}>
                {language === 'ka' ? 'შეუკვეთე' : 'Order Online'}
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {isCartOpen && <CartModal onClose={toggleCart} />}
      {isSearchOpen && <SearchModal onClose={toggleSearch} />}
    </header>
  );
}

const langButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #ffbe33',
  color: 'white',
  padding: '4px 8px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px',
  transition: '0.3s',
  whiteSpace: 'nowrap'
};

const navLinkStyle: React.CSSProperties = {
  whiteSpace: 'nowrap',
  padding: '10px 8px',
  fontSize: '14px'
};
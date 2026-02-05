'use client';

import React from 'react';
import { useCart } from '../context/CartContext';

interface CartModalProps {
  onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
  // შემოგვაქვს საჭირო ფუნქციები კონტექსტიდან
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useCart();

  // ჯამური ფასის დათვლა რაოდენობის გათვალისწინებით
  const totalPrice = cart.reduce((total: number, item: any) => {
    return total + (item.price * (item.quantity || 1));
  }, 0);

  return (
    <div className="cart-modal-overlay" style={overlayStyle}>
      <div className="cart-modal-content" style={modalStyle}>
        
        <div style={headerStyle}>
          <h3 style={{ color: '#222', margin: 0 }}>თქვენი კალათა 🛒</h3>
          <h4 style={{ color: '#ffbe33', margin: '5px 0' }}>სულ: ${totalPrice.toFixed(2)}</h4>
          <button onClick={onClose} style={closeButtonStyle}>✖</button>
        </div>

        <hr />

        <div style={listStyle}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>კალათა ცარიელია</p>
          ) : (
            cart.map((item: any) => (
              <div key={item.id} style={itemStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {item.image && (
                    <img src={item.image} alt={item.title} style={{ width: '50px', height: '50px', borderRadius: '5px', objectFit: 'cover' }} />
                  )}
                  <div>
                    <h6 style={{ margin: 0, color: '#222' }}>{item.title}</h6>
                    <span style={{ fontSize: '14px', color: '#666' }}>${item.price}</span>
                  </div>
                </div>
                
                {/* რაოდენობის მართვის სექცია */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={quantityControlsStyle}>
                    <button onClick={() => decreaseQuantity(item.id)} style={qtyBtnStyle}>-</button>
                    <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)} style={qtyBtnStyle}>+</button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    style={removeButtonStyle}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <button style={checkoutButtonStyle}>შეკვეთის გაფორმება</button>
        )}
      </div>
    </div>
  );
}

// --- დამატებული და განახლებული სტილები ---

const quantityControlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f8f8f8',
  borderRadius: '20px',
  padding: '2px 8px',
  gap: '8px'
};

const qtyBtnStyle: React.CSSProperties = {
  border: 'none',
  background: 'none',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  color: '#ffbe33',
  padding: '0 5px'
};

const removeButtonStyle: React.CSSProperties = {
  color: '#ff4d4d',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  marginLeft: '5px'
};

// (overlayStyle, modalStyle, headerStyle, closeButtonStyle, listStyle, itemStyle, checkoutButtonStyle იგივე რჩება)
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 };
const modalStyle: React.CSSProperties = { backgroundColor: 'white', padding: '25px', borderRadius: '15px', width: '95%', maxWidth: '450px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' };
const headerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', position: 'relative', gap: '5px' };
const closeButtonStyle: React.CSSProperties = { position: 'absolute', top: '-5px', right: '-5px', border: 'none', background: '#f1f1f1', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' };
const listStyle: React.CSSProperties = { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' };
const itemStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' };
const checkoutButtonStyle: React.CSSProperties = { width: '100%', backgroundColor: '#ffbe33', color: 'white', border: 'none', padding: '14px', borderRadius: '30px', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
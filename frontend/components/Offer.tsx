'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500';

interface OfferItem {
  id: number;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  price: number;
  discount_percent: number;
  image_url: string | null;
}

export default function Offer() {
  const { addToCart, t, language } = useCart();
  const [offers, setOffers] = useState<OfferItem[]>([]);

  useEffect(() => {
    supabase
      .from('menu_items')
      .select('id, name, name_en, description, description_en, price, discount_percent, image_url')
      .eq('is_visible', true)
      .gt('discount_percent', 0)
      .order('discount_percent', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setOffers(data ?? []);
      });
  }, []);

  if (offers.length === 0) return null;

  return (
    <section className="ofv3-section">
      <div className="container">

        {/* ── Section heading ──────────────────────────────────── */}
        <div className="ofv3-header">
          <h2 className="ofv3-main-title">
            {language === 'en' ? 'Daily Specials' : 'დღის შეთავაზება'}
          </h2>
          <div className="ofv3-rule" aria-hidden="true">
            <span className="ofv3-rule-line" />
            <span className="ofv3-rule-gem"  />
            <span className="ofv3-rule-line" />
          </div>
        </div>

        {/* ── 2-column grid ────────────────────────────────────── */}
        <div className="ofv3-grid">
          {offers.map(offer => {
            const imgSrc     = offer.image_url || FALLBACK_IMAGE;
            const discount   = offer.discount_percent;
            const discounted = +(offer.price * (1 - discount / 100)).toFixed(2);
            const name = language === 'en' && offer.name_en ? offer.name_en : offer.name;
            const desc =
              language === 'en' && offer.description_en
                ? offer.description_en
                : offer.description;
            const discountLabel = discount >= 50 ? `1+1\nუფასო` : `-${discount}%`;

            return (
              <div key={offer.id} className="ofv3-card">

                {/* ── LEFT HALF — product image ── */}
                <div className="ofv3-img-half">
                  <img
                    src={imgSrc}
                    alt={name}
                    className="ofv3-img"
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                </div>

                {/* ── RIGHT HALF — text content ── */}
                <div className="ofv3-content-half">
                  {/* Dominant element: big bold discount */}
                  <div className="ofv3-discount">{discountLabel}</div>

                  <h4 className="ofv3-name">{name}</h4>

                  {desc && <p className="ofv3-desc">{desc}</p>}

                  {/* Price + button row — pinned to bottom of content half */}
                  <div className="ofv3-bottom-row">
                    <div className="ofv3-prices">
                      <span className="ofv3-price-new">₾{discounted}</span>
                      <span className="ofv3-price-old">₾{offer.price.toFixed(2)}</span>
                    </div>
                    <button
                      className="ofv3-btn"
                      onClick={() =>
                        addToCart({
                          id: offer.id,
                          title_en: offer.name_en || offer.name,
                          title_ka: offer.name,
                          price: discounted,
                          image: imgSrc,
                        })
                      }
                    >
                      <i className="fa fa-shopping-cart ofv3-btn-icon" />
                      <span className="ofv3-btn-text">{t.add_offer}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════
           OFFER SECTION — Clean 50/50 Card Layout  (no border frame)
           ═══════════════════════════════════════════════════════════ */

        .ofv3-section { padding: 60px 0 70px; }

        /* ── Heading ─────────────────────────────────────────────── */
        .ofv3-header {
          text-align: center;
          margin-bottom: 36px;
        }
        .ofv3-main-title {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 12px;
          line-height: 1.15;
        }
        /* Thin decorative rule with amber gem */
        .ofv3-rule {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          max-width: 200px;
          margin: 0 auto;
        }
        .ofv3-rule-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 190, 51, 0.38);
        }
        .ofv3-rule-gem {
          width: 7px;
          height: 7px;
          background: #ffbe33;
          transform: rotate(45deg);
          flex-shrink: 0;
          box-shadow: 0 0 6px rgba(255, 190, 51, 0.5);
        }

        /* ── 2-column grid ───────────────────────────────────────── */
        .ofv3-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* ══════════════════════════════════════════════════════════
           DESKTOP CARD  ≥ 768px — horizontal 50/50 rectangle
           ══════════════════════════════════════════════════════════ */

        .ofv3-card {
          display: flex;
          flex-direction: row;
          height: 178px;          /* compact landscape height */
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          /* subtle elevation — no heavy border */
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.07),
            0 4px 14px rgba(0, 0, 0, 0.09);
          transition: transform 0.26s ease, box-shadow 0.26s ease;
        }
        .ofv3-card:hover {
          transform: translateY(-5px);
          box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.07),
            0 10px 28px rgba(0, 0, 0, 0.14);
        }
        .ofv3-card:active { transform: scale(0.975); transition-duration: 0.1s; }

        /* ── Left half: image fills exactly 50% of card width ── */
        .ofv3-img-half {
          flex: 0 0 50%;
          overflow: hidden;
          position: relative;
        }
        .ofv3-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.42s ease;
        }
        .ofv3-card:hover .ofv3-img { transform: scale(1.06); }

        /* ── Right half: content fills the other 50% ─────────── */
        .ofv3-content-half {
          flex: 0 0 50%;
          min-width: 0;
          padding: 16px 20px 16px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          overflow: hidden;
        }

        /* Dominant text — must be the biggest thing on the card */
        .ofv3-discount {
          font-size: clamp(1.9rem, 3.2vw, 2.7rem);
          font-weight: 900;
          color: #ffbe33;
          line-height: 1.0;
          white-space: pre-line;   /* renders the \n in "1+1\nუფასო" */
          letter-spacing: -0.5px;
          flex-shrink: 0;
        }

        .ofv3-name {
          font-family: 'Dancing Script', cursive;
          font-size: 1.15rem;
          color: #1a1a1a;
          margin: 5px 0 0;
          line-height: 1.2;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          flex-shrink: 0;
        }

        .ofv3-desc {
          font-size: 11.5px;
          color: #888;
          margin: 3px 0 0;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          flex-shrink: 0;
        }

        /* Price + button — pushed to the card bottom */
        .ofv3-bottom-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
          padding-top: 6px;
        }
        .ofv3-prices {
          display: flex;
          align-items: baseline;
          gap: 5px;
          flex-shrink: 0;
        }
        .ofv3-price-new {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1a1a1a;
        }
        .ofv3-price-old {
          font-size: 11px;
          color: #bbb;
          text-decoration: line-through;
        }

        /* Dark button stretches to fill the remaining right-half width */
        .ofv3-btn {
          flex: 1;
          min-width: 0;
          padding: 8px 10px;
          background: #222831;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          overflow: hidden;
          white-space: nowrap;
        }
        .ofv3-btn:hover { background: #ffbe33; color: #1a1a1a; }
        .ofv3-btn-icon  { font-size: 11px; flex-shrink: 0; }

        /* ══════════════════════════════════════════════════════════
           MOBILE  < 768px — vertical cards, 2-column grid
           ══════════════════════════════════════════════════════════ */
        @media (max-width: 767px) {
          .ofv3-section { padding: 44px 0 52px; }
          .ofv3-header  { margin-bottom: 22px; }
          .ofv3-grid    { gap: 10px; }

          /* Flip to vertical */
          .ofv3-card {
            flex-direction: column;
            height: auto;
          }
          /* Image becomes a top band */
          .ofv3-img-half {
            flex: none;
            width: 100%;
            aspect-ratio: 4 / 3;
            height: auto;
          }
          /* Content fills below */
          .ofv3-content-half {
            flex: none;
            width: 100%;
            padding: 10px 11px 12px;
            gap: 6px;
          }
          .ofv3-discount   { font-size: clamp(1.4rem, 7vw, 2rem); }
          .ofv3-name       { font-size: 0.95rem; white-space: normal; }
          /* Stack price and button vertically */
          .ofv3-bottom-row {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
            padding-top: 4px;
          }
          .ofv3-price-new  { font-size: 0.95rem; }
          .ofv3-btn        { font-size: 12px; border-radius: 7px; padding: 8px 10px; }
        }

        /* ── Very small phones  ≤ 430px ──────────────────────── */
        @media (max-width: 430px) {
          .ofv3-grid          { gap: 8px; }
          .ofv3-content-half  { padding: 8px 8px 10px; gap: 5px; }
          .ofv3-discount      { font-size: clamp(1.1rem, 7vw, 1.45rem); }
          .ofv3-name          { font-size: 0.85rem; }
          .ofv3-desc          { display: none; }
          .ofv3-price-new     { font-size: 0.85rem; }
          .ofv3-price-old     { font-size: 10px; }
          /* Icon-only button saves horizontal space */
          .ofv3-btn-text      { display: none; }
          .ofv3-btn           { flex: none; width: 100%; padding: 8px; }
        }
      `}</style>
    </section>
  );
}

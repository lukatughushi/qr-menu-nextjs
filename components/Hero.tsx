'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

interface Banner {
  id: number;
  title_ka: string;
  subtitle_ka: string;
  title_en: string;
  subtitle_en: string;
  image_url: string | null;
  is_active: boolean;
}

const SLIDE_HEIGHT  = '650px';
const SLIDE_MIN_H   = 500;
const INTERVAL_MS   = 7000;   // fixed 7-second auto-advance
const FADE_MS       = 1100;   // crossfade duration
const KB_DURATION   = INTERVAL_MS + FADE_MS + 600; // Ken Burns always outlasts one cycle

export default function Hero() {
  const { t, language } = useCart();
  const [banners, setBanners]   = useState<Banner[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [current, setCurrent]   = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [fading, setFading]     = useState(false);

  const lockRef      = useRef(false);
  const currentRef   = useRef(0);
  const bannerLenRef = useRef(0);

  useEffect(() => { currentRef.current = current; },          [current]);
  useEffect(() => { bannerLenRef.current = banners.length; }, [banners.length]);

  useEffect(() => {
    supabase
      .from('hero_banners')
      .select('id, title_ka, subtitle_ka, title_en, subtitle_en, image_url, is_active')
      .eq('is_active', true)
      .order('id', { ascending: true })
      .then(({ data }) => {
        setBanners(data ?? []);
        setLoaded(true);
      });
  }, []);

  const advance = useCallback(() => {
    if (lockRef.current || bannerLenRef.current <= 1) return;
    lockRef.current = true;
    const next = (currentRef.current + 1) % bannerLenRef.current;

    // Snapshot the outgoing index, then immediately flip current to the new slide.
    // React 18 batches all three updates into one render, so the outgoing slide
    // and the incoming slide both appear in the same frame.
    setOutgoing(currentRef.current);
    setFading(true);
    setCurrent(next);

    setTimeout(() => {
      setOutgoing(null);
      setFading(false);
      lockRef.current = false;
    }, FADE_MS);
  }, []);

  useEffect(() => {
    if (!loaded || banners.length <= 1) return;
    const id = setInterval(advance, INTERVAL_MS);
    return () => clearInterval(id);
  }, [loaded, advance, banners.length]);

  if (!loaded || banners.length === 0) return null;

  const title    = (b: Banner) => language === 'en' ? (b.title_en    || b.title_ka)    : b.title_ka;
  const subtitle = (b: Banner) => language === 'en' ? (b.subtitle_en || b.subtitle_ka) : b.subtitle_ka;

  // kbMode: single-banner breathes forever; multi-banner plays once per show
  const kbMode = banners.length === 1
    ? `heroKenBurns ${KB_DURATION}ms ease-in-out 0s infinite alternate`
    : `heroKenBurns ${KB_DURATION}ms ease-in-out forwards`;

  const renderSlide = (idx: number, role: 'steady' | 'in' | 'out') => {
    const banner = banners[idx];
    return (
      <div
        key={`s-${idx}`}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#101010',
          isolation: 'isolate',
          overflow: 'hidden',
          // Incoming sits on top so it fades in over the outgoing layer
          zIndex: role === 'in' || role === 'steady' ? 2 : 1,
          animation:
            role === 'in'  ? `heroCrossfadeIn  ${FADE_MS}ms ease-in-out forwards` :
            role === 'out' ? `heroCrossfadeOut ${FADE_MS}ms ease-in-out forwards` :
            'none',
        }}
      >
        {/* Background image — Ken Burns zoom keeps the slide alive */}
        {banner.image_url && (
          <img
            src={banner.image_url}
            alt={title(banner)}
            style={{
              position: 'absolute',
              top: '-5%', left: '-5%',
              width: '110%', height: '110%',
              objectFit: 'cover',
              objectPosition: 'center',
              zIndex: -1,
              animation: kbMode,
            }}
          />
        )}

        {/* Left-side gradient overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 55%, transparent 100%)',
            zIndex: 0,
          }}
        />

        {/* Text */}
        <div
          className="container"
          style={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            paddingTop: 80,
          }}
        >
          <div className="col-md-7 col-lg-6" style={{ paddingLeft: 0 }}>
            <h1
              style={{
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
                lineHeight: 1.2,
                marginBottom: 16,
                animation: role === 'in' ? 'heroTextUp 0.7s 0.5s ease-out both' : 'none',
              }}
            >
              {title(banner)}
            </h1>

            {subtitle(banner) && (
              <p
                style={{
                  color: '#e5e7eb',
                  fontSize: 15,
                  lineHeight: 1.6,
                  marginBottom: 28,
                  animation: role === 'in' ? 'heroTextUp 0.7s 0.65s ease-out both' : 'none',
                }}
              >
                {subtitle(banner)}
              </p>
            )}

            <Link
              href="#menu"
              style={{
                display: 'inline-block',
                padding: '11px 46px',
                backgroundColor: '#ffbe33',
                color: '#ffffff',
                borderRadius: 45,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15,
                transition: 'background-color 0.25s',
                animation: role === 'in' ? 'heroTextUp 0.7s 0.8s ease-out both' : 'none',
              }}
            >
              {t.order_now}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <section
        id="hero-slider"
        style={{
          width: '100%',
          position: 'relative',
          height: SLIDE_HEIGHT,
          minHeight: SLIDE_MIN_H,
          overflow: 'hidden',
        }}
      >
        {/* Outgoing slide fades out beneath the incoming one */}
        {fading && outgoing !== null && renderSlide(outgoing, 'out')}

        {/* Current slide: fades in when transitioning, steady otherwise.
            Uses key s-{current} which equals the incoming key, so React
            reuses the same DOM node after the fade ends — Ken Burns continues. */}
        {renderSlide(current, fading ? 'in' : 'steady')}
      </section>

      <style>{`
        @keyframes heroKenBurns {
          0%   { transform: scale(1)    translate(0,    0);   }
          100% { transform: scale(1.12) translate(-2%, -1%);  }
        }
        @keyframes heroCrossfadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heroCrossfadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes heroTextUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        @media (max-width: 992px) {
          .hero_area, #hero-slider {
            height: 400px !important;
            min-height: 400px !important;
          }
          #hero-slider .container { padding-top: 65px !important; }
          #hero-slider h1 { font-size: clamp(1.6rem, 5vw, 2.4rem) !important; }
        }
        @media (max-width: 480px) {
          .hero_area, #hero-slider {
            height: 380px !important;
            min-height: 380px !important;
          }
        }
      `}</style>
    </>
  );
}

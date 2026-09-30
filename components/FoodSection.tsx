'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Noto_Sans_Georgian, Dancing_Script } from 'next/font/google';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import { CATEGORY_VALUES, categoryLabel } from '../lib/categories';

const notoGeorgian = Noto_Sans_Georgian({ subsets: ['georgian', 'latin'], weight: ['400', '500', '600', '700', '800'] });
const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['700'] });

const PAGE_SIZE = 8;

interface MenuItem {
  id: number;
  name: string;
  description: string;
  name_en: string | null;
  description_en: string | null;
  price: number;
  category: string;
  image_url: string | null;
  discount_percent: number;
}

type SortKey = 'pop' | 'asc' | 'desc';

const finalPrice = (item: MenuItem) =>
  item.discount_percent > 0 ? +(item.price * (1 - item.discount_percent / 100)).toFixed(2) : item.price;

const fmt = (n: number) => '₾' + n.toFixed(2);

export default function FoodSection() {
  const { addToCart, cart, increaseQuantity, decreaseQuantity, removeFromCart, language } = useCart();
  const ka = language === 'ka';

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const [cat,      setCatRaw]      = useState('all');
  const [query,    setQueryRaw]    = useState('');
  const [maxPrice, setMaxPrice]    = useState(0);   // highest price in data (slider ceiling)
  const [priceCap, setPriceCapRaw] = useState(0);   // current slider value
  const [sort,     setSortRaw]     = useState<SortKey>('pop');
  const [visible,  setVisible]     = useState(PAGE_SIZE);
  const [ddOpen,   setDdOpen]      = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  // Any filter change restarts "show more" from the first page
  const setCat      = (v: string)  => { setCatRaw(v);      setVisible(PAGE_SIZE); };
  const setQuery    = (v: string)  => { setQueryRaw(v);    setVisible(PAGE_SIZE); };
  const setPriceCap = (v: number)  => { setPriceCapRaw(v); setVisible(PAGE_SIZE); };
  const setSort     = (v: SortKey) => { setSortRaw(v);     setVisible(PAGE_SIZE); };

  /* ── Data fetch ─────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_visible', true)
        .order('id', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        const items = (data ?? []) as MenuItem[];
        setMenuItems(items);
        const ceil = items.length ? Math.ceil(Math.max(...items.map(finalPrice))) : 0;
        setMaxPrice(ceil);
        setPriceCapRaw(ceil);
      }
      setLoading(false);
    })();
  }, []);

  /* ── Close dropdown on outside click / Escape ───────────── */
  useEffect(() => {
    if (!ddOpen) return;
    const onDown = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDdOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ddOpen]);

  /* ── Derived ─────────────────────────────────────────────── */
  const nameOf = (i: MenuItem) => (!ka && i.name_en ? i.name_en : i.name);
  const descOf = (i: MenuItem) => (!ka && i.description_en ? i.description_en : i.description);

  // Items matching search + price (category counts are computed from this)
  const base = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menuItems.filter(i =>
      finalPrice(i) <= priceCap &&
      (!q || [i.name, i.name_en, i.description, i.description_en].some(s => s?.toLowerCase().includes(q)))
    );
  }, [menuItems, query, priceCap]);

  const filtered = useMemo(() => {
    const list = base.filter(i => cat === 'all' || i.category === cat);
    if (sort === 'asc')  return [...list].sort((a, b) => finalPrice(a) - finalPrice(b));
    if (sort === 'desc') return [...list].sort((a, b) => finalPrice(b) - finalPrice(a));
    return list;
  }, [base, cat, sort]);

  const cats = useMemo(() => [
    { value: 'all', label: ka ? 'ყველა' : 'All', count: base.length },
    ...CATEGORY_VALUES
      .filter(c => menuItems.some(i => i.category === c))
      .map(c => ({ value: c as string, label: categoryLabel(c, language), count: base.filter(i => i.category === c).length })),
  ], [menuItems, base, ka, language]);

  const activeCat = cats.find(c => c.value === cat) ?? cats[0];
  const shown = filtered.slice(0, visible);

  const qtyOf = (id: number) => cart.find(c => c.id === id)?.quantity ?? 0;

  const add = (item: MenuItem) =>
    addToCart({ id: item.id, title_en: item.name_en || item.name, title_ka: item.name, price: finalPrice(item), image: item.image_url });
  const dec = (id: number) => (qtyOf(id) > 1 ? decreaseQuantity(id) : removeFromCart(id));

  const reset = () => { setCat('all'); setQuery(''); setPriceCap(maxPrice); setSort('pop'); };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <section className={`fs ${notoGeorgian.className}`}>
      <style>{`
        .fs { background:#F5F5F5; color:#23272F; padding:88px 0 96px; }
        .fs button, .fs input, .fs select { font-family:inherit; }
        .fs-wrap { max-width:1280px; margin:0 auto; padding:0 72px; }
        .fs-head { display:flex; flex-direction:column; align-items:center; gap:4px; margin-bottom:40px; text-align:center; }
        .fs-kicker { font-size:30px; font-weight:700; color:#C98A00; line-height:1.2; }
        .fs-title { margin:0; font-size:48px; font-weight:800; letter-spacing:-0.01em; color:#23272F; }
        .fs-sub { margin:6px 0 0; color:#6B6F76; font-size:16px; }

        .fs-bar { background:#fff; border-radius:22px; box-shadow:0 1px 2px rgba(35,39,47,.05),0 10px 30px rgba(35,39,47,.06); padding:10px; margin-bottom:28px; }
        .fs-row1 { display:flex; align-items:center; gap:12px; padding:4px; }
        .fs-dd { position:relative; flex:none; }
        .fs-dd-btn { display:flex; align-items:center; gap:10px; height:44px; min-width:280px; padding:0 14px 0 18px; border-radius:999px; border:1px solid #E3E3E3; background:#fff; color:#23272F; font-size:15px; font-weight:600; cursor:pointer; }
        .fs-dd-btn.open { border-color:#FFBE33; }
        .fs-dd-btn svg { transition:transform .2s; flex:none; }
        .fs-dd-btn.open svg { transform:rotate(180deg); }
        .fs-dd-lbl { font-size:13px; font-weight:500; color:#6B6F76; }
        .fs-dd-val { flex:1; text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .fs-pill-count { font-size:12px; font-weight:700; padding:2px 8px; border-radius:999px; background:#FFF1CC; }
        .fs-dd-menu { position:absolute; top:52px; left:0; width:320px; max-height:420px; overflow-y:auto; background:#fff; border-radius:18px; box-shadow:0 20px 50px rgba(35,39,47,.16),0 0 0 1px rgba(35,39,47,.05); padding:8px; z-index:20; display:flex; flex-direction:column; gap:2px; }
        .fs-dd-opt { display:flex; align-items:center; gap:12px; min-height:46px; padding:0 14px; border:0; border-radius:12px; background:transparent; color:#23272F; font-size:15px; font-weight:600; cursor:pointer; text-align:left; }
        .fs-dd-opt:hover { background:#F5F5F5; }
        .fs-dd-opt.active { background:#FFF7E0; }
        .fs-radio { width:18px; height:18px; border-radius:50%; border:2px solid #D5D5D5; display:grid; place-items:center; box-sizing:border-box; flex:none; }
        .fs-radio span { width:8px; height:8px; border-radius:50%; background:transparent; }
        .fs-dd-opt.active .fs-radio { border-color:#FFBE33; }
        .fs-dd-opt.active .fs-radio span { background:#FFBE33; }
        .fs-dd-opt .fs-n { font-size:13px; color:#8A8E95; }

        .fs-search { display:flex; align-items:center; gap:10px; height:44px; width:320px; flex:none; margin:0 0 0 auto; padding:0 16px; border-radius:999px; background:#F5F5F5; color:#23272F; }
        .fs-search input { border:0; outline:0; background:transparent; font-size:15px; flex:1; min-width:0; color:#23272F; }
        .fs-search input::placeholder { color:inherit; opacity:.55; }
        .fs-divider { height:1px; background:#EEEEEE; margin:8px 8px 4px; }
        .fs-row2 { display:flex; align-items:center; flex-wrap:wrap; gap:16px 32px; padding:8px 12px; }
        .fs-muted { font-size:13px; color:#6B6F76; }
        .fs-price { display:flex; align-items:center; gap:12px; }
        .fs-price input { width:200px; accent-color:#FFBE33; }
        .fs-price b { font-size:15px; min-width:44px; }
        .fs-sort { display:flex; align-items:center; gap:8px; margin:0 0 0 auto; }
        .fs-sort select { height:36px; padding:0 10px; border-radius:10px; border:1px solid #E3E3E3; background:#fff; font-size:14px; font-weight:600; color:#23272F; cursor:pointer; }

        .fs-meta { display:flex; justify-content:space-between; margin:0 6px 16px; font-size:14px; color:#6B6F76; }
        .fs-meta b { color:#23272F; }
        .fs-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:24px; }
        .fs-card { background:#fff; border-radius:20px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 1px 2px rgba(35,39,47,.05),0 8px 24px rgba(35,39,47,.05); transition:transform .25s, box-shadow .25s; }
        .fs-card:hover { transform:translateY(-4px); box-shadow:0 1px 2px rgba(35,39,47,.05),0 16px 36px rgba(35,39,47,.10); }
        .fs-img { position:relative; aspect-ratio:1/0.85; overflow:hidden; background:#EEE; }
        .fs-img img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .4s ease; }
        .fs-card:hover .fs-img img { transform:scale(1.05); }
        .fs-noimg { width:100%; height:100%; display:grid; place-items:center; background:repeating-linear-gradient(135deg,#EFEDE8 0 12px,#E7E4DE 12px 24px); color:#8A8E95; font:500 12px ui-monospace,Menlo,monospace; }
        .fs-tags { position:absolute; top:12px; left:12px; display:flex; gap:6px; flex-wrap:wrap; }
        .fs-tag { background:rgba(255,255,255,.94); color:#23272F; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:999px; }
        .fs-tag.sale { background:#E53935; color:#fff; }
        .fs-body { padding:18px 20px 20px; display:flex; flex-direction:column; gap:6px; flex:1; }
        .fs-body h3 { margin:0; font-size:17px; font-weight:700; line-height:1.35; color:#23272F; text-wrap:pretty; }
        .fs-body p { margin:0; font-size:13.5px; line-height:1.55; color:#6B6F76; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .fs-foot { margin-top:auto; padding-top:12px; display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .fs-cost { display:flex; flex-direction:column; line-height:1.1; }
        .fs-cost strong { font-size:20px; font-weight:800; color:#E53935; }
        .fs-cost s { font-size:13px; color:#A0A3A8; }
        .fs-add { height:44px; padding:0 16px 0 12px; border-radius:999px; border:0; background:#FFBE33; color:#23272F; font-size:14px; font-weight:700; display:flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap; transition:background .15s; }
        .fs-add:hover { background:#F5AE12; }
        .fs-step { display:flex; align-items:center; gap:2px; background:#23272F; border-radius:999px; padding:4px; height:44px; box-sizing:border-box; }
        .fs-step button { width:36px; height:36px; border-radius:50%; border:0; background:transparent; color:#fff; cursor:pointer; display:grid; place-items:center; }
        .fs-step button.plus { background:#FFBE33; color:#23272F; }
        .fs-step span { color:#fff; font-weight:700; min-width:18px; text-align:center; }

        .fs-empty { background:#fff; border-radius:20px; padding:64px 24px; display:flex; flex-direction:column; align-items:center; gap:12px; text-align:center; }
        .fs-empty strong { font-size:20px; }
        .fs-btn-y { margin-top:8px; height:44px; padding:0 22px; border-radius:999px; border:0; background:#FFBE33; color:#23272F; font-weight:700; cursor:pointer; }
        .fs-more { display:flex; flex-direction:column; align-items:center; gap:14px; margin-top:44px; }
        .fs-progress { width:220px; height:4px; border-radius:4px; background:#E3E3E3; overflow:hidden; }
        .fs-progress div { height:100%; background:#FFBE33; transition:width .3s; }
        .fs-more button { height:48px; padding:0 28px; border-radius:999px; border:1.5px solid #23272F; background:transparent; color:#23272F; font-size:15px; font-weight:700; cursor:pointer; transition:all .15s; }
        .fs-more button:hover { background:#23272F; color:#fff; }
        .fs-status { text-align:center; padding:60px 0; color:#6B6F76; font-size:16px; }
        .fs-error { text-align:center; padding:20px; color:#991b1b; background:#fee2e2; border-radius:12px; margin-bottom:16px; font-size:14px; }

        @media (max-width:1199px) {
          .fs-wrap { padding:0 32px; }
          .fs-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
        }
        @media (max-width:899px) {
          .fs { padding:64px 0 72px; }
          .fs-title { font-size:38px; }
          .fs-row1 { flex-wrap:wrap; }
          .fs-dd, .fs-dd-btn, .fs-search { width:100%; min-width:0; margin:0; }
          .fs-dd-menu { width:100%; }
          .fs-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
          .fs-sort { margin:0; }
        }
        @media (max-width:559px) {
          .fs-wrap { padding:0 16px; }
          .fs-title { font-size:32px; }
          .fs-price { width:100%; }
          .fs-price input { flex:1; width:auto; }
          .fs-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="fs-wrap">
        {/* Heading */}
        <div className="fs-head">
          <span className={`fs-kicker ${dancingScript.className}`}>Fresh &amp; seasonal</span>
          <h2 className="fs-title">{ka ? 'ჩვენი მენიუ' : 'Our Menu'}</h2>
          <p className="fs-sub">
            {ka ? 'აირჩიე კატეგორია, ფასი ან მოძებნე სასურველი კერძი' : 'Pick a category, set a price or search for your favourite dish'}
          </p>
        </div>

        {/* Filter bar */}
        <div className="fs-bar">
          <div className="fs-row1">
            <div className="fs-dd" ref={ddRef}>
              <button
                className={`fs-dd-btn${ddOpen ? ' open' : ''}`}
                onClick={() => setDdOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={ddOpen}
              >
                <span className="fs-dd-lbl">{ka ? 'კატეგორია' : 'Category'}</span>
                <span className="fs-dd-val">{activeCat.label}</span>
                <span className="fs-pill-count">{activeCat.count}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              {ddOpen && (
                <div className="fs-dd-menu" role="listbox">
                  {cats.map(c => (
                    <button
                      key={c.value}
                      role="option"
                      aria-selected={c.value === cat}
                      className={`fs-dd-opt${c.value === cat ? ' active' : ''}`}
                      onClick={() => { setCat(c.value); setDdOpen(false); }}
                    >
                      <span className="fs-radio"><span /></span>
                      <span style={{ flex: 1 }}>{c.label}</span>
                      <span className="fs-n">{c.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className="fs-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input
                placeholder={ka ? 'მოძებნე კერძი…' : 'Search dishes…'}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </label>
          </div>

          <div className="fs-divider" />

          <div className="fs-row2">
            <div className="fs-price">
              <span className="fs-muted">{ka ? 'მაქს. ფასი' : 'Max price'}</span>
              <input type="range" min={0} max={maxPrice} step={1} value={priceCap} onChange={e => setPriceCap(+e.target.value)} />
              <b>₾{priceCap}</b>
            </div>
            <label className="fs-sort fs-muted">
              {ka ? 'დალაგება' : 'Sort'}
              <select value={sort} onChange={e => setSort(e.target.value as SortKey)}>
                <option value="pop">{ka ? 'პოპულარული' : 'Popular'}</option>
                <option value="asc">{ka ? 'ფასი: ზრდადი' : 'Price: low → high'}</option>
                <option value="desc">{ka ? 'ფასი: კლებადი' : 'Price: high → low'}</option>
              </select>
            </label>
          </div>
        </div>

        {error && <div className="fs-error">{error}</div>}

        {loading ? (
          <div className="fs-status">{ka ? 'მენიუ იტვირთება…' : 'Loading menu…'}</div>
        ) : !error && (
          <>
            <div className="fs-meta">
              <span>{ka ? <>ნაჩვენებია <b>{filtered.length}</b> კერძი</> : <>Showing <b>{filtered.length}</b> dishes</>}</span>
              <span>{activeCat.label}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="fs-empty">
                <strong>{ka ? 'ამ ფილტრით კერძი ვერ მოიძებნა' : 'No dishes match this filter'}</strong>
                <span className="fs-muted" style={{ fontSize: 14 }}>
                  {ka ? 'სცადე სხვა კატეგორია ან გაზარდე ფასის ზღვარი' : 'Try another category or raise the price limit'}
                </span>
                <button className="fs-btn-y" onClick={reset}>{ka ? 'ფილტრის გასუფთავება' : 'Clear filters'}</button>
              </div>
            ) : (
              <div className="fs-grid">
                {shown.map(item => {
                  const name = nameOf(item);
                  const qty = qtyOf(item.id);
                  return (
                    <article key={item.id} className="fs-card">
                      <div className="fs-img">
                        {item.image_url
                          // eslint-disable-next-line @next/next/no-img-element -- remote images from several hosts
                          ? <img src={item.image_url} alt={name} loading="lazy" />
                          : <div className="fs-noimg">{ka ? 'კერძის ფოტო' : 'Dish photo'}</div>}
                        <div className="fs-tags">
                          <span className="fs-tag">{categoryLabel(item.category, language)}</span>
                          {item.discount_percent > 0 && <span className="fs-tag sale">-{item.discount_percent}%</span>}
                        </div>
                      </div>
                      <div className="fs-body">
                        <h3>{name}</h3>
                        <p>{descOf(item)}</p>
                        <div className="fs-foot">
                          <span className="fs-cost">
                            <strong>{fmt(finalPrice(item))}</strong>
                            {item.discount_percent > 0 && <s>{fmt(item.price)}</s>}
                          </span>
                          {qty === 0 ? (
                            <button className="fs-add" onClick={() => add(item)}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                              {ka ? 'კალათაში' : 'Add'}
                            </button>
                          ) : (
                            <div className="fs-step">
                              <button onClick={() => dec(item.id)} aria-label={ka ? 'შემცირება' : 'Decrease'}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14" /></svg>
                              </button>
                              <span>{qty}</span>
                              <button className="plus" onClick={() => increaseQuantity(item.id)} aria-label={ka ? 'გაზრდა' : 'Increase'}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="fs-more">
                <span className="fs-muted">{ka ? 'ნაჩვენებია' : 'Showing'} {shown.length} / {filtered.length}</span>
                <div className="fs-progress"><div style={{ width: `${(shown.length / filtered.length) * 100}%` }} /></div>
                {shown.length < filtered.length && (
                  <button onClick={() => setVisible(v => v + PAGE_SIZE)}>{ka ? 'მეტის ჩვენება' : 'Show more'}</button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

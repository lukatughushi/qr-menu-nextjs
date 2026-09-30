"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { CATEGORY_VALUES, categoryMeta, type Category } from "../../lib/categories";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500";

type CategoryFilter = Category | "all";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image_url: string | null;
  created_at: string;
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

function MenuItemCard({ item }: { item: MenuItem }) {
  const [imgSrc, setImgSrc] = useState(item.image_url || FALLBACK_IMAGE);
  const [hovered, setHovered] = useState(false);
  const cat = categoryMeta(item.category);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.14)" : "0 1px 4px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ width: "100%", height: 180, overflow: "hidden", flexShrink: 0 }}>
        <img
          src={imgSrc}
          alt={item.name}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1f2937", margin: 0, flex: 1, lineHeight: 1.3 }}>
            {item.name}
          </h3>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#f97316", whiteSpace: "nowrap" }}>
            ₾{Number(item.price).toFixed(2)}
          </span>
        </div>

        <span style={{
          display: "inline-block",
          alignSelf: "flex-start",
          padding: "3px 10px",
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 600,
          backgroundColor: cat.bg,
          color: cat.color,
          marginBottom: 12,
        }}>
          {cat.emoji} {cat.en}
        </span>

        <p style={{ fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.6, flex: 1 }}>
          {item.description || "No description available."}
        </p>
      </div>

      {/* Hover accent */}
      <div style={{
        height: 3,
        backgroundColor: "#f97316",
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 0.25s ease",
      }} />
    </div>
  );
}

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  async function fetchMenuItems() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_visible", true)
      .order("category", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setMenuItems(data ?? []);
    }
    setLoading(false);
  }

  const availableCategories = CATEGORY_VALUES.filter((cat) => menuItems.some((item) => item.category === cat));

  const filtered: MenuItem[] =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const filterBtn = (value: CategoryFilter, label: string): React.CSSProperties => {
    const active = selectedCategory === value;
    return {
      padding: "10px 20px",
      borderRadius: 9999,
      border: active ? "none" : "1px solid #e5e7eb",
      backgroundColor: active ? "#f97316" : "white",
      color: active ? "white" : "#374151",
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer",
      fontFamily: FONT,
      boxShadow: active ? "0 2px 8px rgba(249,115,22,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
    };
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa", fontFamily: FONT }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        color: "white",
        padding: "80px 24px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 56, margin: "0 0 8px" }}>🎃</p>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 12px", letterSpacing: 1 }}>
          Pumpkins Cafe
        </h1>
        <p style={{ fontSize: 18, color: "#94a3b8", margin: "0 0 36px" }}>
          Seasonal flavours, warm atmosphere
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#menu" style={{
            padding: "12px 28px",
            backgroundColor: "#f97316",
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 8,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(249,115,22,0.35)",
          }}>
            View Menu
          </a>
          <a href="/reservations" style={{
            padding: "12px 28px",
            backgroundColor: "transparent",
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 8,
            textDecoration: "none",
            border: "2px solid rgba(255,255,255,0.3)",
          }}>
            Reserve a Table
          </a>
        </div>
      </div>

      {/* Menu section */}
      <div id="menu" style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px" }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#1f2937", margin: "0 0 8px" }}>
            Our Menu
          </h2>
          <p style={{ fontSize: 15, color: "#6b7280", margin: 0 }}>
            Fresh ingredients, crafted with care
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 24,
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* Category filter tabs */}
        {!loading && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 36 }}>
            <button onClick={() => setSelectedCategory("all")} style={filterBtn("all", "All")}>
              🍴 All
            </button>
            {availableCategories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={filterBtn(cat, cat)}>
                {categoryMeta(cat).emoji} {categoryMeta(cat).en}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#6b7280", fontSize: 16 }}>
            Loading menu...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <p style={{ fontSize: 48, margin: 0 }}>🍽️</p>
            <p style={{ color: "#6b7280", fontSize: 16, marginTop: 16 }}>No items in this category.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {filtered.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: "#1e293b",
        color: "#94a3b8",
        padding: "32px 24px",
        textAlign: "center",
        fontSize: 14,
      }}>
        <p style={{ margin: "0 0 12px", fontWeight: 700, color: "white", fontSize: 16 }}>
          🎃 Pumpkins Cafe
        </p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <a href="#menu"         style={{ color: "#94a3b8", textDecoration: "none" }}>Menu</a>
          <a href="/reservations" style={{ color: "#94a3b8", textDecoration: "none" }}>Reservations</a>
          <a href="/admin"        style={{ color: "#94a3b8", textDecoration: "none" }}>Admin</a>
        </div>
        <p style={{ margin: 0, fontSize: 13 }}>© 2026 Pumpkins Cafe. All rights reserved.</p>
      </div>

    </div>
  );
}

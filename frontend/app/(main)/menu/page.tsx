"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { MenuCardGrid, type MenuItem } from "./components/MenuCard";
import { CATEGORIES as ALL_CATEGORIES, type Category } from "../../../lib/categories";

const CATEGORIES: { value: Category | "all"; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "🍴" },
  ...ALL_CATEGORIES.map(({ value, en, emoji }) => ({ value, label: en, emoji })),
];

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    setLoading(true);
    setError(null);
    console.log("Fetching menu items from Supabase...");

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_visible", true)
      .order("category", { ascending: true });

    console.log("Fetched data:", data);
    console.log("Fetch error:", error);

    if (error) {
      console.error("Supabase error:", error.message, error);
      setError(error.message);
    } else {
      console.log("Item count:", data?.length ?? 0);
      setItems(data ?? []);
    }
    setLoading(false);
  }

  const filtered = activeCategory === "all"
    ? items
    : items.filter((item) => item.category === activeCategory);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#fafafa",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#1e293b",
        color: "white",
        padding: "32px 24px",
        textAlign: "center",
      }}>
        <h1 style={{ fontSize: 32, fontWeight: "bold", margin: 0, letterSpacing: 1 }}>
          🎃 Pumpkins Cafe
        </h1>
        <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 8, marginBottom: 0 }}>
          Our Menu
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

        {/* Debug info — remove once working */}
        {!loading && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>
            {items.length} item(s) loaded · showing {filtered.length} · category: {activeCategory}
          </p>
        )}

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

        {/* Category filter pills */}
        <div style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 32,
          justifyContent: "center",
        }}>
          {CATEGORIES.map(({ value, label, emoji }) => {
            const active = activeCategory === value;
            return (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 9999,
                  border: active ? "none" : "1px solid #e5e7eb",
                  backgroundColor: active ? "#f97316" : "white",
                  color: active ? "white" : "#374151",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: active
                    ? "0 2px 8px rgba(249,115,22,0.3)"
                    : "0 1px 2px rgba(0,0,0,0.05)",
                  transition: "all 0.15s",
                }}
              >
                {emoji} {label}
              </button>
            );
          })}
        </div>

        {/* States */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#6b7280", fontSize: 16 }}>
            Loading menu...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <p style={{ fontSize: 48, margin: 0 }}>🍽️</p>
            <p style={{ color: "#6b7280", fontSize: 16, marginTop: 16 }}>
              No items in this category.
            </p>
          </div>
        ) : (
          <MenuCardGrid items={filtered} />
        )}
      </div>
    </div>
  );
}

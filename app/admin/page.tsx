"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { categoryLabel, categoryMeta } from "../../lib/categories";

interface RecentItem {
  id: string;
  name: string;
  price: number;
  category: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [menuCount, setMenuCount] = useState<number | null>(null);
  const [reservationCount, setReservationCount] = useState<number | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    setError(null);

    const [menuCountResult, reservationCountResult, recentResult] = await Promise.all([
      supabase
        .from("menu_items")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("reservations")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("menu_items")
        .select("id, name, price, category, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    if (menuCountResult.error) {
      setError(menuCountResult.error.message);
    } else {
      setMenuCount(menuCountResult.count ?? 0);
    }

    if (reservationCountResult.error) {
      setError(reservationCountResult.error.message);
    } else {
      setReservationCount(reservationCountResult.count ?? 0);
    }

    if (recentResult.error) {
      setError(recentResult.error.message);
    } else {
      setRecentItems(recentResult.data ?? []);
    }

    setLoading(false);
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: 32,
  };

  const thStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  };

  const tdStyle: React.CSSProperties = {
    padding: "12px 16px",
    fontSize: 14,
    color: "#1f2937",
    borderBottom: "1px solid #f3f4f6",
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 32 }}>
        მთავარი
      </h1>

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
          დაფიქსირდა შეცდომა: {error}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24,
        marginBottom: 32,
      }}>
        <div style={cardStyle}>
          <p style={{ color: "#6b7280", fontSize: 14, fontWeight: 600, margin: 0 }}>
            მენიუს პოზიციები
          </p>
          <p style={{ fontSize: 48, fontWeight: "bold", color: "#f97316", marginTop: 16, marginBottom: 0 }}>
            {loading ? "—" : menuCount ?? 0}
          </p>
        </div>

        <div style={cardStyle}>
          <p style={{ color: "#6b7280", fontSize: 14, fontWeight: 600, margin: 0 }}>
            სულ ჯავშნები
          </p>
          <p style={{ fontSize: 48, fontWeight: "bold", color: "#1f2937", marginTop: 16, marginBottom: 0 }}>
            {loading ? "—" : reservationCount ?? 0}
          </p>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", margin: 0 }}>
            ბოლოს დამატებული
          </h2>
        </div>

        {loading ? (
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0, padding: "24px" }}>იტვირთება...</p>
        ) : recentItems.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: 14, margin: 0, padding: "24px" }}>პოზიციები არ არის.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
              <tr>
                <th style={thStyle}>სახელი</th>
                <th style={thStyle}>კატეგორია</th>
                <th style={thStyle}>ფასი</th>
                <th style={thStyle}>დამატებულია</th>
              </tr>
            </thead>
            <tbody>
              {recentItems.map((item) => {
                const meta = categoryMeta(item.category);
                const cat = { backgroundColor: meta.bg, color: meta.color };
                return (
                  <tr key={item.id}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{item.name}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: cat.backgroundColor,
                        color: cat.color,
                      }}>
                        {categoryLabel(item.category)}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>₾{Number(item.price).toFixed(2)}</td>
                    <td style={{ ...tdStyle, color: "#6b7280" }}>
                      {new Date(item.created_at).toLocaleDateString("ka-GE")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

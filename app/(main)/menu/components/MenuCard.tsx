"use client";

import { useState } from "react";
import { categoryMeta, type Category } from "../../../../lib/categories";

export type { Category };

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image_url: string;
  created_at: string;
}

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cat = categoryMeta(item.category);
  const placeholder = cat.emoji;
  const showPlaceholder = !item.image_url || imgError;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        boxShadow: hovered
          ? "0 12px 32px rgba(0,0,0,0.14)"
          : "0 1px 4px rgba(0,0,0,0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        cursor: "default",
      }}
    >
      {/* Image / Placeholder */}
      {showPlaceholder ? (
        <div
          style={{
            width: "100%",
            height: 180,
            backgroundColor: hovered ? "#e9ecf0" : "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            transition: "background-color 0.2s ease",
            flexShrink: 0,
          }}
        >
          {placeholder}
        </div>
      ) : (
        <div style={{ width: "100%", height: 180, overflow: "hidden", flexShrink: 0 }}>
          <img
            src={item.image_url}
            alt={item.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: hovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.3s ease",
            }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Name + Price */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 10,
        }}>
          <h3 style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#1f2937",
            margin: 0,
            flex: 1,
            lineHeight: 1.3,
          }}>
            {item.name}
          </h3>
          <span style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#f97316",
            whiteSpace: "nowrap",
            letterSpacing: "-0.3px",
          }}>
            ₾{Number(item.price).toFixed(2)}
          </span>
        </div>

        {/* Category badge */}
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
          letterSpacing: "0.2px",
        }}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </span>

        {/* Description */}
        <p style={{
          fontSize: 14,
          color: "#6b7280",
          margin: 0,
          lineHeight: 1.6,
          flex: 1,
        }}>
          {item.description || "No description available."}
        </p>
      </div>

      {/* Bottom accent on hover */}
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

interface MenuCardGridProps {
  items: MenuItem[];
}

export function MenuCardGrid({ items }: MenuCardGridProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 24,
    }}>
      {items.map((item) => (
        <MenuCard key={item.id} item={item} />
      ))}
    </div>
  );
}

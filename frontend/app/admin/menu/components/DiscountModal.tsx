"use client";

import { useState } from "react";

interface DiscountModalProps {
  itemName: string;
  currentPercent: number;
  onSave: (percent: number) => void;
  onClose: () => void;
}

export default function DiscountModal({
  itemName,
  currentPercent,
  onSave,
  onClose,
}: DiscountModalProps) {
  const [percent, setPercent] = useState(currentPercent.toString());
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const value = parseInt(percent, 10);
    if (isNaN(value) || value < 0 || value > 100) {
      setError("შეიყვანეთ მნიშვნელობა 0-დან 100-მდე");
      return;
    }
    onSave(value);
    onClose();
  };

  const parsed = parseInt(percent, 10);
  const hint =
    !isNaN(parsed) && parsed === 0
      ? "0%-ის მითითება ამ პოზიციას ამოიღებს სპეციალური შეთავაზებებიდან."
      : !isNaN(parsed) && parsed > 0
      ? `პოზიცია გამოჩნდება სპეციალურ შეთავაზებებში ${parsed}%-იანი ფასდაკლებით.`
      : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
          width: "100%",
          maxWidth: 400,
          margin: "0 16px",
          padding: 32,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: "bold", color: "#1f2937", marginBottom: 6 }}>
          ფასდაკლების დაყენება
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>{itemName}</p>

        <label
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 8,
          }}
        >
          ფასდაკლება (0–100)
        </label>

        <div style={{ position: "relative", marginBottom: 6 }}>
          <input
            type="number"
            min={0}
            max={100}
            value={percent}
            onChange={(e) => { setPercent(e.target.value); setError(null); }}
            style={{
              width: "100%",
              padding: "10px 36px 10px 12px",
              border: `1px solid ${error ? "#ef4444" : "#e5e7eb"}`,
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              color: "#1f2937",
              boxSizing: "border-box",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 16,
              fontWeight: 600,
              color: "#9ca3af",
              pointerEvents: "none",
            }}
          >
            %
          </span>
        </div>

        {error && (
          <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 16 }}>{error}</p>
        )}
        {!error && hint && (
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 24 }}>{hint}</p>
        )}
        {!error && !hint && <div style={{ marginBottom: 24 }} />}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              color: "#374151",
              fontWeight: 600,
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            გაუქმება
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 20px",
              backgroundColor: "#f97316",
              color: "white",
              fontWeight: 600,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            შენახვა
          </button>
        </div>
      </div>
    </div>
  );
}

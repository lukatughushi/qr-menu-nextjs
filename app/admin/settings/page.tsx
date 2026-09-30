"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [general, setGeneral] = useState({
    name: "🎃 Pumpkins",
    email: "info@pumpkins.com",
    phone: "+1 555-0100",
    address: "123 Harvest Lane, Autumn City, AC 10001",
    description: "A cozy restaurant specializing in seasonal pumpkin dishes.",
  });

  const [hours, setHours] = useState({
    mondayFriday: "11:00 – 22:00",
    saturday: "10:00 – 23:00",
    sunday: "10:00 – 21:00",
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    newReservations: true,
    lowStock: false,
    dailyReport: true,
  });

  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    color: "#1f2937",
    boxSizing: "border-box",
    outline: "none",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    padding: 24,
    marginBottom: 24,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "1px solid #f3f4f6",
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 8 }}>
          პარამეტრები
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          მართეთ რესტორნის პარამეტრები და პრეფერენციები
        </p>
      </div>

      {/* General Info */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>ზოგადი ინფორმაცია</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>რესტორნის სახელი</label>
            <input
              style={inputStyle}
              value={general.name}
              onChange={(e) => setGeneral({ ...general, name: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>ელ-ფოსტა</label>
            <input
              type="email"
              style={inputStyle}
              value={general.email}
              onChange={(e) => setGeneral({ ...general, email: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>ტელეფონი</label>
            <input
              type="tel"
              style={inputStyle}
              value={general.phone}
              onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>მისამართი</label>
            <input
              style={inputStyle}
              value={general.address}
              onChange={(e) => setGeneral({ ...general, address: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>აღწერა</label>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              value={general.description}
              onChange={(e) => setGeneral({ ...general, description: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>სამუშაო საათები</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(
            [
              { key: "mondayFriday", label: "ორშ–პარ" },
              { key: "saturday",     label: "შაბათი"  },
              { key: "sunday",       label: "კვირა"   },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#374151", minWidth: 100 }}>
                {label}
              </span>
              <input
                style={{ ...inputStyle, maxWidth: 200 }}
                value={hours[key]}
                onChange={(e) => setHours({ ...hours, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>შეტყობინებები</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {(
            [
              { key: "newOrders",       label: "ახალი შეკვეთები"      },
              { key: "newReservations", label: "ახალი ჯავშნები"        },
              { key: "lowStock",        label: "მარაგი ამოიწურება"     },
              { key: "dailyReport",     label: "ყოველდღიური ანგარიში" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: "#374151" }}>{label}</span>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: notifications[key] ? "#f97316" : "#d1d5db",
                  position: "relative",
                  transition: "background-color 0.2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: notifications[key] ? 22 : 2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "white",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={save}
          style={{
            padding: "10px 32px",
            backgroundColor: "#f97316",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(249, 115, 22, 0.3)",
            fontFamily: "inherit",
          }}
        >
          ცვლილებების შენახვა
        </button>
        {saved && (
          <span style={{ fontSize: 14, color: "#15803d", fontWeight: 600 }}>
            ✓ წარმატებით შენახულია
          </span>
        )}
      </div>
    </div>
  );
}

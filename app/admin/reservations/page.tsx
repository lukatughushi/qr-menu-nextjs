"use client";

import { useState } from "react";

type ReservationStatus = "confirmed" | "pending" | "cancelled";

interface Reservation {
  id: string;
  customer: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes: string;
  status: ReservationStatus;
}

const SAMPLE_RESERVATIONS: Reservation[] = [
  { id: "RES-001", customer: "Alice Johnson", phone: "+1 555-0101", date: "2024-01-20", time: "19:00", guests: 4, notes: "Window table preferred", status: "confirmed" },
  { id: "RES-002", customer: "Bob Martinez", phone: "+1 555-0102", date: "2024-01-20", time: "20:00", guests: 2, notes: "Anniversary dinner", status: "confirmed" },
  { id: "RES-003", customer: "Carol White", phone: "+1 555-0103", date: "2024-01-21", time: "18:30", guests: 6, notes: "", status: "pending" },
  { id: "RES-004", customer: "Dan Brown", phone: "+1 555-0104", date: "2024-01-21", time: "19:30", guests: 3, notes: "Allergic to nuts", status: "pending" },
  { id: "RES-005", customer: "Eva Green", phone: "+1 555-0105", date: "2024-01-19", time: "20:30", guests: 2, notes: "", status: "cancelled" },
];

const STATUS_STYLES: Record<ReservationStatus, { backgroundColor: string; color: string; label: string }> = {
  confirmed: { backgroundColor: "#dcfce7", color: "#15803d", label: "დადასტურებული" },
  pending:   { backgroundColor: "#fef3c7", color: "#92400e", label: "მოლოდინში" },
  cancelled: { backgroundColor: "#fee2e2", color: "#991b1b", label: "გაუქმებული" },
};

const FILTER_LABELS: Record<ReservationStatus | "all", string> = {
  all:       "სულ",
  confirmed: "დადასტურებული",
  pending:   "მოლოდინში",
  cancelled: "გაუქმებული",
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(SAMPLE_RESERVATIONS);
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");

  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  const confirm = (id: string) =>
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: "confirmed" } : r)));

  const cancel = (id: string) =>
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)));

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
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 8 }}>
          ჯავშნები
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          მართეთ სუფრის ჯავშნები და სტუმრების დაჯავშნები
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {(["all", "confirmed", "pending", "cancelled"] as const).map((s) => {
          const count = s === "all" ? reservations.length : reservations.filter((r) => r.status === s).length;
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                backgroundColor: active ? "#f97316" : "white",
                color: active ? "white" : "#1f2937",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "16px 20px",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, margin: 0, opacity: 0.75 }}>
                {FILTER_LABELS[s]}
              </p>
              <p style={{ fontSize: 32, fontWeight: "bold", margin: 0, marginTop: 8 }}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "white", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>კლიენტი</th>
              <th style={thStyle}>ტელ.</th>
              <th style={thStyle}>თარიღი</th>
              <th style={thStyle}>დრო</th>
              <th style={thStyle}>სტუმრები</th>
              <th style={thStyle}>შენიშვნა</th>
              <th style={thStyle}>სტატუსი</th>
              <th style={{ ...thStyle, textAlign: "center" }}>მოქმედება</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af" }}>
                  ჯავშნები არ მოიძებნა.
                </td>
              </tr>
            ) : (
              filtered.map((res) => {
                const st = STATUS_STYLES[res.status];
                return (
                  <tr key={res.id}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#f97316" }}>{res.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{res.customer}</td>
                    <td style={{ ...tdStyle, color: "#6b7280" }}>{res.phone}</td>
                    <td style={tdStyle}>{res.date}</td>
                    <td style={tdStyle}>{res.time}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{res.guests}</td>
                    <td style={{ ...tdStyle, color: "#6b7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {res.notes || "—"}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: st.backgroundColor,
                        color: st.color,
                      }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {res.status === "pending" && (
                        <button
                          onClick={() => confirm(res.id)}
                          style={{
                            color: "#15803d", fontWeight: 600,
                            border: "none", backgroundColor: "transparent",
                            cursor: "pointer", fontSize: 13,
                            marginRight: 8, fontFamily: "inherit",
                          }}
                        >
                          დადასტურება
                        </button>
                      )}
                      {res.status !== "cancelled" && (
                        <button
                          onClick={() => cancel(res.id)}
                          style={{
                            color: "#dc2626", fontWeight: 600,
                            border: "none", backgroundColor: "transparent",
                            cursor: "pointer", fontSize: 13,
                            fontFamily: "inherit",
                          }}
                        >
                          გაუქმება
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

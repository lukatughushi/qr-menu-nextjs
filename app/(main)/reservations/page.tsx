"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface FormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  message: string;
}

interface Confirmation {
  name: string;
  email: string;
  date: string;
  time: string;
  guests: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  phone: "",
  date: "",
  time: "",
  guests: "",
  message: "",
};

const TIME_SLOTS = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30",
];

export default function ReservationsPage() {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "Enter a valid email address";
    }
    if (!formData.date) e.date = "Date is required";
    if (!formData.time) e.time = "Time is required";
    if (!formData.guests) {
      e.guests = "Number of guests is required";
    } else if (Number(formData.guests) < 1 || Number(formData.guests) > 20) {
      e.guests = "Guests must be between 1 and 20";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name as keyof FormData]; return n; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);

    const { error } = await supabase.from("reservations").insert({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      date: formData.date,
      time: formData.time,
      guests: Number(formData.guests),
      message: formData.message.trim() || null,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setConfirmation({
      name: formData.name.trim(),
      email: formData.email.trim(),
      date: formData.date,
      time: formData.time,
      guests: formData.guests,
    });
    setFormData(EMPTY_FORM);
    setErrors({});
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "11px 14px",
    border: `1px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
    borderRadius: 8,
    fontSize: 15,
    fontFamily: "inherit",
    color: "#1f2937",
    backgroundColor: "white",
    boxSizing: "border-box",
    outline: "none",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  };

  const errorMsg = (msg?: string) =>
    msg ? <p style={{ color: "#ef4444", fontSize: 12, margin: "4px 0 0" }}>{msg}</p> : null;

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

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
          Table Reservations
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>

        {/* Success confirmation */}
        {confirmation ? (
          <div style={{
            backgroundColor: "white",
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            padding: 40,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#1f2937", marginTop: 0, marginBottom: 8 }}>
              Reservation Confirmed!
            </h2>
            <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 32 }}>
              We've received your reservation and will be in touch shortly.
            </p>

            <div style={{
              backgroundColor: "#f9fafb",
              borderRadius: 8,
              padding: 24,
              textAlign: "left",
              marginBottom: 32,
            }}>
              {[
                { label: "Name",   value: confirmation.name },
                { label: "Email",  value: confirmation.email },
                { label: "Date",   value: formatDate(confirmation.date) },
                { label: "Time",   value: formatTime(confirmation.time) },
                { label: "Guests", value: `${confirmation.guests} ${Number(confirmation.guests) === 1 ? "guest" : "guests"}` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: 14,
                }}>
                  <span style={{ color: "#6b7280", fontWeight: 600 }}>{label}</span>
                  <span style={{ color: "#1f2937", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setConfirmation(null)}
              style={{
                padding: "12px 32px",
                backgroundColor: "#f97316",
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Make Another Reservation
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: "white",
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}>
            <div style={{
              backgroundColor: "#f97316",
              padding: "24px 32px",
            }}>
              <h2 style={{ fontSize: 22, fontWeight: "bold", color: "white", margin: 0 }}>
                Book a Table
              </h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4, marginBottom: 0 }}>
                Reserve your spot — we'll confirm within 24 hours
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ padding: 32 }}>

              {/* Server error */}
              {serverError && (
                <div style={{
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fca5a5",
                  color: "#991b1b",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 24,
                  fontSize: 14,
                }}>
                  {serverError}
                </div>
              )}

              {/* Name + Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    style={inputStyle(!!errors.name)}
                    disabled={submitting}
                  />
                  {errorMsg(errors.name)}
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    style={inputStyle(!!errors.email)}
                    disabled={submitting}
                  />
                  {errorMsg(errors.email)}
                </div>
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Phone <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 555-0100"
                  style={inputStyle()}
                  disabled={submitting}
                />
              </div>

              {/* Date + Time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={today}
                    style={inputStyle(!!errors.date)}
                    disabled={submitting}
                  />
                  {errorMsg(errors.date)}
                </div>
                <div>
                  <label style={labelStyle}>Time *</label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    style={inputStyle(!!errors.time)}
                    disabled={submitting}
                  >
                    <option value="">Select a time</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{formatTime(t)}</option>
                    ))}
                  </select>
                  {errorMsg(errors.time)}
                </div>
              </div>

              {/* Guests */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Number of Guests *</label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  style={inputStyle(!!errors.guests)}
                  disabled={submitting}
                >
                  <option value="">Select guests</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                  ))}
                </select>
                {errorMsg(errors.guests)}
              </div>

              {/* Message */}
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Special Requests <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Allergies, special occasions, seating preferences..."
                  rows={3}
                  style={{ ...inputStyle(), resize: "vertical" }}
                  disabled={submitting}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: submitting ? "#fdba74" : "#f97316",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "none",
                  borderRadius: 8,
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
                }}
              >
                {submitting ? "Submitting..." : "Reserve My Table"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

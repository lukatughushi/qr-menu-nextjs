"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { apiFetch, setPermsCookie } from "../../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("ელ-ფოსტა ან პაროლი არასწორია.");
      setLoading(false);
    } else {
      // Set admin-perms cookie before redirecting so middleware can enforce permissions immediately
      if (data.session) {
        const meRes = await apiFetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        if (meRes.ok) setPermsCookie((await meRes.json()).permissions ?? {});
      }
      router.push("/admin");
    }
  }

  return (
    <div style={styles.root}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftInner}>
          <img
            src="/images/logo.png"
            alt="Pumpkins Cafe"
            style={styles.logo}
          />
          <h1 style={styles.brandName}>Pumpkins Cafe</h1>
          <p style={styles.brandSub}>ადმინისტრატორის პანელი</p>

          <div style={styles.divider} />

          <p style={styles.tagline}>
            მართეთ მენიუ, ჯავშნები და ბანერები<br />ერთ სივრცეში.
          </p>

          <div style={styles.decorDots}>
            {[...Array(3)].map((_, i) => (
              <span key={i} style={{ ...styles.dot, opacity: i === 0 ? 1 : 0.4 - i * 0.1 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconWrap}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <h2 style={styles.cardTitle}>შესვლა</h2>
            <p style={styles.cardSub}>შეიყვანეთ თქვენი სერთიფიკატები</p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>ელ-ფოსტა</label>
              <div style={styles.inputWrap}>
                <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  style={styles.input}
                  onFocus={(e) => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>პაროლი</label>
              <div style={styles.inputWrap}>
                <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7A5 5 0 0 1 17 7V11" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={styles.input}
                  onFocus={(e) => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"; }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={styles.spinner} />
                  შესვლა...
                </span>
              ) : "შესვლა"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Roboto', sans-serif",
    overflow: "hidden",
  },
  leftPanel: {
    width: "45%",
    background: "linear-gradient(160deg, #1e293b 0%, #0f172a 60%, #0c1220 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  leftInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "40px 48px",
    zIndex: 1,
    position: "relative",
  },
  logo: {
    width: 160,
    height: "auto",
    marginBottom: 24,
    filter: "drop-shadow(0 4px 16px rgba(249,115,22,0.3))",
  },
  brandName: {
    fontSize: 28,
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 13,
    color: "#f97316",
    marginTop: 6,
    marginBottom: 0,
    fontWeight: 500,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  divider: {
    width: 48,
    height: 2,
    background: "linear-gradient(90deg, #f97316, #ea580c)",
    borderRadius: 2,
    margin: "28px auto",
  },
  tagline: {
    fontSize: 15,
    color: "#94a3b8",
    lineHeight: 1.8,
    margin: 0,
  },
  decorDots: {
    display: "flex",
    gap: 8,
    marginTop: 40,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#f97316",
    display: "block",
  },
  rightPanel: {
    flex: 1,
    backgroundColor: "#f5f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    padding: "40px 40px 36px",
    width: "100%",
    maxWidth: 420,
  },
  cardHeader: {
    textAlign: "center",
    marginBottom: 32,
  },
  iconWrap: {
    width: 52,
    height: 52,
    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  cardSub: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 6,
    marginBottom: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    letterSpacing: 0.3,
  },
  inputWrap: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: "#f9fafb",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 500,
  },
  submitBtn: {
    width: "100%",
    padding: "13px 16px",
    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0.5,
    boxShadow: "0 4px 12px rgba(249,115,22,0.35)",
    transition: "background 0.15s, transform 0.1s",
    fontFamily: "inherit",
  },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};

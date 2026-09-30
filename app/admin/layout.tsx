"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { PermissionsProvider } from "../../lib/PermissionsContext";

const SIDEBAR_W = 210;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking,  setChecking]  = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !isLoginPage) {
        router.replace("/admin/login");
      } else {
        setUserEmail(session?.user?.email ?? null);
        setChecking(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isLoginPage) {
        router.replace("/admin/login");
      } else {
        setUserEmail(session?.user?.email ?? null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (checking) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f5f5f9", fontFamily: "'Roboto', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>იტვირთება...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="admin-panel" style={{ display: "flex", height: "100vh", backgroundColor: "#f5f5f9", fontFamily: "'Roboto', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <aside style={{
        width: SIDEBAR_W,
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        color: "white",
        padding: "24px 16px",
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        overflowY: "auto",
        zIndex: 1000,
        boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
        boxSizing: "border-box",
      }}>
        <Sidebar />
      </aside>

      <main style={{ flex: 1, marginLeft: SIDEBAR_W, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 28px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <ProfileMenu userEmail={userEmail} />
        </header>

        <div style={{ flex: 1, padding: 32, overflowY: "auto", backgroundColor: "#f5f5f9" }}>
          <PermissionsProvider>
            {children}
          </PermissionsProvider>
        </div>
      </main>
    </div>
  );
}

/* ─── Sidebar ──────────────────────────────────────────────────────────── */

function Sidebar() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: "center", paddingBottom: 20, borderBottom: "1px solid rgba(51,65,85,0.5)" }}>
        <a href="/admin" style={{ display: "inline-block", textDecoration: "none" }}>
          <img
            src="/images/logo.png"
            alt="Pumpkins Cafe"
            style={{ width: 110, height: "auto", display: "block", margin: "0 auto 8px" }}
          />
        </a>
        <p style={{ fontSize: 11, color: "#64748b", margin: 0, fontWeight: 500, letterSpacing: 0.5 }}>
          Pumpkins ადმინი
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <NavItem href="/admin"               label="მთავარი"       icon="📊" />
        <NavItem href="/admin/menu"          label="მენიუ"          icon="🍽️" />
        <NavItem href="/admin/banners"       label="ბანერები"       icon="🖼️" />
        <NavItem href="/admin/reservations"  label="ჯავშნები"       icon="📅" />
        <NavItem href="/admin/orders"        label="შეკვეთები"      icon="🧾" />
        <NavItem href="/admin/users"         label="მომხმარებლები"  icon="👥" />
        <NavItem href="/admin/settings/roles" label="როლები"        icon="🔐" />
        <NavItem href="/admin/settings"      label="პარამეტრები"    icon="⚙️" />
      </nav>
    </div>
  );
}

/* ─── Profile dropdown in header ──────────────────────────────────────── */

function ProfileMenu({ userEmail }: { userEmail: string | null }) {
  const router        = useRouter();
  const [open, setOpen]       = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "AD";

  return (
    <>
      <div ref={ref} style={{ position: "relative" }}>
        {/* Trigger */}
        <button
          onClick={() => setOpen((p) => !p)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: 10,
            transition: "background 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", margin: 0, lineHeight: 1.3 }}>
              {userEmail ?? "Admin"}
            </p>
            <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>ადმინისტრატორი</p>
          </div>
          <div style={{
            width: 38, height: 38,
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 13,
            boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
            flexShrink: 0,
          }}>
            {initials}
          </div>
          {/* Chevron */}
          <svg
            width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="#94a3b8" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 220,
            backgroundColor: "white",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
            border: "1px solid #f1f5f9",
            overflow: "hidden",
            zIndex: 9999,
            animation: "fadeDown 0.15s ease",
          }}>
            <style>{`
              @keyframes fadeDown {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/* User info header */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34,
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 12, flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userEmail ?? "Admin"}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, marginTop: 1 }}>ადმინისტრატორი</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: "6px 0" }}>
              <DropdownItem
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
                label="პაროლის შეცვლა"
                onClick={() => { setOpen(false); setPwModal(true); }}
              />
              <div style={{ height: 1, backgroundColor: "#f1f5f9", margin: "4px 0" }} />
              <DropdownItem
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                }
                label="გასვლა"
                danger
                onClick={handleLogout}
              />
            </div>
          </div>
        )}
      </div>

      {/* Change-password modal */}
      {pwModal && (
        <ChangePasswordModal onClose={() => setPwModal(false)} />
      )}
    </>
  );
}

function DropdownItem({
  icon, label, danger = false, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 16px",
        background: hovered ? (danger ? "#fff5f5" : "#f8fafc") : "transparent",
        border: "none",
        cursor: "pointer",
        color: danger ? "#dc2626" : "#374151",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "inherit",
        textAlign: "left",
        transition: "background 0.1s",
      }}
    >
      <span style={{ color: danger ? "#dc2626" : "#64748b", display: "flex", alignItems: "center" }}>{icon}</span>
      {label}
    </button>
  );
}

/* ─── Change Password modal ────────────────────────────────────────────── */

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [newPw,    setNewPw]    = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);
  const [show,     setShow]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPw.length < 8) { setError("პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს."); return; }
    if (newPw !== confirmPw) { setError("პაროლები არ ემთხვევა."); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(onClose, 1800);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 40px 10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: "#f9fafb",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, backdropFilter: "blur(2px)" }}>
      <div style={{ backgroundColor: "white", borderRadius: 16, width: 380, maxWidth: "94vw", boxShadow: "0 20px 48px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#f97316,#ea580c)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>პაროლის შეცვლა</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 20, lineHeight: 1, padding: 0 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#15803d", margin: 0 }}>პაროლი წარმატებით შეიცვალა!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: 0.3 }}>ახალი პაროლი</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={show ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="მინ. 8 სიმბოლო"
                    required
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                  />
                  <button type="button" onClick={() => setShow((p) => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 15, padding: 0 }}>
                    {show ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: 0.3 }}>გაიმეორეთ პაროლი</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={show ? "text" : "password"}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="გაიმეორეთ ახალი პაროლი"
                    required
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}>
                  ⚠ {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 8, backgroundColor: "white", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, padding: "10px 16px", border: "none", borderRadius: 8, background: loading ? "#94a3b8" : "linear-gradient(135deg,#f97316,#ea580c)", color: "white", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: loading ? "none" : "0 4px 10px rgba(249,115,22,0.3)" }}
                >
                  {loading ? "ინახება..." : "შენახვა"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Nav item ─────────────────────────────────────────────────────────── */

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 12px",
        borderRadius: 8,
        color: "#cbd5e1",
        textDecoration: "none",
        fontWeight: 500,
        fontSize: 13,
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLAnchorElement).style.color = "white";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        (e.currentTarget as HTMLAnchorElement).style.color = "#cbd5e1";
      }}
    >
      <span style={{ fontSize: 17, minWidth: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </span>
      <span>{label}</span>
    </a>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { ALL_PERMISSIONS, PERMISSION_LABELS } from "../../../../lib/permissions";
import type { PermissionKey, Permissions } from "../../../../lib/permissions";

interface Role {
  id: string;
  name: string;
  permissions: Permissions;
  created_at: string;
}

const S = {
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    overflow: "hidden",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 6,
    letterSpacing: 0.4,
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: "#f9fafb",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  } as React.CSSProperties,
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  // Form (shared for create + edit)
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formName, setFormName] = useState("");
  const [formPerms, setFormPerms] = useState<Permissions>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getFreshToken = useCallback(async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) return null;
    return data.session.access_token;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    const token = await getFreshToken();
    if (!token) { setPageError("სესია ამოიწურა."); setLoading(false); return; }

    const meRes = await fetch("/api/admin/me", { headers: { Authorization: `Bearer ${token}` } });
    if (!meRes.ok) { setPageError((await meRes.json()).error ?? "Session error."); setLoading(false); return; }
    const me = await meRes.json();
    setCanManage(me.permissions?.can_manage_roles === true);

    if (!me.permissions?.can_manage_roles) { setLoading(false); return; }

    const rolesRes = await fetch("/api/admin/roles", { headers: { Authorization: `Bearer ${token}` } });
    if (!rolesRes.ok) { setPageError((await rolesRes.json()).error ?? "Error loading roles."); setLoading(false); return; }
    setRoles((await rolesRes.json()).roles ?? []);
    setLoading(false);
  }, [getFreshToken]);

  useEffect(() => { load(); }, [load]);

  function startEdit(role: Role) {
    setEditingRole(role);
    setFormName(role.name);
    setFormPerms({ ...role.permissions });
    setFormError(null);
    setFormSuccess(null);
  }

  function resetForm() {
    setEditingRole(null);
    setFormName("");
    setFormPerms({});
    setFormError(null);
    setFormSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);
    const token = await getFreshToken();
    if (!token) { setFormError("სესია ამოიწურა."); setFormLoading(false); return; }

    const url    = editingRole ? `/api/admin/roles/${editingRole.id}` : "/api/admin/roles";
    const method = editingRole ? "PUT" : "POST";

    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: formName, permissions: formPerms }),
    });
    const json = await res.json();

    if (!res.ok) {
      setFormError(json.error ?? "შეცდომა.");
    } else {
      setFormSuccess(editingRole ? `✓ "${formName}" განახლდა.` : `✓ "${formName}" შეიქმნა.`);
      resetForm();
      await load();
    }
    setFormLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const token = await getFreshToken();
    if (!token) { setDeleteLoading(false); return; }

    const res  = await fetch(`/api/admin/roles/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) { setPageError(json.error ?? "წაშლა ვერ მოხერხდა."); }
    else         { await load(); }
    setDeleteTarget(null);
    setDeleteLoading(false);
  }

  function togglePerm(key: PermissionKey) {
    setFormPerms(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 320 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>იტვირთება...</p>
        </div>
      </div>
    );
  }

  // ── Access denied ─────────────────────────────────────────────────────────
  if (!canManage) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 420 }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>
            წვდომა შეზღუდულია
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.8 }}>
            ამ გვერდზე წვდომისთვის საჭიროა<br />
            <code style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>can_manage_roles</code> უფლება.
          </p>
          {pageError && (
            <div style={{ marginTop: 16, backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
              {pageError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Roboto', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            როლები და უფლებები
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, marginBottom: 0 }}>
            RBAC — მართეთ გუნდის წვდომის დონეები
          </p>
        </div>
        <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}>
          {roles.length} როლი
        </div>
      </div>

      {pageError && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 14 }}>
          ⚠ {pageError}
          <button onClick={() => setPageError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16 }}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* ── Roles list ─────────────────────────────────────────────────── */}
        <div style={S.card}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔐</span>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              არსებული როლები
            </h2>
          </div>

          {roles.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
                ჯერ არ გაქვთ შექმნილი როლები. დაამატეთ პირველი!
              </p>
            </div>
          ) : (
            roles.map((role, i) => {
              const trueKeys  = ALL_PERMISSIONS.filter(k => role.permissions[k] === true);
              const totalKeys = ALL_PERMISSIONS.length;
              return (
                <div
                  key={role.id}
                  style={{
                    padding: "20px 24px",
                    borderBottom: i < roles.length - 1 ? "1px solid #f1f5f9" : "none",
                    display: "flex", alignItems: "flex-start", gap: 16,
                  }}
                >
                  {/* Icon */}
                  <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,#1e293b,#334155)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    🔐
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + count */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{role.name}</span>
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 9999, fontWeight: 700,
                        backgroundColor: trueKeys.length === totalKeys ? "#fef3c7" : trueKeys.length === 0 ? "#f8fafc" : "#f0f9ff",
                        color:           trueKeys.length === totalKeys ? "#92400e"  : trueKeys.length === 0 ? "#94a3b8"  : "#0369a1",
                      }}>
                        {trueKeys.length}/{totalKeys} უფლება
                      </span>
                    </div>

                    {/* Permission chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {ALL_PERMISSIONS.map(k => {
                        const has = role.permissions[k] === true;
                        return (
                          <span key={k} style={{
                            padding: "3px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600,
                            backgroundColor: has ? "#f0fdf4" : "#f8fafc",
                            color:           has ? "#15803d" : "#94a3b8",
                            border: `1px solid ${has ? "#bbf7d0" : "#e2e8f0"}`,
                          }}>
                            {has ? "✓" : "—"} {PERMISSION_LABELS[k]}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => startEdit(role)}
                      style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: 8, backgroundColor: "white", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.color = "#f97316"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#374151"; }}
                    >
                      ✏ რედაქტირება
                    </button>
                    <button
                      onClick={() => setDeleteTarget(role)}
                      style={{ padding: "6px 14px", border: "1px solid #fecaca", borderRadius: 8, backgroundColor: "#fff5f5", color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fef2f2"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#fff5f5"; }}
                    >
                      🗑 წაშლა
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Create / Edit form ───────────────────────────────────────────── */}
        <div style={S.card}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg,#1e293b,#0f172a)", borderRadius: "12px 12px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#f97316,#ea580c)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {editingRole ? "✏" : "➕"}
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0 }}>
                    {editingRole ? "როლის რედაქტირება" : "ახალი როლი"}
                  </h2>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>
                    {editingRole ? editingRole.name : "სახელი + უფლებები"}
                  </p>
                </div>
              </div>
              {editingRole && (
                <button onClick={resetForm} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, padding: 4, lineHeight: 1 }}>
                  ✕
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={S.label}>როლის სახელი</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="მაგ: მენეჯერი"
                required
                style={S.input}
                onFocus={e => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ ...S.label, marginBottom: 10 }}>უფლებები</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ALL_PERMISSIONS.map(key => {
                  const checked = formPerms[key] === true;
                  return (
                    <label
                      key={key}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                        padding: "9px 12px", borderRadius: 8,
                        backgroundColor: checked ? "#fff7ed" : "#f8fafc",
                        border: `1px solid ${checked ? "#fed7aa" : "#e2e8f0"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <input type="checkbox" checked={checked} onChange={() => togglePerm(key)} style={{ display: "none" }} />
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: `2px solid ${checked ? "#f97316" : "#d1d5db"}`,
                        backgroundColor: checked ? "#f97316" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}>
                        {checked && <span style={{ color: "white", fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: checked ? 600 : 500, color: checked ? "#c2410c" : "#64748b" }}>
                        {PERMISSION_LABELS[key]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {formError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}>
                ⚠ {formError}
              </div>
            )}
            {formSuccess && (
              <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}>
                {formSuccess}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              {editingRole && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ flex: 1, padding: "11px 16px", border: "1px solid #e2e8f0", borderRadius: 8, backgroundColor: "white", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                >
                  გაუქმება
                </button>
              )}
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  flex: 1, padding: "11px 16px",
                  background: formLoading ? "#94a3b8" : "linear-gradient(135deg,#f97316,#ea580c)",
                  color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700,
                  cursor: formLoading ? "not-allowed" : "pointer",
                  boxShadow: formLoading ? "none" : "0 4px 10px rgba(249,115,22,0.3)",
                  fontFamily: "inherit",
                }}
              >
                {formLoading ? "..." : editingRole ? "✓ განახლება" : "➕ შექმნა"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(2px)" }}>
          <div style={{ backgroundColor: "white", borderRadius: 14, padding: 28, maxWidth: 380, width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>
                როლის წაშლა
              </h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                დარწმუნებული ხართ, რომ გსურთ<br />
                <strong style={{ color: "#1e293b" }}>"{deleteTarget.name}"</strong> წაშლა?
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                style={{ flex: 1, padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 8, backgroundColor: "white", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                გაუქმება
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{ flex: 1, padding: "10px 16px", border: "none", borderRadius: 8, background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "white", fontSize: 14, fontWeight: 700, cursor: deleteLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleteLoading ? 0.7 : 1 }}
              >
                {deleteLoading ? "იშლება..." : "წაშლა"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

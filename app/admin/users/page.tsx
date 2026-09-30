"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { Permissions } from "../../../lib/permissions";
import SearchFilterBar from "../components/SearchFilterBar";

interface DbRole {
  id: string;
  name: string;
  permissions: Permissions;
}

interface RoleOption {
  id: string;
  name: string;
}

interface AuthUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  app_metadata: { role?: string };
  dbRole?: DbRole | null;
}

export default function UsersPage() {
  const [users, setUsers]                   = useState<AuthUser[]>([]);
  const [roles, setRoles]                   = useState<RoleOption[]>([]);
  const [loading, setLoading]               = useState(true);
  const [pageError, setPageError]           = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin]     = useState(false);
  const [permissions, setPermissions]       = useState<Permissions>({});
  const [currentUserId, setCurrentUserId]   = useState<string | null>(null);

  // Form
  const [formEmail, setFormEmail]       = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleId, setFormRoleId]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError]       = useState<string | null>(null);
  const [formSuccess, setFormSuccess]   = useState<string | null>(null);
  const [formLoading, setFormLoading]   = useState(false);

  // Search & filter
  const [searchQuery,  setSearchQuery]  = useState("");
  const [filterRoleId, setFilterRoleId] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getFreshToken = useCallback(async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) return null;
    return data.session.access_token;
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setPageError(null);

    const token = await getFreshToken();
    if (!token) { setPageError("სესია ამოიწურა."); setLoading(false); return; }

    // Me — permissions + superadmin flag
    const meRes = await fetch("/api/admin/me", { headers: { Authorization: `Bearer ${token}` } });
    if (meRes.ok) {
      const me = await meRes.json();
      setIsSuperAdmin(me.isSuperAdmin ?? false);
      setPermissions(me.permissions ?? {});
      setCurrentUserId(me.userId ?? null);
    }

    // Users + roles in parallel
    const [usersRes, rolesRes] = await Promise.all([
      fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/admin/roles", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (!usersRes.ok) {
      setPageError((await usersRes.json()).error ?? "მომხმარებლების ჩატვირთვა ვერ მოხერხდა.");
      setLoading(false);
      return;
    }

    setUsers((await usersRes.json()).users ?? []);
    if (rolesRes.ok) setRoles((await rolesRes.json()).roles ?? []);
    setLoading(false);
  }, [getFreshToken]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    const token = await getFreshToken();
    if (!token) { setFormError("სესია ამოიწურა."); setFormLoading(false); return; }

    const res  = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: formEmail, password: formPassword, roleId: formRoleId || undefined }),
    });
    const json = await res.json();

    if (!res.ok) {
      setFormError(json.error ?? "შეცდომა.");
    } else {
      setFormSuccess(`✓ ${json.user?.email} წარმატებით დაემატა.`);
      setFormEmail("");
      setFormPassword("");
      setFormRoleId("");
      await loadAll();
    }
    setFormLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const token = await getFreshToken();
    if (!token) { setDeleteLoading(false); return; }

    const res  = await fetch(`/api/admin/users?id=${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) setPageError(json.error ?? "წაშლა ვერ მოხერხდა.");
    else await loadAll();
    setDeleteTarget(null);
    setDeleteLoading(false);
  }

  function fmt(iso?: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("ka-GE", { year: "numeric", month: "short", day: "numeric" });
  }

  const card: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    overflow: "hidden",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: "#f9fafb",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const canAddUsers = permissions.can_add_users === true;

  const visibleUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch = q.length < 3 || (u.email ?? "").toLowerCase().includes(q);
      const matchRole = !filterRoleId ||
        (filterRoleId === "__none__" ? !u.dbRole : u.dbRole?.id === filterRoleId);
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, filterRoleId]);

  const roleFilterOptions = useMemo(() => [
    { value: "__none__", label: "— როლის გარეშე" },
    ...roles.map((r) => ({ value: r.id, label: r.name })),
  ], [roles]);

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1e293b", margin: 0 }}>მომხმარებლები</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, marginBottom: 0 }}>
            გუნდის ანგარიშები და RBAC როლები
          </p>
        </div>
        <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600 }}>
          {loading ? "—" : `${users.length} მომხმარებელი`}
        </div>
      </div>

      {pageError && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 14 }}>
          ⚠ {pageError}
          <button onClick={() => setPageError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16 }}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* ── Users table ─────────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>👥</span>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              რეგისტრირებული მომხმარებლები
            </h2>
          </div>

          <div style={{ padding: "16px 24px 0" }}>
            <SearchFilterBar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filterValue={filterRoleId}
              onFilterChange={setFilterRoleId}
              filterOptions={roleFilterOptions}
              filterAllLabel="ყველა როლი"
            />
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
              <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>იტვირთება...</p>
            </div>
          ) : users.length === 0 ? (
            <p style={{ padding: 32, color: "#94a3b8", fontSize: 14, textAlign: "center", margin: 0 }}>
              მომხმარებლები არ არის.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    {["ელ-ფოსტა", "როლი", "სტატუსი", "შექმნილია", "ბოლო შესვლა", ""].map(h => (
                      <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: 0.5, textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                        მომხმარებლები ვერ მოიძებნა.
                      </td>
                    </tr>
                  ) : visibleUsers.map((u, i) => {
                    const isMe        = u.id === currentUserId;
                    const isSA        = u.app_metadata?.role === "admin";
                    const confirmed   = !!u.email_confirmed_at;
                    return (
                      <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #f1f5f9" : "none", backgroundColor: isMe ? "#fffbf5" : "transparent" }}>
                        {/* Email + avatar */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                              background: isMe ? "linear-gradient(135deg,#f97316,#ea580c)" : "linear-gradient(135deg,#1e293b,#334155)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontSize: 12, fontWeight: 700,
                            }}>
                              {(u.email ?? "?").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{u.email ?? "—"}</div>
                              {isMe && <div style={{ fontSize: 11, color: "#f97316", fontWeight: 600 }}>● შენ</div>}
                            </div>
                          </div>
                        </td>

                        {/* Role badges */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {isSA && (
                              <span style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 700, backgroundColor: "#fef3c7", color: "#92400e", width: "fit-content" }}>
                                👑 სუپერ ადმინი
                              </span>
                            )}
                            {u.dbRole ? (
                              <span style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600, backgroundColor: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", width: "fit-content" }}>
                                🔐 {u.dbRole.name}
                              </span>
                            ) : !isSA ? (
                              <span style={{ fontSize: 12, color: "#94a3b8" }}>— როლი არ არის</span>
                            ) : null}
                          </div>
                        </td>

                        {/* Confirmed */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600, backgroundColor: confirmed ? "#dcfce7" : "#fef9c3", color: confirmed ? "#15803d" : "#a16207" }}>
                            {confirmed ? "✓ დადასტურებული" : "მოლოდინი"}
                          </span>
                        </td>

                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b", whiteSpace: "nowrap" as const }}>{fmt(u.created_at)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b", whiteSpace: "nowrap" as const }}>{fmt(u.last_sign_in_at)}</td>

                        {/* Delete (superadmin only, not self) */}
                        <td style={{ padding: "14px 16px", textAlign: "right" as const }}>
                          {isSuperAdmin && !isMe && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              title="მომხმარებლის წაშლა"
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16, padding: "4px 8px", borderRadius: 6 }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              🗑
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Add user form ────────────────────────────────────────────────── */}
        <div style={card}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg,#1e293b,#0f172a)", borderRadius: "12px 12px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#f97316,#ea580c)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                ➕
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0 }}>ახალი მომხმარებელი</h2>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 2 }}>ანგარიშის შექმნა + როლის მინიჭება</p>
              </div>
            </div>
          </div>

          <div style={{ padding: 24 }}>
            {!canAddUsers ? (
              <div style={{ backgroundColor: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#713f12", margin: 0, lineHeight: 1.7 }}>
                  🔒 საჭიროა <code style={{ backgroundColor: "#fef3c7", padding: "1px 5px", borderRadius: 4 }}>can_add_users</code><br />
                  უფლება ახალი ანგარიშის შექმნისთვის.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Email */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: 0.4 }}>
                    ელ-ფოსტა
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: 0.4 }}>
                    პაროლი
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      placeholder="მინ. 8 სიმბოლო"
                      required
                      minLength={8}
                      style={{ ...inputStyle, padding: "10px 40px 10px 12px" }}
                      onFocus={e => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 15, padding: 0 }}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* Role dropdown */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: 0.4 }}>
                    როლი <span style={{ color: "#94a3b8", fontWeight: 400 }}>(არასავალდებულო)</span>
                  </label>
                  <select
                    value={formRoleId}
                    onChange={e => setFormRoleId(e.target.value)}
                    style={{ ...inputStyle, appearance: "auto" }}
                    onFocus={e => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                  >
                    <option value="">— როლის გარეშე —</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
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

                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    width: "100%", padding: "11px 16px",
                    background: formLoading ? "#94a3b8" : "linear-gradient(135deg,#f97316,#ea580c)",
                    color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700,
                    cursor: formLoading ? "not-allowed" : "pointer",
                    boxShadow: formLoading ? "none" : "0 4px 10px rgba(249,115,22,0.3)",
                    fontFamily: "inherit",
                  }}
                >
                  {formLoading ? "იქმნება..." : "➕ ანგარიშის შექმნა"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete modal ─────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(2px)" }}>
          <div style={{ backgroundColor: "white", borderRadius: 14, padding: 28, maxWidth: 380, width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>
                მომხმარებლის წაშლა
              </h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                დარწმუნებული ხართ, რომ გსურთ<br />
                <strong style={{ color: "#1e293b" }}>{deleteTarget.email}</strong><br />
                ანგარიშის წაშლა?
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

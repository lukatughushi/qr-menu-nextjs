"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { usePermissions } from "../../../lib/PermissionsContext";
import { apiFetch } from "../../../lib/api";

interface Banner {
  id: number;
  title_ka: string;
  title_en: string;
  subtitle_ka: string;
  subtitle_en: string;
  image_url: string | null;
  updated_at: string;
  is_active: boolean;
}

const FALLBACK =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=120";

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export default function BannersPage() {
  const { can, loading: permsLoading } = usePermissions();
  const [banners,  setBanners]  = useState<Banner[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => { fetchBanners(); }, []);

  async function fetchBanners() {
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .order("id", { ascending: true });
    if (error) setError(error.message);
    else       setBanners(data ?? []);
    setLoading(false);
  }

  async function toggleVisibility(banner: Banner) {
    setToggling(banner.id);
    setError(null);

    const token = await getToken();
    if (!token) { setError("სესია ამოიწურა."); setToggling(null); return; }

    const res = await apiFetch(`/api/banners/${banner.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_active: !banner.is_active }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(`ხილვადობის განახლება ვერ მოხერხდა: ${json.error ?? res.statusText}`);
    } else {
      setBanners((prev) =>
        prev.map((b) => b.id === banner.id ? { ...b, is_active: !b.is_active } : b)
      );
    }

    setToggling(null);
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    setError(null);

    const token = await getToken();
    if (!token) { setError("სესია ამოიწურა."); setDeleting(false); setDeleteId(null); return; }

    const res = await apiFetch(`/api/banners/${deleteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();

    if (!res.ok) {
      setError(`წაშლა ვერ მოხერხდა: ${json.error ?? res.statusText}`);
    } else {
      setBanners((prev) => prev.filter((b) => b.id !== deleteId));
    }

    setDeleting(false);
    setDeleteId(null);
  }

  const isActive      = (b: Banner) => b.is_active !== false;
  const canManage     = !permsLoading && can("can_manage_banners");

  return (
    <div>
      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white", borderRadius: 12, padding: "28px 32px",
            maxWidth: 400, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: "bold", color: "#1f2937", margin: "0 0 12px" }}>
              ბანერის წაშლა #{deleteId}?
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>
              ეს მოქმედება შეუქცევადია. ბანერი სლაიდერიდან საბოლოოდ წაიშლება.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                style={{
                  padding: "9px 20px", border: "1px solid #d1d5db", borderRadius: 8,
                  color: "#374151", fontWeight: 600, backgroundColor: "white",
                  cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                }}
              >
                გაუქმება
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  padding: "9px 20px", border: "none", borderRadius: 8, color: "white",
                  fontWeight: 600, backgroundColor: deleting ? "#fca5a5" : "#ef4444",
                  cursor: deleting ? "not-allowed" : "pointer", fontSize: 14,
                  fontFamily: "inherit",
                }}
              >
                {deleting ? "იშლება..." : "წაშლა"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 8 }}>
            ბანერების მართვა
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            მართეთ მთავარი სლაიდერის ბანერები.
          </p>
        </div>
        {canManage && !loading && banners.length < 2 && (
          <Link
            href="/admin/banners/add"
            style={{
              display: "inline-block", padding: "10px 20px",
              backgroundColor: "#f97316", color: "white",
              fontWeight: 600, fontSize: 14, borderRadius: 8,
              textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            + ახალი ბანერი
          </Link>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: "#fee2e2", border: "1px solid #fca5a5",
          color: "#991b1b", borderRadius: 8, padding: "12px 16px",
          marginBottom: 24, fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{
          backgroundColor: "white", borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "48px 16px",
          textAlign: "center", color: "#6b7280", fontSize: 14,
        }}>
          იტვირთება...
        </div>
      ) : (
        <div style={{
          backgroundColor: "white", borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
              <tr>
                {["#", "სურათი", "ქართული სათაური", "ინგლისური სათაური", "განახლება", "ჩვენება",
                  ...(canManage ? ["მოქმედება"] : [])
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: 13, fontWeight: 600, color: "#374151",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr
                  key={banner.id}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    opacity: isActive(banner) ? 1 : 0.45,
                    transition: "opacity 0.2s",
                  }}
                >
                  <td style={{ padding: "16px", fontWeight: 700, color: "#1f2937", fontSize: 16 }}>
                    {banner.id}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <img
                      src={banner.image_url || FALLBACK}
                      alt={`Banner ${banner.id}`}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
                      style={{ width: 100, height: 56, objectFit: "cover", borderRadius: 6 }}
                    />
                  </td>
                  <td style={{ padding: "16px" }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "#1f2937", fontSize: 14 }}>
                      {banner.title_ka}
                    </p>
                    {banner.subtitle_ka && (
                      <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: 12 }}>
                        {banner.subtitle_ka}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "#1f2937", fontSize: 14 }}>
                      {banner.title_en}
                    </p>
                    {banner.subtitle_en && (
                      <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: 12 }}>
                        {banner.subtitle_en}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: "16px", color: "#6b7280", fontSize: 13 }}>
                    {banner.updated_at
                      ? new Date(banner.updated_at).toLocaleString("ka-GE")
                      : "—"}
                  </td>

                  <td style={{ padding: "16px" }}>
                    <button
                      onClick={() => canManage && toggleVisibility(banner)}
                      disabled={toggling === banner.id || !canManage}
                      title={isActive(banner) ? "დამალვა" : "გამოჩენა"}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 36, height: 36, borderRadius: 8, border: "1px solid",
                        cursor: (toggling === banner.id || !canManage) ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                        backgroundColor: isActive(banner) ? "#ecfdf5" : "#f3f4f6",
                        borderColor:     isActive(banner) ? "#6ee7b7" : "#d1d5db",
                        color:           isActive(banner) ? "#059669" : "#9ca3af",
                        opacity:         !canManage ? 0.5 : 1,
                      }}
                    >
                      {isActive(banner) ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  </td>

                  {canManage && (
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Link
                          href={`/admin/banners/edit/${banner.id}`}
                          style={{
                            display: "inline-block", padding: "7px 16px",
                            backgroundColor: "#f97316", color: "white",
                            fontWeight: 600, fontSize: 13, borderRadius: 7,
                            textDecoration: "none",
                          }}
                        >
                          ✏️ რედ.
                        </Link>
                        <button
                          onClick={() => setDeleteId(banner.id)}
                          title="ბანერის წაშლა"
                          style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 34, height: 34, borderRadius: 7,
                            border: "1px solid #fca5a5", backgroundColor: "#fff1f2",
                            color: "#ef4444", cursor: "pointer",
                          }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

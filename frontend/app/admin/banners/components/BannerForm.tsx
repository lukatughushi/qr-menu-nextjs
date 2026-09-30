"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

interface BannerFormProps {
  initialData: {
    id: number;
    title_ka: string;
    subtitle_ka: string;
    title_en: string;
    subtitle_en: string;
    image_url: string | null;
  };
  isNew?: boolean;
}

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif";

export default function BannerForm({ initialData, isNew = false }: BannerFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    title_ka:    initialData.title_ka    ?? "",
    subtitle_ka: initialData.subtitle_ka ?? "",
    title_en:    initialData.title_en    ?? "",
    subtitle_en: initialData.subtitle_en ?? "",
    image_url:   initialData.image_url   ?? "",
  });

  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview,     setPreview]     = useState<string | null>(initialData.image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("[banner upload] file object:", {
      name: file.name, size: file.size, type: file.type, isFile: file instanceof File,
    });

    setPreview(URL.createObjectURL(file));
    setUploadError(null);
    setUploading(true);

    const rawExt = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const fileName = `banner-${initialData.id}-${Date.now()}.${rawExt}`;

    const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/banners/${fileName}`;
    const keyPreview = `${(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").slice(0, 24)}…`;
    console.log("[banner upload] endpoint :", storageUrl);
    console.log("[banner upload] anon key :", keyPreview);
    console.log("[banner upload] filename  :", fileName);

    const { error: uploadErr } = await supabase.storage
      .from("banners")
      .upload(fileName, file, { cacheControl: "3600", upsert: true });

    if (uploadErr) {
      console.error("[banner upload] full error object:", uploadErr);
      const detail = `${uploadErr.message} (status: ${(uploadErr as { statusCode?: string }).statusCode ?? "unknown"})`;
      setUploadError(detail);
      setPreview(initialData.image_url || null);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("banners").getPublicUrl(fileName);
    setForm((p) => ({ ...p, image_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    if (!form.title_ka.trim()) { setSaveError("ქართული სათაური სავალდებულოა"); return; }
    if (!form.title_en.trim()) { setSaveError("ინგლისური სათაური სავალდებულოა"); return; }
    setSaving(true);
    setSaveError(null);

    const payload = {
      title_ka:    form.title_ka.trim(),
      subtitle_ka: form.subtitle_ka.trim(),
      title_en:    form.title_en.trim(),
      subtitle_en: form.subtitle_en.trim(),
      image_url:   form.image_url || null,
      updated_at:  new Date().toISOString(),
    };

    const { error } = isNew
      ? await supabase.from("hero_banners").insert(payload)
      : await supabase.from("hero_banners").update(payload).eq("id", initialData.id);

    if (error) { setSaveError(error.message); setSaving(false); return; }
    router.push("/admin/banners");
  };

  /* ── style helpers ── */
  const label: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: "#374151", marginBottom: 6,
  };

  const inp = (err?: boolean): React.CSSProperties => ({
    width: "100%", padding: "9px 12px", boxSizing: "border-box",
    border: `1px solid ${err ? "#ef4444" : "#e5e7eb"}`,
    borderRadius: 8, fontSize: 14, fontFamily: "inherit",
    outline: "none", color: "#1f2937",
  });

  const card: React.CSSProperties = {
    backgroundColor: "white", borderRadius: 10,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "24px 28px", marginBottom: 20,
  };

  const cardTitle: React.CSSProperties = {
    fontSize: 15, fontWeight: 700, color: "#1f2937",
    marginTop: 0, marginBottom: 20, paddingBottom: 12,
    borderBottom: "1px solid #f3f4f6",
  };

  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      <div style={{ marginBottom: 28 }}>
        <button
          type="button"
          onClick={() => router.push("/admin/banners")}
          style={{
            background: "none", border: "none", color: "#6b7280",
            cursor: "pointer", fontSize: 14, fontWeight: 500,
            padding: 0, marginBottom: 10, fontFamily: "inherit",
          }}
        >
          ← ბანერებში დაბრუნება
        </button>
        <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#1f2937", margin: 0 }}>
          {isNew ? "ახალი ბანერის დამატება" : `ბანერის რედაქტირება #${initialData.id}`}
        </h1>
      </div>

      {saveError && (
        <div style={{
          backgroundColor: "#fee2e2", border: "1px solid #fca5a5",
          color: "#991b1b", borderRadius: 8, padding: "12px 16px",
          marginBottom: 20, fontSize: 14,
        }}>
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* Titles */}
        <div style={card}>
          <p style={cardTitle}>სათაურები</p>
          <div style={grid2}>
            <div>
              <label style={label}>ქართული სათაური *</label>
              <input
                type="text" name="title_ka" value={form.title_ka}
                onChange={handleChange} placeholder="მაგ. სწრაფი კვების რესტორანი"
                style={inp()}
              />
            </div>
            <div>
              <label style={label}>ინგლისური სათაური *</label>
              <input
                type="text" name="title_en" value={form.title_en}
                onChange={handleChange} placeholder="e.g. Fast Food Restaurant"
                style={inp()}
              />
            </div>
          </div>
        </div>

        {/* Subtitles */}
        <div style={card}>
          <p style={cardTitle}>ქვესათაურები</p>
          <div style={grid2}>
            <div>
              <label style={label}>ქართული ქვესათაური</label>
              <textarea
                name="subtitle_ka" value={form.subtitle_ka} onChange={handleChange}
                placeholder="მოკლე ტექსტი სლაიდისთვის..." rows={3}
                style={{ ...inp(), resize: "vertical" }}
              />
            </div>
            <div>
              <label style={label}>ინგლისური ქვესათაური</label>
              <textarea
                name="subtitle_en" value={form.subtitle_en} onChange={handleChange}
                placeholder="Short text for the slide..." rows={3}
                style={{ ...inp(), resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div style={card}>
          <p style={cardTitle}>ბანერის სურათი</p>
          <div style={{ maxWidth: 360 }}>
            <label style={label}>ფონის სურათის ატვირთვა</label>
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              style={{
                border: "2px dashed #e5e7eb", borderRadius: 8, padding: 16,
                cursor: uploading ? "not-allowed" : "pointer",
                textAlign: "center", minHeight: 140,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 8,
                backgroundColor: uploading ? "#f9fafb" : "white",
              }}
            >
              {uploading ? (
                <><Spinner /><span style={{ fontSize: 12, color: "#6b7280" }}>იტვირთება...</span></>
              ) : preview ? (
                <img
                  src={preview} alt="preview"
                  style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 6 }}
                />
              ) : (
                <>
                  <span style={{ fontSize: 30 }}>🖼️</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>ასატვირთად დააჭირეთ</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>JPG · PNG · WEBP</span>
                </>
              )}
            </div>
            {preview && !uploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  marginTop: 8, fontSize: 12, color: "#f97316",
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, fontWeight: 600, fontFamily: "inherit",
                }}
              >
                სურათის შეცვლა
              </button>
            )}
            {uploadError && (
              <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                ატვირთვის შეცდომა: {uploadError}
              </p>
            )}
            <input
              ref={fileInputRef} type="file" accept={ACCEPTED}
              onChange={handleFileChange} style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <button
            type="button"
            onClick={() => router.push("/admin/banners")}
            style={{
              padding: "10px 28px", border: "1px solid #d1d5db",
              borderRadius: 8, color: "#374151", fontWeight: 600,
              backgroundColor: "white", cursor: "pointer", fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            გაუქმება
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            style={{
              padding: "10px 28px",
              backgroundColor: saving || uploading ? "#fdba74" : "#f97316",
              color: "white", fontWeight: 600, border: "none",
              borderRadius: 8,
              cursor: saving || uploading ? "not-allowed" : "pointer",
              fontSize: 14, fontFamily: "inherit",
            }}
          >
            {saving ? (isNew ? "იქმნება..." : "ინახება...") : (isNew ? "ბანერის შექმნა" : "ცვლილებების შენახვა")}
          </button>
        </div>

      </form>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 24, height: 24,
      border: "3px solid #e5e7eb", borderTop: "3px solid #f97316",
      borderRadius: "50%", animation: "spin 0.8s linear infinite",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

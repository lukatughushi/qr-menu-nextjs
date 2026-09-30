"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { CATEGORIES as ALL_CATEGORIES, type Category } from "../../../../lib/categories";

interface FormState {
  id?: string;
  name: string;
  description: string;
  name_en: string;
  description_en: string;
  price: string;
  category: Category;
  image_url: string;
  is_visible: boolean;
  discount_percent: number;
}

interface MenuItemFormProps {
  mode: "add" | "edit";
  initialData?: Record<string, unknown>;
}

const CATEGORIES: { value: Category; label: string }[] = ALL_CATEGORIES.map(({ value, ka }) => ({ value, label: ka }));

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif";

function rowToForm(row: Record<string, unknown>): FormState {
  return {
    id:              String(row.id),
    name:            (row.name as string)            ?? "",
    description:     (row.description as string)     ?? "",
    name_en:         (row.name_en as string)         ?? "",
    description_en:  (row.description_en as string)  ?? "",
    price:           String(row.price ?? ""),
    category:        (row.category as Category)      ?? "main",
    image_url:       (row.image_url as string)       ?? "",
    is_visible:      (row.is_visible as boolean)     ?? true,
    discount_percent: Number(row.discount_percent)   || 0,
  };
}

function emptyForm(): FormState {
  return {
    name: "", description: "", name_en: "", description_en: "",
    price: "", category: "main", image_url: "", is_visible: true, discount_percent: 0,
  };
}

export default function MenuItemForm({ mode, initialData }: MenuItemFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [form, setForm] = useState<FormState>(
    initialData ? rowToForm(initialData) : emptyForm()
  );
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview,     setPreview]     = useState<string | null>(
    (initialData?.image_url as string) || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploadError(null);
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (uploadErr) {
      setUploadError(uploadErr.message);
      setPreview((initialData?.image_url as string) || null);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
    setForm((p) => ({ ...p, image_url: data.publicUrl }));
    setUploading(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "ქართული სახელი სავალდებულოა";
    const p = parseFloat(form.price);
    if (!form.price || isNaN(p)) e.price = "ფასი სავალდებულოა";
    else if (p <= 0)             e.price = "ფასი 0-ზე მეტი უნდა იყოს";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading || !validate()) return;
    setSaving(true);
    setSaveError(null);

    const payload = {
      name:            form.name.trim(),
      description:     form.description.trim(),
      name_en:         form.name_en.trim()         || null,
      description_en:  form.description_en.trim()  || null,
      price:           parseFloat(form.price),
      category:        form.category,
      image_url:       form.image_url               || null,
      is_visible:      form.is_visible,
    };

    const { error } = isEdit && form.id
      ? await supabase.from("menu_items").update(payload).eq("id", form.id)
      : await supabase.from("menu_items").insert({ ...payload, discount_percent: 0 });

    if (error) { setSaveError(error.message); setSaving(false); return; }
    router.push("/admin/menu");
  };

  /* ── style helpers ── */
  const label: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: "#374151", marginBottom: 6,
  };

  const input = (err?: boolean): React.CSSProperties => ({
    width: "100%", padding: "9px 12px", boxSizing: "border-box",
    border: `1px solid ${err ? "#ef4444" : "#e5e7eb"}`,
    borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", color: "#1f2937",
  });

  const card: React.CSSProperties = {
    backgroundColor: "white", borderRadius: 10,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "24px 28px", marginBottom: 20,
  };

  const cardTitle: React.CSSProperties = {
    fontSize: 15, fontWeight: 700, color: "#1f2937",
    marginTop: 0, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #f3f4f6",
  };

  const errMsg = (field: string) =>
    errors[field] ? (
      <p style={{ color: "#ef4444", fontSize: 12, margin: "4px 0 0" }}>{errors[field]}</p>
    ) : null;

  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };
  const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      <div style={{ marginBottom: 28 }}>
        <button
          type="button"
          onClick={() => router.push("/admin/menu")}
          className="admin-back-btn"
        >
          ← მენიუში დაბრუნება
        </button>
        <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#1f2937", margin: 0 }}>
          {isEdit ? `რედაქტირება: ${(initialData?.name as string) ?? ""}` : "ახალი კერძის დამატება"}
        </h1>
      </div>

      {saveError && (
        <div style={{
          backgroundColor: "#fee2e2", border: "1px solid #fca5a5",
          color: "#991b1b", borderRadius: 8, padding: "12px 16px",
          marginBottom: 20, fontSize: 14,
        }}>
          დაფიქსირდა შეცდომა: {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* Names */}
        <div style={card}>
          <p style={cardTitle}>სახელები</p>
          <div style={grid2}>
            <div>
              <label style={label}>ქართული სახელი *</label>
              <input
                type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="მაგ. გოაქსია" style={input(!!errors.name)}
              />
              {errMsg("name")}
            </div>
            <div>
              <label style={label}>ინგლისური სახელი</label>
              <input
                type="text" name="name_en" value={form.name_en} onChange={handleChange}
                placeholder="e.g. Pumpkin Soup" style={input()}
              />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div style={card}>
          <p style={cardTitle}>აღწერები</p>
          <div style={grid2}>
            <div>
              <label style={label}>ქართული აღწერა</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="კერძის მოკლე აღწერა..." rows={4}
                style={{ ...input(), resize: "vertical" }}
              />
            </div>
            <div>
              <label style={label}>ინგლისური აღწერა</label>
              <textarea
                name="description_en" value={form.description_en} onChange={handleChange}
                placeholder="Brief description of the dish..." rows={4}
                style={{ ...input(), resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={card}>
          <p style={cardTitle}>დეტალები</p>
          <div style={grid3}>
            <div>
              <label style={label}>ფასი (₾) *</label>
              <input
                type="number" name="price" value={form.price} onChange={handleChange}
                placeholder="9.99" step="0.01" min="0" style={input(!!errors.price)}
              />
              {errMsg("price")}
            </div>
            <div>
              <label style={label}>კატეგორია *</label>
              <select name="category" value={form.category} onChange={handleChange} style={input()}>
                {CATEGORIES.map(({ value: v, label: l }) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={label}>ხილვადობა</label>
              <div
                onClick={() => setForm((p) => ({ ...p, is_visible: !p.is_visible }))}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8,
                  cursor: "pointer", userSelect: "none",
                  backgroundColor: form.is_visible ? "#f0fdf4" : "#fafafa",
                }}
              >
                <div style={{
                  width: 40, height: 22, borderRadius: 11, flexShrink: 0, position: "relative",
                  backgroundColor: form.is_visible ? "#16a34a" : "#d1d5db",
                  transition: "background-color 0.2s",
                }}>
                  <div style={{
                    position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%",
                    backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    left: form.is_visible ? 21 : 3, transition: "left 0.2s",
                  }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: form.is_visible ? "#15803d" : "#6b7280" }}>
                  {form.is_visible ? "ხილული მენიუში" : "დამალული მენიუდან"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
        <div style={card}>
          <p style={cardTitle}>სურათი</p>
          <div style={{ maxWidth: 320 }}>
            <label style={label}>სურათის ატვირთვა</label>
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              style={{
                border: "2px dashed #e5e7eb", borderRadius: 8, padding: 16,
                cursor: uploading ? "not-allowed" : "pointer",
                textAlign: "center", backgroundColor: uploading ? "#f9fafb" : "white",
                minHeight: 130, display: "flex", alignItems: "center",
                justifyContent: "center", flexDirection: "column", gap: 8,
              }}
            >
              {uploading ? (
                <><Spinner /><span style={{ fontSize: 12, color: "#6b7280" }}>იტვირთება...</span></>
              ) : preview ? (
                <img
                  src={preview} alt="preview"
                  style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6 }}
                />
              ) : (
                <>
                  <span style={{ fontSize: 28 }}>📷</span>
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
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontWeight: 600, fontFamily: "inherit",
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
            onClick={() => router.push("/admin/menu")}
            style={{
              padding: "10px 28px", border: "1px solid #d1d5db", borderRadius: 8,
              color: "#374151", fontWeight: 600, backgroundColor: "white",
              cursor: "pointer", fontSize: 14, fontFamily: "inherit",
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
            {saving ? "ინახება..." : isEdit ? "ცვლილებების შენახვა" : "დამატება"}
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

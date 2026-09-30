"use client";

import { useState, useRef } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { CATEGORIES, type Category } from "../../../../lib/categories";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image_url: string;
  createdAt: string;
  is_visible?: boolean;
  discount_percent?: number;
}

interface AddMenuModalProps {
  item: MenuItem | null;
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "main" as MenuItem["category"],
  image_url: "",
};

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif";

export default function AddMenuModal({ item, onSave, onClose }: AddMenuModalProps) {
  const [formData, setFormData] = useState({
    name: item?.name ?? "",
    description: item?.description ?? "",
    price: item?.price.toString() ?? "",
    category: (item?.category ?? "main") as MenuItem["category"],
    image_url: item?.image_url ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(item?.image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "სახელი სავალდებულოა";
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      e.price = "ფასი სავალდებულოა";
    } else if (parseFloat(formData.price) <= 0) {
      e.price = "ფასი 0-ზე მეტი უნდა იყოს";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
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
      setPreview(item?.image_url || null);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
    setFormData((prev) => ({ ...prev, image_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    if (!validate()) return;

    const saved: MenuItem = item
      ? { ...item, ...formData, price: parseFloat(formData.price) }
      : {
          ...formData,
          price: parseFloat(formData.price),
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split("T")[0],
        };

    onSave(saved);
    setFormData(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "8px 12px",
    border: `1px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
    color: "#1f2937",
  });

  const errorMsg = (msg: string) => (
    <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, marginBottom: 0 }}>{msg}</p>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 8,
          boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
          width: "100%",
          maxWidth: 512,
          margin: "0 16px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: "1px solid #e5e7eb", padding: "24px 32px" }}>
          <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#1f2937", margin: 0 }}>
            {item ? "პოზიციის რედაქტირება" : "ახალი პოზიციის დამატება"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 32 }} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>სახელი *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="მაგ., გოაქსია"
                style={inputStyle(!!errors.name)}
              />
              {errors.name && errorMsg(errors.name)}
            </div>

            {/* Price */}
            <div>
              <label style={labelStyle}>ფასი (₾) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="მაგ., 9.99"
                step="0.01"
                min="0"
                style={inputStyle(!!errors.price)}
              />
              {errors.price && errorMsg(errors.price)}
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>კატეგორია *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={inputStyle()}
              >
                {CATEGORIES.map(({ value, ka }) => (
                  <option key={value} value={value}>{ka}</option>
                ))}
              </select>
            </div>

            {/* Image upload */}
            <div>
              <label style={labelStyle}>სურათი</label>
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #e5e7eb",
                  borderRadius: 8,
                  padding: "10px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  textAlign: "center",
                  backgroundColor: uploading ? "#f9fafb" : "white",
                  position: "relative",
                  minHeight: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {uploading ? (
                  <>
                    <Spinner />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>იტვირთება...</span>
                  </>
                ) : preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    style={{ width: "100%", height: 72, objectFit: "cover", borderRadius: 6 }}
                  />
                ) : (
                  <>
                    <span style={{ fontSize: 22 }}>📷</span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>ასატვირთად დააჭირეთ</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>JPG, PNG, WEBP</span>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              {preview && !uploading && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#f97316",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                >
                  სურათის შეცვლა
                </button>
              )}

              {uploadError && (
                <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, marginBottom: 0 }}>
                  ატვირთვის შეცდომა: {uploadError}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginTop: 24 }}>
            <label style={labelStyle}>აღწერა</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="კერძის მოკლე აღწერა..."
              rows={3}
              style={{ ...inputStyle(), resize: "vertical" }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 32 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 24px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                color: "#374151",
                fontWeight: 600,
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: 14,
                fontFamily: "inherit",
              }}
            >
              გაუქმება
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: "8px 24px",
                backgroundColor: uploading ? "#fdba74" : "#f97316",
                color: "white",
                fontWeight: 600,
                border: "none",
                borderRadius: 8,
                cursor: uploading ? "not-allowed" : "pointer",
                fontSize: 14,
                fontFamily: "inherit",
              }}
            >
              {item ? "განახლება" : "დამატება"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        border: "3px solid #e5e7eb",
        borderTop: "3px solid #f97316",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

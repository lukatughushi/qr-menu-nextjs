"use client";

import Link from "next/link";
import { categoryLabel, categoryMeta, type Category } from "../../../../lib/categories";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  name_en: string;
  description_en: string;
  price: number;
  category: Category;
  image_url: string;
  createdAt: string;
  is_visible: boolean;
  discount_percent: number;
}

interface MenuTableProps {
  items: MenuItem[];
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, currentValue: boolean) => void;
  onOpenDiscount: (item: MenuItem) => void;
}

export default function MenuTable({
  items,
  canEdit,
  canDelete,
  onDelete,
  onToggleVisibility,
  onOpenDiscount,
}: MenuTableProps) {
  const getCategoryStyle = (category: MenuItem["category"]) => {
    const meta = categoryMeta(category);
    return { backgroundColor: meta.bg, color: meta.color };
  };

  const hasActions = canEdit || canDelete;
  const HEADERS = [
    { key: "name",    label: "სახელი",        center: false },
    { key: "name_en", label: "EN სახელი",     center: false },
    { key: "price",   label: "ფასი",           center: false },
    { key: "cat",     label: "კატეგორია",     center: false },
    { key: "img",     label: "სურათი",        center: false },
    { key: "date",    label: "თარიღი",        center: false },
    ...(canEdit ? [
      { key: "vis",  label: "ჩვენება",       center: true },
      { key: "disc", label: "ფასდაკლება",    center: true },
    ] : []),
    ...(hasActions ? [{ key: "actions", label: "მოქმედება", center: true }] : []),
  ];

  return (
    <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
          <tr>
            {HEADERS.map(({ key, label, center }) => (
              <th
                key={key}
                style={{
                  padding: "12px 16px",
                  textAlign: center ? "center" : "left",
                  fontSize: "13px", fontWeight: "600", color: "#374151",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={HEADERS.length} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af" }}>
                მენიუს პოზიციები არ მოიძებნა.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const catStyle = getCategoryStyle(item.category);
              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    opacity: item.is_visible ? 1 : 0.5,
                    transition: "opacity 0.2s",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap" }}>
                    {item.name}
                  </td>

                  <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13, whiteSpace: "nowrap" }}>
                    {item.name_en || <span style={{ color: "#d1d5db", fontStyle: "italic" }}>—</span>}
                  </td>

                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap" }}>
                    ₾{item.price.toFixed(2)}
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: 9999,
                      fontSize: 12, fontWeight: 600,
                      backgroundColor: catStyle.backgroundColor,
                      color: catStyle.color,
                    }}>
                      {categoryLabel(item.category)}
                    </span>
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url} alt={item.name}
                        style={{ height: 40, width: 40, objectFit: "cover", borderRadius: 4 }}
                      />
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>სურათი არ არის</span>
                    )}
                  </td>

                  <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13, whiteSpace: "nowrap" }}>
                    {new Date(item.createdAt).toLocaleDateString("ka-GE")}
                  </td>

                  {canEdit && (
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <button
                        onClick={() => onToggleVisibility(item.id, item.is_visible)}
                        title={item.is_visible ? "დამალვა" : "გამოჩენა"}
                        style={{
                          border: "none", backgroundColor: "transparent",
                          cursor: "pointer", padding: 4, borderRadius: 4,
                          color: item.is_visible ? "#16a34a" : "#9ca3af",
                          fontSize: 18, lineHeight: 1,
                        }}
                      >
                        <i className={item.is_visible ? "fa fa-eye" : "fa fa-eye-slash"} />
                      </button>
                    </td>
                  )}

                  {canEdit && (
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <button
                        onClick={() => onOpenDiscount(item)}
                        title={item.discount_percent > 0 ? `${item.discount_percent}% — შეცვლა` : "ფასდაკლება"}
                        style={{
                          border: "none", backgroundColor: "transparent",
                          cursor: "pointer", padding: 4,
                          display: "inline-flex", flexDirection: "column",
                          alignItems: "center", gap: 2, lineHeight: 1,
                        }}
                      >
                        <i className="fa fa-tag" style={{ color: item.discount_percent > 0 ? "#f97316" : "#9ca3af", fontSize: 16 }} />
                        {item.discount_percent > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#f97316" }}>
                            {item.discount_percent}%
                          </span>
                        )}
                      </button>
                    </td>
                  )}

                  {hasActions && (
                    <td style={{ padding: "12px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                      {canEdit && (
                        <Link
                          href={`/admin/menu/edit/${item.id}`}
                          style={{
                            color: "#2563eb", fontWeight: 600,
                            marginRight: canDelete ? 12 : 0,
                            textDecoration: "none", fontSize: 14,
                          }}
                        >
                          ✏️ რედ.
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(item.id)}
                          style={{
                            color: "#dc2626", fontWeight: 600,
                            border: "none", backgroundColor: "transparent",
                            cursor: "pointer", fontSize: 14,
                            fontFamily: "inherit",
                          }}
                        >
                          🗑️ წაშლა
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

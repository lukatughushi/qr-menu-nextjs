"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { usePermissions } from "../../../lib/PermissionsContext";
import MenuTable from "./components/MenuTable";
import DiscountModal from "./components/DiscountModal";
import SearchFilterBar from "../components/SearchFilterBar";
import Pagination from "../components/Pagination";
import { CATEGORIES, type Category } from "../../../lib/categories";

export interface MenuItem {
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

function rowToItem(row: Record<string, unknown>): MenuItem {
  return {
    id:               String(row.id),
    name:             (row.name as string)             ?? "",
    description:      (row.description as string)      ?? "",
    name_en:          (row.name_en as string)          ?? "",
    description_en:   (row.description_en as string)   ?? "",
    price:            Number(row.price),
    category:         row.category as MenuItem["category"],
    image_url:        (row.image_url as string)        ?? "",
    createdAt:        ((row.created_at as string) ?? "").split("T")[0],
    is_visible:       (row.is_visible as boolean)      ?? true,
    discount_percent: Number(row.discount_percent)     || 0,
  };
}

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export default function MenuPage() {
  const router = useRouter();
  const { can, loading: permsLoading } = usePermissions();
  const [menuItems,       setMenuItems]       = useState<MenuItem[]>([]);
  const [discountingItem, setDiscountingItem] = useState<MenuItem | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [filterCategory,  setFilterCategory]  = useState("");
  const [page,            setPage]            = useState(1);
  const [pageSize,        setPageSize]        = useState(20);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else       setMenuItems((data ?? []).map(rowToItem));
    setLoading(false);
  }

  const handleToggleVisibility = async (id: string, currentValue: boolean) => {
    setError(null);
    const token = await getToken();
    if (!token) { setError("სესია ამოიწურა. გთხოვთ შეხვიდეთ თავიდან."); return; }

    const res = await fetch(`/api/admin/menu/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_visible: !currentValue }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "განახლება ვერ მოხერხდა"); return; }
    setMenuItems((prev) => prev.map((item) => (item.id === id ? rowToItem({ ...item, created_at: item.createdAt, ...json.data }) : item)));
  };

  const handleSaveDiscount = async (id: string, percent: number) => {
    setError(null);
    const token = await getToken();
    if (!token) { setError("სესია ამოიწურა. გთხოვთ შეხვიდეთ თავიდან."); return; }

    const res = await fetch(`/api/admin/menu/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ discount_percent: percent }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "განახლება ვერ მოხერხდა"); return; }
    setMenuItems((prev) => prev.map((item) => (item.id === id ? rowToItem({ ...item, created_at: item.createdAt, ...json.data }) : item)));
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("ნამდვილად გსურთ ამ პოზიციის წაშლა?")) return;
    setError(null);
    const token = await getToken();
    if (!token) { setError("სესია ამოიწურა. გთხოვთ შეხვიდეთ თავიდან."); return; }

    const res = await fetch(`/api/admin/menu/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "წაშლა ვერ მოხერხდა"); return; }
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const canEdit   = !permsLoading && can("can_edit_menu");
  const canDelete = !permsLoading && can("can_delete_menu");

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchSearch = q.length < 3 ||
        item.name.toLowerCase().includes(q) ||
        item.name_en.toLowerCase().includes(q);
      const matchCategory = !filterCategory || item.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [menuItems, searchQuery, filterCategory]);

  // Clamp so deleting the last row on the last page doesn't leave an empty page
  const totalPages  = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems  = visibleItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const CATEGORY_OPTIONS = CATEGORIES.map(({ value, ka }) => ({ value, label: ka }));

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 8 }}>
          მენიუს მართვა
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          მართეთ მენიუს პოზიციები, ფასები და კატეგორიები
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#fee2e2", border: "1px solid #fca5a5",
          color: "#991b1b", borderRadius: 8, padding: "12px 16px",
          marginBottom: 24, fontSize: 14,
        }}>
          დაფიქსირდა შეცდომა: {error}
        </div>
      )}

      {canEdit && (
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => router.push("/admin/menu/add")}
            disabled={loading}
            style={{
              backgroundColor: "#f97316", color: "white", fontWeight: 600,
              padding: "8px 24px", borderRadius: 8, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1, fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            + ახალი პოზიცია
          </button>
        </div>
      )}

      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={(v) => { setSearchQuery(v); setPage(1); }}
        filterValue={filterCategory}
        onFilterChange={(v) => { setFilterCategory(v); setPage(1); }}
        filterOptions={CATEGORY_OPTIONS}
        filterAllLabel="ყველა კატეგორია"
      />

      {loading ? (
        <div style={{
          backgroundColor: "white", borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "48px 16px",
          textAlign: "center", color: "#6b7280", fontSize: 14,
        }}>
          იტვირთება...
        </div>
      ) : (
        <>
          <MenuTable
            items={pagedItems}
            canEdit={canEdit}
            canDelete={canDelete}
            onDelete={handleDeleteItem}
            onToggleVisibility={handleToggleVisibility}
            onOpenDiscount={(item) => setDiscountingItem(item)}
          />
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            total={visibleItems.length}
            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          />
        </>
      )}

      {discountingItem && (
        <DiscountModal
          itemName={discountingItem.name}
          currentPercent={discountingItem.discount_percent}
          onSave={(percent) => handleSaveDiscount(discountingItem.id, percent)}
          onClose={() => setDiscountingItem(null)}
        />
      )}
    </div>
  );
}

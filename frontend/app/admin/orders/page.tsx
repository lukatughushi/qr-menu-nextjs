"use client";

import { useState, useMemo } from "react";
import SearchFilterBar from "../components/SearchFilterBar";

type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled";

interface Order {
  id: string;
  customer: string;
  items: string[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

const SAMPLE_ORDERS: Order[] = [
  { id: "ORD-001", customer: "John Smith",   items: ["Pumpkin Soup", "Grilled Chicken"],               total: 25.98, status: "delivered",  createdAt: "2024-01-15 12:30" },
  { id: "ORD-002", customer: "Maria Garcia", items: ["Pumpkin Pie", "Lemonade"],                       total: 11.98, status: "preparing",  createdAt: "2024-01-15 13:10" },
  { id: "ORD-003", customer: "David Lee",    items: ["Grilled Chicken", "Pumpkin Soup", "Pumpkin Pie"], total: 31.97, status: "pending",    createdAt: "2024-01-15 13:45" },
  { id: "ORD-004", customer: "Emma Wilson",  items: ["Lemonade"],                                      total: 3.99,  status: "ready",      createdAt: "2024-01-15 14:00" },
  { id: "ORD-005", customer: "Chris Brown",  items: ["Pumpkin Soup", "Pumpkin Pie"],                   total: 14.98, status: "cancelled",  createdAt: "2024-01-15 14:20" },
];

const STATUS_STYLES: Record<OrderStatus, { backgroundColor: string; color: string; label: string }> = {
  pending:   { backgroundColor: "#fef3c7", color: "#92400e", label: "მოლოდინში" },
  preparing: { backgroundColor: "#dbeafe", color: "#1e40af", label: "მზადდება" },
  ready:     { backgroundColor: "#dcfce7", color: "#15803d", label: "მზადაა" },
  delivered: { backgroundColor: "#f3f4f6", color: "#374151", label: "მიტანილია" },
  cancelled: { backgroundColor: "#fee2e2", color: "#991b1b", label: "გაუქმებული" },
};

const STATUS_OPTIONS = (Object.keys(STATUS_STYLES) as OrderStatus[]).map((s) => ({
  value: s,
  label: STATUS_STYLES[s].label,
}));

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:   "preparing",
  preparing: "ready",
  ready:     "delivered",
};

export default function OrdersPage() {
  const [orders,       setOrders]       = useState<Order[]>(SAMPLE_ORDERS);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const visibleOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      const matchSearch = q.length < 3 ||
        o.customer.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q);
      const matchStatus = !filterStatus || o.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  const advance = (id: string, current: OrderStatus) => {
    const next = NEXT_STATUS[current];
    if (!next) return;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
  };

  const cancel = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)));
  };

  const thStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  };

  const tdStyle: React.CSSProperties = {
    padding: "12px 16px",
    fontSize: 14,
    color: "#1f2937",
    borderBottom: "1px solid #f3f4f6",
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 8 }}>
          შეკვეთები
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          მართეთ კლიენტების შეკვეთები
        </p>
      </div>

      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterValue={filterStatus}
        onFilterChange={setFilterStatus}
        filterOptions={STATUS_OPTIONS}
        filterAllLabel="ყველა სტატუსი"
      />

      <div style={{ backgroundColor: "white", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
            <tr>
              <th style={thStyle}>შეკვეთა</th>
              <th style={thStyle}>კლიენტი</th>
              <th style={thStyle}>კერძები</th>
              <th style={thStyle}>ჯამი</th>
              <th style={thStyle}>სტატუსი</th>
              <th style={thStyle}>დრო</th>
              <th style={{ ...thStyle, textAlign: "center" }}>მოქმედება</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af" }}>
                  შეკვეთები არ მოიძებნა.
                </td>
              </tr>
            ) : (
              visibleOrders.map((order) => {
                const st   = STATUS_STYLES[order.status];
                const next = NEXT_STATUS[order.status];
                return (
                  <tr key={order.id}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#f97316" }}>{order.id}</td>
                    <td style={tdStyle}>{order.customer}</td>
                    <td style={{ ...tdStyle, color: "#6b7280" }}>{order.items.join(", ")}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>₾{order.total.toFixed(2)}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "4px 12px", borderRadius: 9999,
                        fontSize: 12, fontWeight: 600,
                        backgroundColor: st.backgroundColor, color: st.color,
                      }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "#6b7280" }}>{order.createdAt}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {next && (
                        <button
                          onClick={() => advance(order.id, order.status)}
                          style={{
                            color: "#2563eb", fontWeight: 600, border: "none",
                            backgroundColor: "transparent", cursor: "pointer",
                            fontSize: 13, marginRight: 8, fontFamily: "inherit",
                          }}
                        >
                          → {STATUS_STYLES[next].label}
                        </button>
                      )}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <button
                          onClick={() => cancel(order.id)}
                          style={{
                            color: "#dc2626", fontWeight: 600, border: "none",
                            backgroundColor: "transparent", cursor: "pointer",
                            fontSize: 13, fontFamily: "inherit",
                          }}
                        >
                          გაუქმება
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

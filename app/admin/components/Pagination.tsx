"use client";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

// Page numbers with ellipses: 1 … 4 5 [6] 7 8 … 20
function pageList(current: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("…");
  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const btn = (active: boolean, disabled = false): React.CSSProperties => ({
    minWidth: 34,
    height: 34,
    padding: "0 10px",
    borderRadius: 8,
    border: active ? "1px solid #f97316" : "1px solid #e2e8f0",
    backgroundColor: active ? "#f97316" : "white",
    color: active ? "white" : "#334155",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
  });

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 16,
      fontSize: 13,
      color: "#64748b",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>
          ნაჩვენებია <b style={{ color: "#1e293b" }}>{from}–{to}</b> / {total}
        </span>
        {onPageSizeChange && (
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            გვერდზე
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                height: 32, padding: "0 8px", borderRadius: 8,
                border: "1px solid #e2e8f0", backgroundColor: "white",
                fontSize: 13, fontFamily: "inherit", color: "#1e293b", cursor: "pointer",
              }}
            >
              {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <nav aria-label="გვერდები" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            style={btn(false, page === 1)}
            aria-label="წინა გვერდი"
          >
            ‹
          </button>
          {pageList(page, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`gap-${i}`} style={{ padding: "0 4px" }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                style={btn(p === page)}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            style={btn(false, page === totalPages)}
            aria-label="შემდეგი გვერდი"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
}

"use client";

interface Option {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  filterValue: string;
  onFilterChange: (v: string) => void;
  filterOptions: Option[];
  filterAllLabel: string;
}

export default function SearchFilterBar({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  filterAllLabel,
}: SearchFilterBarProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    }}>
      {/* Search input */}
      <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 340 }}>
        <svg
          style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ძებნა..."
          style={{
            width: "100%",
            padding: "9px 12px 9px 34px",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 14,
            color: "#1e293b",
            backgroundColor: "white",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#f97316";
            e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
          }}
        />
        {searchValue.length > 0 && searchValue.length < 3 && (
          <span style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap",
          }}>
            {3 - searchValue.length} სიმბ.
          </span>
        )}
      </div>

      {/* Filter dropdown */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg
          style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          style={{
            padding: "9px 32px 9px 32px",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 14,
            color: filterValue ? "#1e293b" : "#94a3b8",
            backgroundColor: "white",
            outline: "none",
            cursor: "pointer",
            appearance: "none",
            fontFamily: "inherit",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            minWidth: 160,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#f97316";
            e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.12)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
          }}
        >
          <option value="">{filterAllLabel}</option>
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* Custom chevron */}
        <svg
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

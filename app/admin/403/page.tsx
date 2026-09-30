"use client";

import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      minHeight: 400,
      gap: 16,
      textAlign: "center",
      fontFamily: "'Roboto', sans-serif",
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        backgroundColor: "#fef2f2",
        border: "2px solid #fecaca",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 36,
      }}>
        🔒
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1f2937", margin: 0 }}>
        403 — წვდომა აკრძალულია
      </h1>

      <p style={{ fontSize: 15, color: "#6b7280", margin: 0, maxWidth: 400 }}>
        თქვენ არ გაქვთ ამ გვერდზე წვდომის უფლება.
        დაუკავშირდით ადმინისტრატორს დამატებითი უფლებების მისაღებად.
      </p>

      <button
        onClick={() => router.push("/admin")}
        style={{
          marginTop: 8,
          padding: "10px 24px",
          backgroundColor: "#f97316",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        მთავარ გვერდზე დაბრუნება
      </button>
    </div>
  );
}

export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "80px 0",
        color: "var(--muted)",
      }}
    >
      <span className="spinner spinner-dark" aria-hidden style={{ width: 26, height: 26, borderWidth: 3 }} />
      <div style={{ fontSize: 14, fontWeight: 700 }}>جاري تحميل الاختبار...</div>
    </div>
  );
}

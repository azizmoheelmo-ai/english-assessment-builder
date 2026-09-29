import { createClient } from "@/lib/supabase/server";
import { CreateForm } from "./create-form";

export default async function CreatePage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("questions").select("difficulty").eq("status", "approved");

  const counts = { easy: 0, medium: 0, hard: 0 } as Record<string, number>;
  for (const r of rows ?? []) counts[r.difficulty] = (counts[r.difficulty] ?? 0) + 1;
  const total = (rows ?? []).length;

  return (
    <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 900 }}>إنشاء اختبار جديد</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
          Mega Goal 3 · الوحدة الأولى · {total} سؤال معتمد متاح
        </div>
      </div>

      <div
        className="card"
        style={{
          background: "var(--ok-bg)",
          border: "1px solid var(--ok-border)",
          padding: "12px 16px",
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 22, height: 22, borderRadius: "50%", background: "var(--ok-dot)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}
        >
          ✓
        </div>
        <div style={{ fontSize: 12, color: "var(--ok-ink)" }} className="en">
          Easy: {counts.easy ?? 0} · Medium: {counts.medium ?? 0} · Hard: {counts.hard ?? 0} available
        </div>
      </div>

      <CreateForm total={total} />
    </div>
  );
}

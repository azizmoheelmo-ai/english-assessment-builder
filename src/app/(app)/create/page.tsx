import { createClient } from "@/lib/supabase/server";
import { generateAssessment } from "./actions";
import { SubmitButton } from "@/components/submit-button";

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

      <form action={generateAssessment} className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>عنوان الاختبار</label>
          <input className="field-input" name="title" defaultValue="Quiz — Mega Goal 3, Unit 1" required />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>عدد الأسئلة</label>
          <input className="field-input en" type="number" name="questionCount" defaultValue={20} min={1} max={total} />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>عدد النماذج (1–4)</label>
          <select className="field-select" name="modelCount" defaultValue={2}>
            <option value={1}>1 (نموذج واحد)</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>توزيع الصعوبة (%)</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="field-input en" type="number" name="pctEasy" defaultValue={50} min={0} max={100} title="Easy %" />
            <input className="field-input en" type="number" name="pctMedium" defaultValue={35} min={0} max={100} title="Medium %" />
            <input className="field-input en" type="number" name="pctHard" defaultValue={15} min={0} max={100} title="Hard %" />
          </div>
          <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>بالترتيب: Easy · Medium · Hard</div>
        </div>

        <SubmitButton idleLabel="توليد الاختبار →" pendingLabel="جاري إنشاء الاختبار..." />
      </form>
    </div>
  );
}

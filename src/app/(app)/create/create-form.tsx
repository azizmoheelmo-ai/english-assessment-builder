"use client";

import { useTransition, type FormEvent } from "react";
import { generateAssessment } from "./actions";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function CreateForm({ total }: { total: number }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const start = Date.now();
      try {
        await generateAssessment(formData);
      } finally {
        // Guarantee the "جاري الإنشاء..." state is visible for at least
        // 400ms, even if generation (or the redirect that follows it)
        // resolves almost instantly.
        const remaining = 400 - (Date.now() - start);
        if (remaining > 0) await sleep(remaining);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>عنوان الاختبار</label>
        <input className="field-input" name="title" defaultValue="Quiz — Mega Goal 3, Unit 1" required disabled={isPending} />
      </div>

      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>عدد الأسئلة</label>
        <input className="field-input en" type="number" name="questionCount" defaultValue={20} min={1} max={total} disabled={isPending} />
      </div>

      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>عدد النماذج (1–4)</label>
        <select className="field-select" name="modelCount" defaultValue={2} disabled={isPending}>
          <option value={1}>1 (نموذج واحد)</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>توزيع الصعوبة (%)</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="field-input en" type="number" name="pctEasy" defaultValue={50} min={0} max={100} title="Easy %" disabled={isPending} />
          <input className="field-input en" type="number" name="pctMedium" defaultValue={35} min={0} max={100} title="Medium %" disabled={isPending} />
          <input className="field-input en" type="number" name="pctHard" defaultValue={15} min={0} max={100} title="Hard %" disabled={isPending} />
        </div>
        <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>بالترتيب: Easy · Medium · Hard</div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isPending} style={{ justifyContent: "center", marginTop: 6 }}>
        {isPending && <span className="spinner" aria-hidden />}
        {isPending ? "جاري إنشاء الاختبار..." : "توليد الاختبار →"}
      </button>
    </form>
  );
}

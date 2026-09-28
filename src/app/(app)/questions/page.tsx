import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const DIFF_BADGE: Record<string, string> = {
  easy: "badge-easy",
  medium: "badge-medium",
  hard: "badge-hard",
};
const DIFF_LABEL: Record<string, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const STATUS_LABEL: Record<string, string> = { approved: "معتمد", draft: "مسودة", in_review: "قيد المراجعة", rejected: "مرفوض" };

type Row = {
  id: string;
  question_text: string;
  difficulty: string;
  status: string;
  objectives: { skills: { name: string } | null } | null;
};

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; skill?: string; difficulty?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("questions")
    .select("id, question_text, difficulty, status, objectives(skills(name))")
    .order("created_at", { ascending: true });

  if (params.status) query = query.eq("status", params.status);
  else query = query.eq("status", "approved");
  if (params.difficulty) query = query.eq("difficulty", params.difficulty);
  if (params.q) query = query.ilike("question_text", `%${params.q}%`);

  const { data } = (await query) as unknown as { data: Row[] | null };

  const { data: skillsList } = await supabase.from("skills").select("name").order("name");
  const uniqueSkills = Array.from(new Set((skillsList ?? []).map((s) => s.name)));

  const rows = params.skill
    ? (data ?? []).filter((r) => r.objectives?.skills?.name === params.skill)
    : data ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>بنك الأسئلة</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
            Mega Goal 3 · الوحدة الأولى · {rows.length} سؤال
          </div>
        </div>
      </div>

      <form className="filters" action="/questions">
        <input className="field-input search-box" type="text" name="q" placeholder="ابحث في نص السؤال…" defaultValue={params.q ?? ""} />
        <select className="field-select" name="skill" defaultValue={params.skill ?? ""} style={{ width: "auto" }}>
          <option value="">المهارة: الكل</option>
          {uniqueSkills.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="field-select" name="difficulty" defaultValue={params.difficulty ?? ""} style={{ width: "auto" }}>
          <option value="">الصعوبة: الكل</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select className="field-select" name="status" defaultValue={params.status ?? "approved"} style={{ width: "auto" }}>
          <option value="approved">الحالة: معتمد</option>
          <option value="draft">مسودة</option>
          <option value="in_review">قيد المراجعة</option>
        </select>
        <button className="btn btn-secondary" type="submit">تصفية</button>
      </form>

      <div className="card" style={{ flexGrow: 1, overflow: "hidden" }}>
        <div className="qrow head">
          <div className="col-id">المعرّف</div>
          <div className="col-text">نص السؤال</div>
          <div className="col-skill">المهارة</div>
          <div className="col-diff">الصعوبة</div>
          <div className="col-status">الحالة</div>
        </div>
        {rows.length === 0 && (
          <div style={{ padding: 24, fontSize: 13, color: "var(--muted)" }}>لا توجد أسئلة مطابقة لهذا التصفية.</div>
        )}
        {rows.map((q) => (
          <div className="qrow" key={q.id}>
            <div className="col-id en" style={{ fontSize: 12, color: "var(--muted)" }}>
              {q.id.slice(0, 8)}
            </div>
            <div className="col-text en" style={{ fontSize: 13 }}>{q.question_text}</div>
            <div className="col-skill" style={{ fontSize: 12 }}>{q.objectives?.skills?.name ?? "—"}</div>
            <div className="col-diff">
              <span className={`badge ${DIFF_BADGE[q.difficulty] ?? "badge-neutral"}`}>{DIFF_LABEL[q.difficulty] ?? q.difficulty}</span>
            </div>
            <div className="col-status">
              <span className="badge badge-ok">{STATUS_LABEL[q.status] ?? q.status}</span>
            </div>
          </div>
        ))}
      </div>

      <Link href="/create" className="btn btn-primary no-print" style={{ alignSelf: "flex-start" }}>
        استخدم هذه الأسئلة في اختبار →
      </Link>
    </div>
  );
}

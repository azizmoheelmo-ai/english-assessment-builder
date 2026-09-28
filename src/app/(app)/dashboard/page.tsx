import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type SkillRow = { family_id: string | null; objectives: { skills: { name: string } | null } | null };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { count: questionCount }, { data: approvedRows }, { count: assessmentCount }, { count: unitCount }, { data: recentAssessments }] =
    await Promise.all([
      user
        ? supabase.from("profiles").select("full_name").eq("id", user.id).single()
        : Promise.resolve({ data: null }),
      supabase.from("questions").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase
        .from("questions")
        .select("family_id, objectives(skills(name))")
        .eq("status", "approved") as unknown as Promise<{ data: SkillRow[] | null }>,
      supabase.from("assessments").select("id", { count: "exact", head: true }),
      supabase.from("units").select("id", { count: "exact", head: true }),
      supabase.from("assessments").select("id, title, created_at").order("created_at", { ascending: false }).limit(4),
    ]);

  const familyCount = new Set((approvedRows ?? []).map((r) => r.family_id).filter(Boolean)).size;

  const skillCounts = new Map<string, number>();
  for (const row of approvedRows ?? []) {
    const name = row.objectives?.skills?.name ?? "غير محدد";
    skillCounts.set(name, (skillCounts.get(name) ?? 0) + 1);
  }
  const maxSkillCount = Math.max(1, ...Array.from(skillCounts.values()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>صباح الخير، {profile?.full_name ?? ""}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Mega Goal 3 · الفصل الأول · الوحدة الأولى جاهزة لبناء أول اختبار
          </div>
        </div>
        <Link href="/create" className="btn btn-primary">+ إنشاء اختبار جديد</Link>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{questionCount ?? 0}</div>
          <div className="stat-label">سؤال معتمد في البنك</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{familyCount}</div>
          <div className="stat-label">عائلات أسئلة</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{assessmentCount ?? 0}</div>
          <div className="stat-label">اختبارات مُنشأة</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{unitCount ?? 0}</div>
          <div className="stat-label">وحدة مفعّلة</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>الاختبارات الأخيرة</div>
          {(recentAssessments ?? []).length === 0 && (
            <div style={{ fontSize: 13, color: "var(--muted)", padding: "12px 4px" }}>
              لا توجد اختبارات منشأة بعد — ابدأ بإنشاء أول اختبار.
            </div>
          )}
          {(recentAssessments ?? []).map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: "1px solid #EFEDE4" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)", flexShrink: 0 }} />
              <div style={{ flexGrow: 1, fontSize: 13 }}>{a.title}</div>
              <div className="en" style={{ fontSize: 12, color: "var(--faint)" }}>
                {new Date(a.created_at).toLocaleDateString("en-GB")}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>تغطية بنك الأسئلة</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from(skillCounts.entries()).map(([name, count]) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>{name}</span>
                  <span className="badge badge-ok">{count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#efede4" }}>
                  <div style={{ height: "100%", width: `${(count / maxSkillCount) * 100}%`, borderRadius: 3, background: "var(--brand)" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ flexGrow: 1 }} />
          <Link href="/questions" className="btn btn-secondary" style={{ justifyContent: "center" }}>
            عرض بنك الأسئلة كاملًا
          </Link>
        </div>
      </div>
    </div>
  );
}

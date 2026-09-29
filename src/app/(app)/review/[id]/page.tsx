import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "./print-button";
import { ModelTab, LinkPendingHint } from "./model-tab";

type QRow = {
  position: number;
  question_text_snapshot: string;
  passage_snapshot: string | null;
  options_snapshot: { label: string; text: string; is_correct: boolean }[];
};

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ model?: string; key?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, title, question_count, model_count")
    .eq("id", id)
    .single();

  const { data: models } = await supabase
    .from("assessment_models")
    .select("id, label")
    .eq("assessment_id", id)
    .order("label");

  if (!assessment || !models || models.length === 0) {
    return <div style={{ padding: 24 }}>لم يتم العثور على الاختبار.</div>;
  }

  const activeLabel = sp.model ?? models[0].label;
  const activeModel = models.find((m) => m.label === activeLabel) ?? models[0];
  const showKey = sp.key === "1";

  const { data: qs } = await supabase
    .from("assessment_questions")
    .select("position, question_text_snapshot, passage_snapshot, options_snapshot")
    .eq("model_id", activeModel.id)
    .order("position") as unknown as { data: QRow[] | null };

  const questions = qs ?? [];

  let lastPassage: string | null = null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>مراجعة الاختبار وتوليده</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }} className="en">
            {assessment.title} · {assessment.question_count} questions · {models.length} model{models.length > 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/review/${id}?model=${activeLabel}${showKey ? "" : "&key=1"}`} prefetch={false} className="btn btn-secondary">
            {showKey ? "إخفاء المفتاح" : "عرض مفتاح الإجابة"}
            <LinkPendingHint dark />
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="no-print" style={{ display: "flex", gap: 8 }}>
        {models.map((m) => (
          <ModelTab
            key={m.id}
            href={`/review/${id}?model=${m.label}${showKey ? "&key=1" : ""}`}
            active={m.label === activeLabel}
            label={`Model ${m.label}`}
          />
        ))}
      </div>

      <div className="card en" style={{ padding: "40px 48px", direction: "ltr", textAlign: "left" }} dir="ltr">
        <div style={{ borderBottom: "2px solid #1F2420", paddingBottom: 14, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span>Badr Secondary School</span>
            <span>Subject: English</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
            <span>Name: ______________________</span>
            <span>Model: {activeModel.label}</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginTop: 14 }}>{assessment.title}</div>
          <div style={{ fontSize: 12, color: "#6B6F68", textAlign: "center", marginTop: 4 }}>
            Instructions: Choose the correct answer for each question.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {questions.map((q) => {
            const showPassage = q.passage_snapshot && q.passage_snapshot !== lastPassage;
            if (q.passage_snapshot) lastPassage = q.passage_snapshot;
            return (
              <div key={q.position}>
                {showPassage && (
                  <div style={{ background: "#FBFAF7", border: "1px solid #E7E4D9", borderRadius: 8, padding: 14, marginBottom: 10, fontSize: 13, lineHeight: 1.6 }}>
                    {q.passage_snapshot}
                  </div>
                )}
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <b>{q.position}.</b> {q.question_text_snapshot}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingInlineStart: 20 }}>
                  {q.options_snapshot.map((o, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 13,
                        fontWeight: showKey && o.is_correct ? 700 : 400,
                        color: showKey && o.is_correct ? "var(--brand)" : "inherit",
                      }}
                    >
                      {o.label}. {o.text} {showKey && o.is_correct ? "✓" : ""}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showKey && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Answer Key — Model {activeModel.label}</div>
          <div className="en" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {questions.map((q) => {
              const correct = q.options_snapshot.find((o) => o.is_correct);
              return (
                <div key={q.position} style={{ fontSize: 12, width: 60 }}>
                  <b>{q.position}.</b> {correct?.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

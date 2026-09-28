"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type OptionRow = {
  id: string;
  option_label: string;
  option_text: string;
  is_correct: boolean;
  shuffleable: boolean;
  order_index: number;
};

type QuestionRow = {
  id: string;
  question_text: string;
  difficulty: "easy" | "medium" | "hard" | string;
  version: number;
  passage_id: string | null;
  question_options: OptionRow[];
};

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function generateAssessment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, school_id")
    .eq("id", user!.id)
    .single();
  if (!profile) throw new Error("لا يوجد ملف تعريف لهذا المستخدم");

  const title = String(formData.get("title") || "اختبار Unit 1");
  const totalCount = Math.max(1, Number(formData.get("questionCount") || 20));
  const modelCount = Math.min(4, Math.max(1, Number(formData.get("modelCount") || 1)));
  const pctEasy = Number(formData.get("pctEasy") || 50);
  const pctMedium = Number(formData.get("pctMedium") || 35);
  const pctHard = Number(formData.get("pctHard") || 15);

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, difficulty, version, passage_id, question_options(id, option_label, option_text, is_correct, shuffleable, order_index)")
    .eq("status", "approved") as unknown as { data: QuestionRow[] | null };

  const pool = questions ?? [];
  const byDifficulty: Record<string, QuestionRow[]> = { easy: [], medium: [], hard: [] };
  for (const q of pool) {
    if (byDifficulty[q.difficulty]) byDifficulty[q.difficulty].push(q);
  }

  let targetEasy = Math.round((pctEasy / 100) * totalCount);
  let targetMedium = Math.round((pctMedium / 100) * totalCount);
  let targetHard = totalCount - targetEasy - targetMedium;

  targetEasy = Math.min(targetEasy, byDifficulty.easy.length);
  targetMedium = Math.min(targetMedium, byDifficulty.medium.length);
  targetHard = Math.min(targetHard, byDifficulty.hard.length);

  let shortfall = totalCount - (targetEasy + targetMedium + targetHard);
  const extra: [keyof typeof byDifficulty, number][] = [
    ["medium", byDifficulty.medium.length - targetMedium],
    ["easy", byDifficulty.easy.length - targetEasy],
    ["hard", byDifficulty.hard.length - targetHard],
  ];
  for (const [key, available] of extra) {
    if (shortfall <= 0) break;
    const take = Math.min(shortfall, Math.max(0, available));
    if (key === "easy") targetEasy += take;
    if (key === "medium") targetMedium += take;
    if (key === "hard") targetHard += take;
    shortfall -= take;
  }

  const selected: QuestionRow[] = [
    ...shuffle(byDifficulty.easy, 7).slice(0, targetEasy),
    ...shuffle(byDifficulty.medium, 11).slice(0, targetMedium),
    ...shuffle(byDifficulty.hard, 13).slice(0, targetHard),
  ];

  if (selected.length === 0) {
    throw new Error("لا توجد أسئلة معتمدة متاحة لبناء الاختبار");
  }

  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .insert({
      school_id: profile.school_id,
      title,
      question_count: selected.length,
      model_count: modelCount,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (assessmentError || !assessment) throw new Error(assessmentError?.message ?? "فشل إنشاء الاختبار");

  const passageCache = new Map<string, string>();
  for (const q of selected) {
    if (q.passage_id && !passageCache.has(q.passage_id)) {
      const { data: passage } = await supabase.from("passages").select("body").eq("id", q.passage_id).single();
      passageCache.set(q.passage_id, passage?.body ?? "");
    }
  }

  const modelLabels = ["A", "B", "C", "D"].slice(0, modelCount);

  for (let m = 0; m < modelLabels.length; m++) {
    const { data: model, error: modelError } = await supabase
      .from("assessment_models")
      .insert({ school_id: profile.school_id, assessment_id: assessment.id, label: modelLabels[m] })
      .select("id")
      .single();
    if (modelError || !model) throw new Error(modelError?.message ?? "فشل إنشاء نموذج الاختبار");

    const orderedQuestions = shuffle(selected, 100 + m * 17);

    const rows = orderedQuestions.map((q, idx) => {
      const hasLockedOption = q.question_options.some((o) => !o.shuffleable);
      const optionsForModel = hasLockedOption
        ? [...q.question_options].sort((a, b) => a.order_index - b.order_index)
        : shuffle(q.question_options, 300 + m * 23 + idx);

      return {
        school_id: profile.school_id,
        model_id: model.id,
        position: idx + 1,
        question_id: q.id,
        question_text_snapshot: q.question_text,
        passage_snapshot: q.passage_id ? passageCache.get(q.passage_id) ?? null : null,
        version_snapshot: q.version,
        options_snapshot: optionsForModel.map((o) => ({
          label: o.option_label,
          text: o.option_text,
          is_correct: o.is_correct,
        })),
      };
    });

    const { error: rowsError } = await supabase.from("assessment_questions").insert(rows);
    if (rowsError) throw new Error(rowsError.message);
  }

  redirect(`/review/${assessment.id}`);
}

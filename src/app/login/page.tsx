"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Guard against double taps / double form submissions firing two
    // concurrent requests before React re-renders the disabled button.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) {
          // A duplicate/race signup attempt (e.g. a double tap) can surface
          // as a generic database error even though the account was in
          // fact created by the first request. Point the user to login
          // instead of a confusing raw error message.
          const msg = error.message?.toLowerCase() ?? "";
          if (
            msg.includes("already registered") ||
            msg.includes("already exists") ||
            msg.includes("database error saving new user")
          ) {
            setError("يبدو أن هذا البريد مسجّل بالفعل. جرّب تسجيل الدخول بدلاً من إنشاء حساب جديد.");
            setMode("login");
          } else {
            setError(error.message);
          }
          return;
        }
        if (!data.session) {
          setError("تم إنشاء الحساب! تحقق من بريدك الإلكتروني واضغط رابط التأكيد قبل تسجيل الدخول.");
          return;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--brand)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            م
          </div>
          <div style={{ fontWeight: 900, fontSize: 17 }}>منشئ الاختبارات</div>
        </div>

        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 22 }}>
          مدرسة بدر الثانوية · قسم اللغة الإنجليزية
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
                الاسم الكامل
              </label>
              <input
                className="field-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="عبدالعزيز المطيري"
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
              البريد الإلكتروني
            </label>
            <input
              className="field-input en"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
              كلمة المرور
            </label>
            <input
              className="field-input en"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              dir="ltr"
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "var(--hard-ink)", background: "var(--hard-bg)", padding: "8px 12px", borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: "center", marginTop: 6 }}>
            {loading ? "..." : mode === "login" ? "دخول" : "إنشاء الحساب"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="btn"
          style={{ background: "none", color: "var(--brand)", justifyContent: "center", width: "100%", marginTop: 10 }}
        >
          {mode === "login" ? "ليس لديك حساب؟ إنشاء حساب جديد" : "لديك حساب؟ تسجيل الدخول"}
        </button>
      </div>
    </div>
  );
}

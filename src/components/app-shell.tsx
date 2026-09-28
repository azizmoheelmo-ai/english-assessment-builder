"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "لوحة التحكم" },
  { href: "/questions", label: "بنك الأسئلة" },
  { href: "/create", label: "إنشاء اختبار" },
];

export function AppShell({
  children,
  fullName,
  roleLabel,
}: {
  children: React.ReactNode;
  fullName: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="shell">
      <button
        className="no-print"
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        style={{
          display: open ? "block" : "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.35)",
          zIndex: 30,
          border: "none",
        }}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 24px 8px" }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: 9, background: "var(--brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 900, fontSize: 16,
            }}
          >
            م
          </div>
          <div style={{ fontSize: 15, fontWeight: 900 }}>منشئ الاختبارات</div>
        </div>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`nav-item ${pathname.startsWith(item.href) ? "active" : ""}`}
          >
            <span className="nav-dot" />
            {item.label}
          </Link>
        ))}
        <div style={{ flexGrow: 1 }} />
        <button onClick={handleLogout} className="nav-item" style={{ background: "none", border: "none", textAlign: "right", width: "100%", cursor: "pointer" }}>
          <span className="nav-dot" />
          تسجيل الخروج
        </button>
      </aside>

      <div className="main">
        <div className="topbar no-print">
          <button className="burger" onClick={() => setOpen(true)} aria-label="فتح القائمة">
            ☰
          </button>
          <div className="bcrumb">مدرسة بدر الثانوية <span style={{ margin: "0 6px", color: "var(--border-strong)" }}>/</span> قسم اللغة الإنجليزية</div>
          <div style={{ flexGrow: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{fullName}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{roleLabel}</div>
            </div>
            <div
              style={{
                width: 36, height: 36, borderRadius: "50%", background: "var(--brand-tint)",
                color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {fullName?.[0] ?? "؟"}
            </div>
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

const ROLE_LABELS: Record<string, string> = {
  teacher: "معلم",
  department_head: "رئيس القسم",
  school_admin: "مدير المدرسة",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <AppShell
      fullName={profile?.full_name ?? user.email ?? "مستخدم"}
      roleLabel={ROLE_LABELS[profile?.role ?? ""] ?? ""}
    >
      {children}
    </AppShell>
  );
}

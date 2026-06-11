import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav, LogoutButton } from "@/components/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, role, workspaces(name, plan)")
    .eq("id", user.id)
    .single();

  const ws: any = profile?.workspaces;

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 z-10 hidden w-60 flex-col border-r border-line bg-white md:flex">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Link href="/dashboard" className="font-display text-base font-bold">Meeting<span className="text-accent">Prep</span></Link>
        </div>
        <SidebarNav />
        <div className="border-t border-line p-4">
          <p className="truncate text-sm font-medium">{profile?.full_name || user.email}</p>
          <p className="truncate text-xs text-ink-mute">{ws?.name} · plan {ws?.plan ?? "free"}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/ajustes" className="btn-ghost !px-2 !py-1 text-xs">Ajustes</Link>
            <LogoutButton />
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 md:pl-60">
        <MobileBar />
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
      </div>
    </div>
  );
}

function MobileBar() {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-4 overflow-x-auto border-b border-line bg-white px-4 py-3 md:hidden">
      {[
        ["Dashboard","/dashboard"],["Empresas","/empresas"],["Reuniones","/reuniones"],
        ["Pipeline","/pipeline"],["Propuestas","/propuestas"],["Tareas","/tareas"],
      ].map(([l,h]) => (
        <Link key={h} href={h} className="whitespace-nowrap text-sm font-medium text-ink-soft">{l}</Link>
      ))}
    </div>
  );
}

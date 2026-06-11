"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reuniones", label: "Reuniones" },
  { href: "/empresas", label: "Empresas" },
  { href: "/contactos", label: "Contactos" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/propuestas", label: "Propuestas" },
  { href: "/tareas", label: "Tareas" },
  { href: "/informes", label: "Informes" },
];

export function SidebarNav() {
  const path = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 px-3 py-4">
      {ITEMS.map(({ href, label }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-canvas hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
      <Link href="/reuniones/nueva" className="btn-primary mt-4 w-full">+ Nueva reunión</Link>
    </nav>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="btn-ghost !px-2 !py-1 text-xs"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}

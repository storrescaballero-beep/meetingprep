import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { PLANS } from "@/lib/plans";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("user_profiles").select("*, workspaces(*)").single();
  const ws = profile?.workspaces;
  const currentPlan = PLANS.find((p) => p.id === (ws?.plan ?? "free")) ?? PLANS[0];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ajustes" subtitle="Tu cuenta, tu workspace y tu plan." />

      <div className="card p-6">
        <h2 className="font-display text-base font-semibold">Perfil</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-ink-soft">Nombre</dt><dd className="font-medium">{profile?.full_name ?? "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-soft">Email</dt><dd className="font-medium">{user?.email}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-soft">Rol en el workspace</dt><dd className="font-medium capitalize">{profile?.role ?? "—"}</dd></div>
        </dl>
      </div>

      <div className="card mt-5 p-6">
        <h2 className="font-display text-base font-semibold">Workspace</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-ink-soft">Nombre</dt><dd className="font-medium">{ws?.name ?? "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-soft">Creado</dt><dd className="font-medium">{ws?.created_at ? new Date(ws.created_at).toLocaleDateString("es-ES") : "—"}</dd></div>
        </dl>
        <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs text-ink-mute">
          Todos los datos (empresas, contactos, reuniones, propuestas) pertenecen a este workspace y están aislados por seguridad a nivel de base de datos (RLS). Ningún otro workspace puede verlos.
        </p>
      </div>

      <div className="card mt-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Plan actual</h2>
          <span className="badge bg-accent text-white">{currentPlan.name}</span>
        </div>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
          {currentPlan.features.map((f) => <li key={f} className="flex gap-2"><span className="text-accent">✓</span>{f}</li>)}
        </ul>
        {currentPlan.id === "free" && (
          <p className="mt-4 rounded-lg bg-signal-soft px-3 py-2 text-sm text-signal">
            El plan Free incluye 3 reuniones y 3 propuestas al mes. El límite se aplica en la base de datos, no en la interfaz.
          </p>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PLANS.filter((p) => p.id !== "free").map((p) => (
            <div key={p.id} className={`rounded-xl border p-4 ${p.id === ws?.plan ? "border-accent bg-accent-soft" : "border-line"}`}>
              <p className="font-display text-sm font-semibold">{p.name}</p>
              <p className="mt-0.5 text-lg font-bold">{p.price}<span className="text-xs font-normal text-ink-mute">/mes</span></p>
            </div>
          ))}
        </div>
        <button className="btn-secondary mt-4 cursor-not-allowed opacity-60" disabled title="Stripe está preparado en el código pero no activado">
          Mejorar plan (próximamente)
        </button>
        <p className="mt-2 text-xs text-ink-mute">
          La pasarela de pago (Stripe) está preparada en el código pero desactivada en esta versión. Las variables están comentadas en <code>.env.example</code>.
        </p>
      </div>
    </div>
  );
}

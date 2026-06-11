import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { STAGES, stageLabel } from "@/lib/types";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-mute">{hint}</p>}
    </div>
  );
}

export default async function ReportsPage() {
  const supabase = createClient();
  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const [{ data: meetings }, { data: proposals }, { data: companies }, { count: pendingTasks }] = await Promise.all([
    supabase.from("meetings").select("id,created_at,opportunity_score,status"),
    supabase.from("proposals").select("id,status,created_at"),
    supabase.from("companies").select("id,pipeline_stage,opportunity_score"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "completada"),
  ]);

  const m = meetings ?? [], p = proposals ?? [], c = companies ?? [];
  const meetingsThisMonth = m.filter((x) => new Date(x.created_at) >= monthStart).length;
  const proposalsThisMonth = p.filter((x) => new Date(x.created_at) >= monthStart).length;
  const scored = m.filter((x) => x.opportunity_score != null);
  const avgScore = scored.length ? Math.round(scored.reduce((a, x) => a + (x.opportunity_score ?? 0), 0) / scored.length) : null;
  const sent = p.filter((x) => ["enviada", "aceptada", "rechazada"].includes(x.status)).length;
  const sentRate = p.length ? Math.round((sent / p.length) * 100) : null;
  const won = c.filter((x) => x.pipeline_stage === "ganado").length;
  const lost = c.filter((x) => x.pipeline_stage === "perdido").length;
  const byStage = STAGES.map((s) => ({ id: s.id, label: s.label, count: c.filter((x) => x.pipeline_stage === s.id).length }));
  const maxStage = Math.max(1, ...byStage.map((s) => s.count));

  return (
    <div>
      <PageHeader title="Informes" subtitle="Una foto honesta de tu actividad comercial. Sin métricas de vanidad." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Reuniones este mes" value={meetingsThisMonth} hint={`${m.length} en total`} />
        <Stat label="Propuestas este mes" value={proposalsThisMonth} hint={`${p.length} en total`} />
        <Stat label="Scoring medio" value={avgScore != null ? `${avgScore}/100` : "—"} hint={scored.length ? `sobre ${scored.length} reuniones puntuadas` : "puntúa reuniones para verlo"} />
        <Stat label="Tareas pendientes" value={pendingTasks ?? 0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-base font-semibold">Oportunidades por estado</h2>
          <div className="mt-4 space-y-2.5">
            {byStage.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-sm text-ink-soft">{s.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-canvas">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / maxStage) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-sm font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-base font-semibold">Propuestas</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">Generadas</dt><dd className="font-semibold">{p.length}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Enviadas (o con respuesta)</dt><dd className="font-semibold">{sent}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Tasa de envío</dt><dd className="font-semibold">{sentRate != null ? `${sentRate}%` : "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Aceptadas</dt><dd className="font-semibold text-accent">{p.filter((x) => x.status === "aceptada").length}</dd></div>
            </dl>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-base font-semibold">Resultado</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">{stageLabel("ganado")}</dt><dd className="font-semibold text-accent">{won}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">{stageLabel("perdido")}</dt><dd className="font-semibold text-danger">{lost}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Ratio ganado/perdido</dt><dd className="font-semibold">{won + lost > 0 ? `${Math.round((won / (won + lost)) * 100)}%` : "—"}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

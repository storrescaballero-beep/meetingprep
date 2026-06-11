import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader, ScoreBadge, StageBadge } from "@/components/ui";
import { STAGES, stageLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createClient();
  const now = new Date().toISOString();

  const [companies, meetings, proposals, tasks, hot, activity] = await Promise.all([
    supabase.from("companies").select("id, pipeline_stage", { count: "exact" }),
    supabase.from("meetings").select("id, title, meeting_date, status, companies(name)").gte("meeting_date", now).order("meeting_date").limit(5),
    supabase.from("proposals").select("id", { count: "exact", head: true }),
    supabase.from("tasks").select("id, title, due_date, priority, companies(name)").neq("status", "completada").order("due_date", { ascending: true, nullsFirst: false }).limit(5),
    supabase.from("companies").select("id, name, opportunity_score, pipeline_stage").gte("opportunity_score", 60).not("pipeline_stage", "in", "(ganado,perdido)").order("opportunity_score", { ascending: false }).limit(5),
    supabase.from("activity_log").select("entity_type, action, detail, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const totalCompanies = companies.count ?? 0;
  if (totalCompanies === 0) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Tu actividad comercial, de un vistazo." />
        <EmptyState
          title="Empieza por aquí"
          body="Crea tu primera empresa para preparar una reunión comercial. En menos de cinco minutos tendrás preparación, preguntas y roleplay listos."
          cta="Crear mi primera empresa"
          href="/empresas/nueva"
        />
      </>
    );
  }

  const byStage = STAGES.map((s) => ({
    ...s,
    count: (companies.data ?? []).filter((c) => c.pipeline_stage === s.id).length,
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Tu actividad comercial, de un vistazo."
        action={
          <div className="flex gap-2">
            <Link href="/empresas/nueva" className="btn-secondary">+ Empresa</Link>
            <Link href="/reuniones/nueva" className="btn-primary">+ Nueva reunión</Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Empresas activas" value={totalCompanies} href="/empresas" />
        <Stat label="Propuestas generadas" value={proposals.count ?? 0} href="/propuestas" />
        <Stat label="Tareas pendientes" value={tasks.data?.length ?? 0} href="/tareas" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <SectionTitle title="Próximas reuniones" href="/reuniones" />
          {meetings.data?.length ? (
            <ul className="mt-3 divide-y divide-line">
              {meetings.data.map((m: any) => (
                <li key={m.id} className="py-2.5">
                  <Link href={`/reuniones/${m.id}`} className="flex items-center justify-between gap-3 text-sm hover:text-accent">
                    <span className="truncate font-medium">{m.title}</span>
                    <span className="shrink-0 text-xs text-ink-mute">
                      {m.companies?.name} · {m.meeting_date ? new Date(m.meeting_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "sin fecha"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Hint text="No tienes reuniones próximas. Prepara la siguiente con tiempo." cta="Crear reunión" href="/reuniones/nueva" />
          )}
        </section>

        <section className="card p-5">
          <SectionTitle title="Oportunidades calientes" href="/pipeline" />
          {hot.data?.length ? (
            <ul className="mt-3 divide-y divide-line">
              {hot.data.map((c: any) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/empresas/${c.id}`} className="truncate font-medium hover:text-accent">{c.name}</Link>
                  <span className="flex shrink-0 items-center gap-2"><StageBadge stage={c.pipeline_stage} /><ScoreBadge score={c.opportunity_score} /></span>
                </li>
              ))}
            </ul>
          ) : (
            <Hint text="No persigas oportunidades débiles. Puntúalas tras cada reunión y aquí verás las que merecen tu semana." />
          )}
        </section>

        <section className="card p-5">
          <SectionTitle title="Tareas pendientes" href="/tareas" />
          {tasks.data?.length ? (
            <ul className="mt-3 divide-y divide-line">
              {tasks.data.map((t: any) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="truncate">{t.title}</span>
                  <span className="shrink-0 text-xs text-ink-mute">
                    {t.companies?.name ? `${t.companies.name} · ` : ""}{t.due_date ? new Date(t.due_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "sin fecha"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Hint text="Sin tareas pendientes. Cada reunión debería terminar con un próximo paso con fecha." />
          )}
        </section>

        <section className="card p-5">
          <SectionTitle title="Pipeline por estado" href="/pipeline" />
          <ul className="mt-3 space-y-2">
            {byStage.filter((s) => s.count > 0).map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <StageBadge stage={s.id} />
                <span className="font-display font-semibold">{s.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card mt-5 p-5">
        <SectionTitle title="Última actividad" />
        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
          {(activity.data ?? []).map((a: any, i: number) => (
            <li key={i}>
              <span className="text-ink-mute">{new Date(a.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>{" "}
              — {labelEntity(a.entity_type)} {labelAction(a.action)}{a.detail ? ` (${a.detail.split(" → ").map(stageLabel).join(" → ")})` : ""}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card p-5 transition-shadow hover:shadow-lift">
      <p className="text-sm text-ink-mute">{label}</p>
      <p className="font-display mt-1 text-3xl font-extrabold">{value}</p>
    </Link>
  );
}
function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">{title}</h2>
      {href && <Link href={href} className="text-xs font-medium text-accent">Ver todo →</Link>}
    </div>
  );
}
function Hint({ text, cta, href }: { text: string; cta?: string; href?: string }) {
  return (
    <div className="mt-3 rounded-lg bg-canvas p-4 text-sm text-ink-mute">
      {text} {cta && href && <Link href={href} className="font-medium text-accent">{cta} →</Link>}
    </div>
  );
}
const labelEntity = (e: string) => ({ companies: "Empresa", contacts: "Contacto", meetings: "Reunión", proposals: "Propuesta", tasks: "Tarea" } as any)[e] ?? e;
const labelAction = (a: string) => ({ created: "creada", updated: "actualizada", deleted: "eliminada", stage_changed: "cambió de estado" } as any)[a] ?? a;

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScoreBadge } from "@/components/ui";
import { stageLabel } from "@/lib/types";
import { StageSelect, ResearchPanel, ContactQuickForm } from "./panels";

export const dynamic = "force-dynamic";

export default async function EmpresaDetalle({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: company } = await supabase.from("companies").select("*").eq("id", params.id).single();
  if (!company) notFound();

  const [contacts, meetings, proposals, tasks, research, activity] = await Promise.all([
    supabase.from("contacts").select("*").eq("company_id", company.id).order("created_at"),
    supabase.from("meetings").select("id,title,meeting_date,status,meeting_type").eq("company_id", company.id).order("meeting_date", { ascending: false }),
    supabase.from("proposals").select("id,title,status,created_at").eq("company_id", company.id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("id,title,due_date,priority,status").eq("company_id", company.id).neq("status","completada").order("due_date"),
    supabase.from("research_notes").select("*").eq("company_id", company.id).order("created_at", { ascending: false }),
    supabase.from("activity_log").select("action,detail,entity_type,created_at").eq("workspace_id", company.workspace_id).order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/empresas" className="text-xs text-ink-mute hover:text-accent">← Empresas</Link>
          <h1 className="font-display mt-1 text-2xl font-bold">{company.name}</h1>
          <p className="mt-1 text-sm text-ink-mute">
            {[company.sector, company.country, company.size].filter(Boolean).join(" · ") || "Completa la ficha para preparar mejor."}
            {company.website && <> · <a className="text-accent" href={`https://${company.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer">{company.website}</a></>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBadge score={company.opportunity_score} />
          <StageSelect companyId={company.id} current={company.pipeline_stage} />
          <Link href={`/reuniones/nueva?company=${company.id}`} className="btn-primary">+ Reunión</Link>
        </div>
      </div>

      {(company.description || company.pain_hypothesis) && (
        <div className="card mb-5 grid gap-4 p-5 md:grid-cols-2">
          {company.description && <div><p className="label">Descripción</p><p className="text-sm text-ink-soft">{company.description}</p></div>}
          {company.pain_hypothesis && <div><p className="label">Hipótesis de dolor</p><p className="text-sm text-ink-soft">{company.pain_hypothesis}</p></div>}
          <p className="text-xs text-ink-mute md:col-span-2">Fuente: {company.source ?? "manual"} · Confianza: {company.confidence_score ?? "no verificado"}</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">Contactos</h2>
          {contacts.data?.length ? (
            <ul className="mt-3 divide-y divide-line">
              {contacts.data.map((c: any) => (
                <li key={c.id} className="py-2.5 text-sm">
                  <p className="font-medium">{c.full_name} {c.job_title && <span className="font-normal text-ink-mute">· {c.job_title}</span>}</p>
                  <p className="text-xs text-ink-mute">
                    {c.email ?? "Email: no verificado"} · {c.phone ?? "Tel.: no verificado"}
                    {c.linkedin_url && <> · <a className="text-accent" href={c.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn</a></>}
                  </p>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 rounded-lg bg-canvas p-3 text-sm text-ink-mute">Añade con quién te reúnes. Sin interlocutor no hay reunión que preparar.</p>}
          <ContactQuickForm companyId={company.id} workspaceId={company.workspace_id} />
        </section>

        <section className="card p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">Reuniones</h2>
          {meetings.data?.length ? (
            <ul className="mt-3 divide-y divide-line">
              {meetings.data.map((m: any) => (
                <li key={m.id} className="py-2.5 text-sm">
                  <Link href={`/reuniones/${m.id}`} className="font-medium hover:text-accent">{m.title}</Link>
                  <p className="text-xs text-ink-mute">{m.meeting_date ? new Date(m.meeting_date).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }) : "Sin fecha"} · {m.meeting_type} · {m.status}</p>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 rounded-lg bg-canvas p-3 text-sm text-ink-mute">Aún no hay reuniones con esta empresa. <Link href={`/reuniones/nueva?company=${company.id}`} className="font-medium text-accent">Prepara la primera →</Link></p>}
        </section>

        <section className="card p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">Propuestas</h2>
          {proposals.data?.length ? (
            <ul className="mt-3 divide-y divide-line">
              {proposals.data.map((p: any) => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link href={`/propuestas/${p.id}`} className="font-medium hover:text-accent">{p.title}</Link>
                  <span className="badge bg-canvas text-ink-soft">{p.status}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 rounded-lg bg-canvas p-3 text-sm text-ink-mute">Las propuestas se generan desde las notas de una reunión realizada.</p>}
        </section>

        <section className="card p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">Tareas abiertas</h2>
          {tasks.data?.length ? (
            <ul className="mt-3 divide-y divide-line">
              {tasks.data.map((t: any) => (
                <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{t.title}</span>
                  <span className="text-xs text-ink-mute">{t.priority}{t.due_date ? ` · ${new Date(t.due_date).toLocaleDateString("es-ES")}` : ""}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 rounded-lg bg-canvas p-3 text-sm text-ink-mute">Sin tareas abiertas para esta cuenta.</p>}
        </section>
      </div>

      <ResearchPanel company={company} notes={research.data ?? []} />

      <section className="card mt-5 p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">Actividad reciente del workspace</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
          {(activity.data ?? []).map((a: any, i: number) => (
            <li key={i}><span className="text-ink-mute">{new Date(a.created_at).toLocaleDateString("es-ES")}</span> — {a.entity_type} {a.action}{a.detail ? ` (${a.detail.split(" → ").map(stageLabel).join(" → ")})` : ""}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

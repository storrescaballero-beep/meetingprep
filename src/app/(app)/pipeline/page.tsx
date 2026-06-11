import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/ui";
import PipelineBoard from "./board";

export default async function PipelinePage() {
  const supabase = createClient();
  const [{ data: companies }, { data: contacts }, { data: tasks }, { data: activity }] = await Promise.all([
    supabase.from("companies").select("id,name,pipeline_stage,opportunity_score,updated_at").order("updated_at", { ascending: false }),
    supabase.from("contacts").select("id,company_id,full_name,job_title"),
    supabase.from("tasks").select("id,company_id,title,due_date,status").neq("status", "completada").order("due_date", { ascending: true }),
    supabase.from("activity_log").select("company_id,created_at").order("created_at", { ascending: false }).limit(500),
  ]);

  if (!companies?.length) {
    return (
      <div>
        <PageHeader title="Pipeline" subtitle="Tu embudo comercial, de nuevo contacto a ganado." />
        <EmptyState title="El pipeline está vacío" body="Crea tu primera empresa y aparecerá aquí como «Nuevo contacto»." cta="Crear empresa" href="/empresas/nueva" />
      </div>
    );
  }

  const firstContact: Record<string, any> = {};
  for (const c of contacts ?? []) if (!firstContact[c.company_id]) firstContact[c.company_id] = c;
  const nextTask: Record<string, any> = {};
  for (const t of tasks ?? []) if (!nextTask[t.company_id]) nextTask[t.company_id] = t;
  const lastActivity: Record<string, string> = {};
  for (const a of activity ?? []) if (a.company_id && !lastActivity[a.company_id]) lastActivity[a.company_id] = a.created_at;

  const cards = companies.map((c) => ({
    ...c,
    contact: firstContact[c.id] ?? null,
    next_task: nextTask[c.id] ?? null,
    last_activity: lastActivity[c.id] ?? null,
  }));

  return (
    <div>
      <PageHeader title="Pipeline" subtitle="Mueve cada empresa de estado con el selector de su tarjeta." />
      <PipelineBoard initial={cards} />
    </div>
  );
}

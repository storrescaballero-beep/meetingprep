"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ErrorNote } from "@/components/ui";

const PRIORITY_CLS: Record<string, string> = { alta: "bg-danger/10 text-danger", media: "bg-signal-soft text-signal", baja: "bg-canvas text-ink-mute" };
const STATUS_LABEL: Record<string, string> = { pendiente: "Pendiente", en_progreso: "En progreso", completada: "Completada" };

export default function TasksClient({ initial, companies, workspaceId }: { initial: any[]; companies: any[]; workspaceId: string }) {
  const supabase = createClient();
  const [tasks, setTasks] = useState(initial);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [priority, setPriority] = useState("media");
  const [due, setDue] = useState("");
  const [creating, setCreating] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true); setError("");
    const row = { workspace_id: workspaceId, company_id: companyId || null, title: title.trim(), priority, due_date: due || null };
    const { data, error } = await supabase.from("tasks").insert(row).select("*, companies(name)").single();
    setCreating(false);
    if (error) return setError("No se pudo crear la tarea.");
    setTasks([data, ...tasks]);
    setTitle(""); setCompanyId(""); setPriority("media"); setDue("");
  }

  async function setStatus(id: string, status: string) {
    const prev = tasks;
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
    const { error } = await supabase.from("tasks").update({ status, completed_at: status === "completada" ? new Date().toISOString() : null }).eq("id", id);
    if (error) { setTasks(prev); setError("No se pudo actualizar la tarea."); }
  }

  const pending = tasks.filter((t) => t.status !== "completada");
  const done = tasks.filter((t) => t.status === "completada");

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <form onSubmit={create} className="card h-fit p-5">
        <h2 className="font-display text-base font-semibold">Nueva tarea</h2>
        <label className="label mt-4">Título *</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ej. Enviar propuesta a Acme antes del viernes" required />
        <label className="label mt-3">Empresa (opcional)</label>
        <select className="input" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          <option value="">— Sin empresa —</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="label">Prioridad</label>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option>
            </select>
          </div>
          <div>
            <label className="label">Fecha límite</label>
            <input type="date" className="input" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>
        <button className="btn-primary mt-4 w-full" disabled={creating}>{creating ? "Creando…" : "Crear tarea"}</button>
        <ErrorNote message={error} />
      </form>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-mute">Pendientes ({pending.length})</h2>
          {!pending.length && <p className="card px-4 py-6 text-center text-sm text-ink-mute">Nada pendiente. Las tareas sugeridas por la IA tras una reunión aparecerán aquí.</p>}
          <div className="space-y-2">
            {pending.map((t) => (
              <div key={t.id} className="card flex flex-wrap items-center gap-3 px-4 py-3">
                <input type="checkbox" className="h-4 w-4 accent-accent" checked={false} onChange={() => setStatus(t.id, "completada")} title="Marcar completada" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-ink-mute">
                    {t.companies?.name && <Link href={`/empresas/${t.company_id}`} className="hover:text-accent">{t.companies.name}</Link>}
                    {t.companies?.name && t.due_date && " · "}
                    {t.due_date && <>vence {new Date(t.due_date).toLocaleDateString("es-ES")}</>}
                  </p>
                </div>
                <span className={`badge ${PRIORITY_CLS[t.priority]}`}>{t.priority}</span>
                <select className="input !w-auto !py-1.5 text-xs" value={t.status} onChange={(e) => setStatus(t.id, e.target.value)}>
                  {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>

        {done.length > 0 && (
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-mute">Completadas ({done.length})</h2>
            <div className="space-y-2">
              {done.map((t) => (
                <div key={t.id} className="card flex items-center gap-3 px-4 py-3 opacity-60">
                  <input type="checkbox" className="h-4 w-4 accent-accent" checked onChange={() => setStatus(t.id, "pendiente")} title="Reabrir" />
                  <p className="flex-1 text-sm line-through">{t.title}</p>
                  {t.companies?.name && <span className="text-xs text-ink-mute">{t.companies.name}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

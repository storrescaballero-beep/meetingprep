"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { aiCall } from "@/lib/ai/client";
import { ErrorNote, OutputEditor, Spinner } from "@/components/ui";
import { STAGES } from "@/lib/types";

export function StageSelect({ companyId, current }: { companyId: string; current: string }) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  return (
    <select
      className="input !w-auto"
      value={value}
      aria-label="Estado comercial"
      onChange={async (e) => {
        const next = e.target.value;
        setValue(next);
        await createClient().from("companies").update({ pipeline_stage: next }).eq("id", companyId);
        router.refresh();
      }}
    >
      {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
    </select>
  );
}

export function ContactQuickForm({ companyId, workspaceId }: { companyId: string; workspaceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", job_title: "", email: "", phone: "", linkedin_url: "", source: "manual", confidence_score: "no_verificado", consent_notes: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  if (!open) return <button className="btn-secondary mt-4 w-full" onClick={() => setOpen(true)}>+ Añadir contacto</button>;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) { setError("El nombre es obligatorio."); return; }
    setLoading(true); setError("");
    const payload: any = { ...form, full_name: form.full_name.trim(), company_id: companyId, workspace_id: workspaceId };
    for (const k of ["email","phone","linkedin_url","job_title","consent_notes"]) if (!payload[k]) payload[k] = null;
    const { error } = await createClient().from("contacts").insert(payload);
    setLoading(false);
    if (error) { setError("No se pudo guardar el contacto."); return; }
    setOpen(false);
    setForm({ full_name: "", job_title: "", email: "", phone: "", linkedin_url: "", source: "manual", confidence_score: "no_verificado", consent_notes: "" });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-lg bg-canvas p-4">
      <p className="rounded-lg bg-signal-soft px-3 py-2 text-xs text-signal">
        Introduce únicamente datos profesionales que tengas derecho a tratar. No añadas datos sensibles ni información no verificada.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="input" placeholder="Nombre completo *" value={form.full_name} onChange={set("full_name")} required maxLength={200} />
        <input className="input" placeholder="Cargo" value={form.job_title} onChange={set("job_title")} />
        <input className="input" type="email" placeholder="Email (solo si está verificado)" value={form.email} onChange={set("email")} />
        <input className="input" placeholder="Teléfono (solo si está verificado)" value={form.phone} onChange={set("phone")} />
        <input className="input md:col-span-2" type="url" placeholder="URL de LinkedIn (opcional)" value={form.linkedin_url} onChange={set("linkedin_url")} />
        <input className="input" placeholder="Fuente (LinkedIn, web, evento…)" value={form.source} onChange={set("source")} />
        <select className="input" value={form.confidence_score} onChange={set("confidence_score")}>
          <option value="no_verificado">No verificado</option>
          <option value="parcial">Parcialmente verificado</option>
          <option value="verificado">Verificado</option>
        </select>
        <input className="input md:col-span-2" placeholder="Base legal / consentimiento (ej.: interés legítimo, cliente actual)" value={form.consent_notes} onChange={set("consent_notes")} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
        <button className="btn-primary" disabled={loading}>{loading ? "Guardando…" : "Guardar contacto"}</button>
      </div>
      <ErrorNote message={error} />
    </form>
  );
}

const RESEARCH_SECTIONS = [
  { key: "resumen_comercial", label: "Resumen comercial", kind: "text" as const },
  { key: "contexto_sector", label: "Contexto de sector (general)", kind: "lines" as const },
  { key: "angulos_de_entrada", label: "Ángulos de entrada", kind: "lines" as const },
  { key: "informacion_que_falta", label: "Información que falta por verificar", kind: "lines" as const },
];

export function ResearchPanel({ company, notes }: { company: any; notes: any[] }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [source, setSource] = useState("manual");
  const [sourceUrl, setSourceUrl] = useState("");
  const [confidence, setConfidence] = useState("no_verificado");
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"save" | "ai" | null>(null);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading("save"); setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("research_notes").insert({
      workspace_id: company.workspace_id, company_id: company.id,
      content: content.trim().slice(0, 8000), source, source_url: sourceUrl || null,
      confidence, created_by: user!.id,
    });
    setLoading(null);
    if (error) { setError("No se pudo guardar la nota de research."); return; }
    setContent(""); setSourceUrl("");
    router.refresh();
  }

  async function generateSummary() {
    setLoading("ai"); setError("");
    const { data, error } = await aiCall({
      action: "company_research",
      payload: {
        empresa: { nombre: company.name, web: company.website, sector: company.sector, pais: company.country, tamano: company.size, descripcion: company.description, hipotesis_dolor: company.pain_hypothesis },
        notas_research: notes.map((n) => ({ contenido: n.content, fuente: n.source, url: n.source_url, confianza: n.confidence, fecha: n.collected_at })),
      },
    });
    setLoading(null);
    if (error) { setError(error); return; }
    setSummary(data);
  }

  async function saveSummaryToCompany() {
    if (!summary) return;
    await createClient().from("companies").update({
      description: summary.resumen_comercial?.slice(0, 2000) ?? company.description,
      confidence_score: summary.nivel_confianza ?? company.confidence_score,
    }).eq("id", company.id);
    router.refresh();
  }

  return (
    <section className="card mt-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">Research</h2>
          <p className="mt-1 text-xs text-ink-mute">
            Información pública o introducida manualmente, siempre con fuente, fecha y nivel de confianza. MeetingPrep no inventa datos ni hace scraping.
          </p>
        </div>
        <button className="btn-secondary" onClick={generateSummary} disabled={loading === "ai" || notes.length === 0}>
          {loading === "ai" ? <Spinner label="Analizando…" /> : "Generar resumen comercial"}
        </button>
      </div>

      <form onSubmit={addNote} className="mt-4 space-y-3 rounded-lg bg-canvas p-4">
        <textarea className="input" rows={3} maxLength={8000} placeholder="Pega aquí información pública relevante: nota de prensa, sección de la web corporativa, dato del registro mercantil, post del interlocutor…" value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="grid gap-3 md:grid-cols-3">
          <select className="input" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Fuente">
            <option value="manual">Entrada manual</option>
            <option value="web_publica">Web pública</option>
            <option value="prensa">Prensa</option>
            <option value="linkedin">LinkedIn (perfil público)</option>
            <option value="registro_mercantil">Registro mercantil</option>
          </select>
          <input className="input" type="url" placeholder="URL de la fuente (opcional)" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          <select className="input" value={confidence} onChange={(e) => setConfidence(e.target.value)} aria-label="Confianza">
            <option value="no_verificado">No verificado</option>
            <option value="parcial">Parcialmente verificado</option>
            <option value="verificado">Verificado</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={loading === "save" || !content.trim()}>{loading === "save" ? "Guardando…" : "Guardar nota"}</button>
        </div>
      </form>

      {notes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg border border-line p-3 text-sm">
              <p className="text-ink-soft">{n.content}</p>
              <p className="mt-1.5 text-xs text-ink-mute">
                {n.source}{n.source_url && <> · <a href={n.source_url} className="text-accent" target="_blank" rel="noopener noreferrer">fuente</a></>} · {n.confidence} · {new Date(n.collected_at).toLocaleDateString("es-ES")}
              </p>
            </li>
          ))}
        </ul>
      )}

      {summary && (
        <div className="mt-5 rounded-lg border border-accent/30 bg-accent-soft/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">Resumen comercial generado</h3>
            <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={saveSummaryToCompany}>Guardar en la ficha</button>
          </div>
          <OutputEditor sections={RESEARCH_SECTIONS} data={summary} onChange={setSummary} />
        </div>
      )}
      <ErrorNote message={error} />
    </section>
  );
}

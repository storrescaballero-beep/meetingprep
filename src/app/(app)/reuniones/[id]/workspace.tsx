"use client";
import { pdf } from "@react-pdf/renderer";
import { ReunionPDFDocument } from "@/components/pdf-reunion";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { aiCall } from "@/lib/ai/client";
import { PERSONAS, MEETING_TYPES, RELATIONSHIP_LEVELS, stageLabel } from "@/lib/types";
import { OutputEditor, SectionDef, Spinner, ErrorNote, CopyButton, ScoreBadge } from "@/components/ui";

const TABS = ["Preparación", "Roleplay", "Notas", "Propuesta", "Emails"] as const;
type Tab = (typeof TABS)[number];

const PREP_SECTIONS: SectionDef[] = [
  { key: "resumen_ejecutivo", label: "Resumen ejecutivo", kind: "text" },
  { key: "hipotesis_negocio", label: "Hipótesis de negocio", kind: "lines" },
  { key: "posibles_dolores", label: "Posibles dolores", kind: "lines" },
  { key: "riesgos_reunion", label: "Riesgos de la reunión", kind: "lines" },
  { key: "mapa_poder", label: "Mapa de poder probable", kind: "text" },
  { key: "preguntas_discovery", label: "Preguntas de discovery", kind: "lines" },
  { key: "preguntas_estrategicas", label: "Preguntas estratégicas", kind: "lines" },
  { key: "preguntas_incomodas", label: "Preguntas incómodas (pero útiles)", kind: "lines" },
  { key: "objeciones_probables", label: "Objeciones probables y respuesta", kind: "objects" },
  { key: "apertura_sugerida", label: "Apertura sugerida", kind: "text" },
  { key: "cierre_recomendado", label: "Cierre recomendado", kind: "text" },
  { key: "siguiente_paso_ideal", label: "Siguiente paso ideal", kind: "text" },
  { key: "checklist", label: "Checklist previa", kind: "lines" },
];

const NOTES_SECTIONS: SectionDef[] = [
  { key: "resumen_ejecutivo", label: "Resumen ejecutivo", kind: "text" },
  { key: "necesidad_detectada", label: "Necesidad detectada", kind: "text" },
  { key: "dolor_principal", label: "Dolor principal", kind: "text" },
  { key: "urgencia", label: "Urgencia", kind: "text" },
  { key: "presupuesto", label: "Presupuesto / señales económicas", kind: "text" },
  { key: "decisores", label: "Decisores e influenciadores", kind: "lines" },
  { key: "objeciones", label: "Objeciones", kind: "lines" },
  { key: "riesgos", label: "Riesgos", kind: "lines" },
  { key: "senales_de_compra", label: "Señales de compra", kind: "lines" },
  { key: "proximos_pasos", label: "Próximos pasos", kind: "lines" },
  { key: "recomendacion_comercial", label: "Recomendación comercial", kind: "text" },
];

const FEEDBACK_SECTIONS: SectionDef[] = [
  { key: "que_hizo_bien", label: "Qué hiciste bien", kind: "lines" },
  { key: "que_hizo_mal", label: "Qué se puede mejorar", kind: "lines" },
  { key: "preguntas_que_faltaron", label: "Preguntas que faltaron", kind: "lines" },
  { key: "senales_de_compra", label: "Señales de compra detectadas", kind: "lines" },
  { key: "objeciones_mal_gestionadas", label: "Objeciones mal gestionadas", kind: "lines" },
  { key: "que_hacer_diferente", label: "Qué hacer diferente la próxima vez", kind: "lines" },
  { key: "recomendacion_principal", label: "Recomendación principal", kind: "text" },
  { key: "proxima_frase", label: "Frase concreta para la próxima reunión", kind: "text" },
];

function companyContext(company: any, contact: any, meeting: any) {
  return {
    empresa: {
      nombre: company?.name, web: company?.website, sector: company?.sector, pais: company?.country,
      tamano: company?.size, descripcion: company?.description, hipotesis_dolor: company?.pain_hypothesis,
      estado_pipeline: stageLabel(company?.pipeline_stage ?? "nuevo"),
    },
    contacto: contact ? { nombre: contact.full_name, cargo: contact.job_title } : null,
    reunion: {
      titulo: meeting.title,
      tipo: MEETING_TYPES.find((t) => t.id === meeting.meeting_type)?.label ?? meeting.meeting_type,
      nivel_relacion: RELATIONSHIP_LEVELS.find((r) => r.id === meeting.relationship_level)?.label ?? meeting.relationship_level,
      objetivo: meeting.objective, servicio_que_vendo: meeting.service_offering, contexto_previo: meeting.prior_context,
      duracion_minutos: meeting.duration_minutes,
    },
  };
}

export default function MeetingWorkspace({ meeting, company, contact }: { meeting: any; company: any; contact: any }) {
  const [tab, setTab] = useState<Tab>("Preparación");
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs text-ink-mute">
          <Link href="/reuniones" className="hover:text-accent">Reuniones</Link> /{" "}
          <Link href={`/empresas/${company.id}`} className="hover:text-accent">{company.name}</Link>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight">{meeting.title}</h1>
          <ScoreBadge score={meeting.opportunity_score} />
        </div>
        <p className="mt-1 text-sm text-ink-mute">
          {contact ? `Con ${contact.full_name}${contact.job_title ? ` (${contact.job_title})` : ""} · ` : ""}
          {meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }) : "Sin fecha"}
        </p>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-line">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${tab === t ? "bg-ink text-white" : "text-ink-soft hover:bg-canvas"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Preparación" && <PrepTab meeting={meeting} company={company} contact={contact} />}
      {tab === "Roleplay" && <RoleplayTab meeting={meeting} company={company} contact={contact} />}
      {tab === "Notas" && <NotesTab meeting={meeting} company={company} contact={contact} />}
      {tab === "Propuesta" && <ProposalTab meeting={meeting} company={company} contact={contact} />}
      {tab === "Emails" && <EmailsTab meeting={meeting} company={company} contact={contact} />}
    </div>
  );
}

/* ---------------- Preparación ---------------- */
function PrepTab({ meeting, company, contact }: any) {
  const supabase = createClient();
  const [data, setData] = useState<Record<string, unknown> | null>(meeting.preparation_output ?? null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
async function downloadPreparationPDF() {
    if (!data) return;
    const doc = ReunionPDFDocument({ company, meeting, contact, preparation: data });
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Preparacion_${company.name}_${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function generate() {
    setLoading(true); setError(""); setSaved(false);
    const res = await aiCall<Record<string, unknown>>({ action: "meeting_prep", payload: companyContext(company, contact, meeting) });
    setLoading(false);
    if (res.error) return setError(res.error);
    setData(res.data!);
  }
  async function save() {
    if (!data) return;
    setSaving(true); setError("");
    const { error } = await supabase.from("meetings")
      .update({ preparation_output: data, status: meeting.status === "borrador" ? "preparada" : meeting.status })
      .eq("id", meeting.id);
    setSaving(false);
    if (error) return setError("No se pudo guardar la preparación.");
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Preparación de la reunión</h2>
          <p className="text-sm text-ink-mute">Generada a partir de los datos reales de la ficha. Edita lo que quieras antes de guardar.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={generate} disabled={loading}>
            {data ? "Regenerar" : "Generar preparación"}
          </button>
          {data && <button className="btn-primary" onClick={save} disabled={saving}>{saved ? "Guardado ✓" : "Guardar"}</button>}
       {data && <button className="btn-secondary" onClick={downloadPreparationPDF}>📥 Descargar PDF</button>}
	 </div>
      </div>
      {loading && <Spinner label="Preparando la reunión…" />}
      <ErrorNote message={error} />
      {!data && !loading && (
        <p className="rounded-lg bg-canvas px-4 py-3 text-sm text-ink-soft">
          Aún no hay preparación. Cuantos más datos tenga la ficha de {company.name} (descripción, hipótesis de dolor, research), más específica será.
        </p>
      )}
      {data && !loading && <OutputEditor sections={PREP_SECTIONS} data={data} onChange={setData} />}
    </div>
  );
}

/* ---------------- Roleplay ---------------- */
type ChatMsg = { role: "user" | "assistant"; content: string };

function RoleplayTab({ meeting, company, contact }: any) {
  const supabase = createClient();
  const [persona, setPersona] = useState<string>(meeting.roleplay_output?.persona ?? "Escéptico");
  const [history, setHistory] = useState<ChatMsg[]>(meeting.roleplay_output?.history ?? []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, unknown> | null>(meeting.roleplay_output?.feedback ?? null);
  const [error, setError] = useState("");
  const started = history.length > 0;
  const bottomRef = useRef<HTMLDivElement>(null);

  const payload = useMemo(() => companyContext(company, contact, meeting), [company, contact, meeting]);

  async function start() {
    setLoading(true); setError(""); setFeedback(null);
    const res = await aiCall<{ reply: string }>({ action: "roleplay", payload, persona, history: [] });
    setLoading(false);
    if (res.error) return setError(res.error);
    setHistory([{ role: "assistant", content: res.data!.reply }]);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMsg[] = [...history, { role: "user", content: text }];
    setHistory(next); setInput(""); setLoading(true); setError("");
    const res = await aiCall<{ reply: string }>({ action: "roleplay", payload, persona, history: next });
    setLoading(false);
    if (res.error) return setError(res.error);
    setHistory([...next, { role: "assistant", content: res.data!.reply }]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function finish() {
    if (history.length < 2) return setError("Conversa un poco antes de pedir la evaluación.");
    setFinishing(true); setError("");
    const res = await aiCall<Record<string, unknown>>({ action: "roleplay", payload, persona, history, finish: true });
    setFinishing(false);
    if (res.error) return setError(res.error);
    setFeedback(res.data!);
    await supabase.from("meetings").update({ roleplay_output: { persona, history, feedback: res.data } }).eq("id", meeting.id);
  }

  function reset() { setHistory([]); setFeedback(null); setError(""); }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
      <div className="card flex flex-col p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Roleplay comercial</h2>
            <p className="text-sm text-ink-mute">La IA actúa como tu cliente. Tú vendes. Al final recibes feedback con puntuación.</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="input !w-auto" value={persona} onChange={(e) => setPersona(e.target.value)} disabled={started}>
              {PERSONAS.map((p) => <option key={p} value={p}>Cliente {p.toLowerCase()}</option>)}
            </select>
            {!started && <button className="btn-primary" onClick={start} disabled={loading}>Empezar</button>}
            {started && <button className="btn-ghost text-xs" onClick={reset}>Reiniciar</button>}
          </div>
        </div>

        <div className="min-h-[260px] flex-1 space-y-3 overflow-y-auto rounded-xl bg-canvas p-4">
          {!started && !loading && <p className="text-sm text-ink-mute">Elige el perfil del cliente y pulsa «Empezar». El cliente abrirá la conversación.</p>}
          {history.map((m, i) => (
            <div key={i} className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "assistant" ? "bg-white ring-1 ring-line" : "ml-auto bg-ink text-white"}`}>
              <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wide opacity-60">{m.role === "assistant" ? `Cliente (${persona})` : "Tú"}</span>
              {m.content}
            </div>
          ))}
          {loading && <Spinner label="El cliente está escribiendo…" />}
          <div ref={bottomRef} />
        </div>

        {started && !feedback && (
          <div className="mt-4 flex gap-2">
            <textarea className="input flex-1 resize-none" rows={2} placeholder="Tu respuesta como comercial…" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <div className="flex flex-col gap-2">
              <button className="btn-primary" onClick={send} disabled={loading || !input.trim()}>Enviar</button>
              <button className="btn-secondary text-xs" onClick={finish} disabled={finishing}>{finishing ? "Evaluando…" : "Terminar y evaluar"}</button>
            </div>
          </div>
        )}
        <ErrorNote message={error} />
      </div>

      <div className="card h-fit p-6">
        <h3 className="font-display text-base font-semibold">Feedback del entrenamiento</h3>
        {!feedback && <p className="mt-2 text-sm text-ink-mute">Aparecerá aquí al pulsar «Terminar y evaluar». Se guarda en la reunión para que puedas revisarlo más tarde.</p>}
        {feedback && (
          <div className="mt-3 space-y-4">
            <div className="flex items-center gap-3">
              <ScoreBadge score={Number(feedback.puntuacion ?? 0)} />
              <span className="text-sm text-ink-soft">Puntuación del roleplay</span>
            </div>
            <OutputEditor sections={FEEDBACK_SECTIONS} data={feedback} onChange={setFeedback} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Notas ---------------- */
function NotesTab({ meeting, company, contact }: any) {
  const supabase = createClient();
  const router = useRouter();
  const [raw, setRaw] = useState<string>(meeting.notes_raw ?? "");
  const [data, setData] = useState<Record<string, unknown> | null>(meeting.notes_structured ?? null);
  const [score, setScore] = useState<Record<string, unknown> | null>(meeting.score_breakdown ? { score: meeting.opportunity_score, ...meeting.score_breakdown } : null);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tasksDone, setTasksDone] = useState(false);
  const [error, setError] = useState("");

  async function structure() {
    if (raw.trim().length < 20) return setError("Escribe al menos unas líneas de notas antes de estructurar.");
    setLoading(true); setError("");
    const res = await aiCall<Record<string, unknown>>({
      action: "structure_notes",
      payload: { ...companyContext(company, contact, meeting), notas_sucias: raw },
    });
    setLoading(false);
    if (res.error) return setError(res.error);
    setData(res.data!);
  }

  async function save() {
    if (!data) return;
    setSaving(true); setError("");
    const stage = (data as any)?.campos_crm?.pipeline_stage_recomendado;
    const { error: e1 } = await supabase.from("meetings")
      .update({ notes_raw: raw, notes_structured: data, status: "realizada" })
      .eq("id", meeting.id);
    if (!e1 && stage) {
      // El estado sugerido se muestra; el cambio real lo decide el usuario en la ficha o el pipeline.
    }
    setSaving(false);
    if (e1) return setError("No se pudieron guardar las notas.");
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function runScore() {
    if (!data) return setError("Primero estructura las notas: el scoring se calcula sobre ellas.");
    setScoring(true); setError("");
    const res = await aiCall<Record<string, unknown>>({
      action: "score_opportunity",
      payload: { ...companyContext(company, contact, meeting), notas_estructuradas: data },
    });
    setScoring(false);
    if (res.error) return setError(res.error);
    const s = res.data!;
    setScore(s);
    const value = Math.max(0, Math.min(100, Number(s.score ?? 0)));
    await supabase.from("meetings").update({ opportunity_score: value, score_breakdown: s }).eq("id", meeting.id);
    await supabase.from("companies").update({ opportunity_score: value }).eq("id", company.id);
    router.refresh();
  }

  async function createTasks() {
    const sug: any[] = ((data as any)?.tareas_sugeridas ?? []).filter((t: any) => t?.titulo);
    if (!sug.length) return setError("La IA no propuso tareas en estas notas.");
    setError("");
    const rows = sug.map((t) => ({
      workspace_id: meeting.workspace_id, company_id: company.id, contact_id: contact?.id ?? null, meeting_id: meeting.id,
      title: String(t.titulo).slice(0, 200),
      priority: ["alta", "media", "baja"].includes(t.prioridad) ? t.prioridad : "media",
      due_date: t.plazo_dias ? new Date(Date.now() + Number(t.plazo_dias) * 86400000).toISOString().slice(0, 10) : null,
    }));
    const { error } = await supabase.from("tasks").insert(rows);
    if (error) return setError("No se pudieron crear las tareas.");
    setTasksDone(true); setTimeout(() => setTasksDone(false), 2500);
  }

  const recommendedStage = (data as any)?.campos_crm?.pipeline_stage_recomendado;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold">Notas de la reunión</h2>
        <p className="mb-3 text-sm text-ink-mute">Pega aquí tus notas sucias, tal cual. La IA las convierte en información comercial accionable.</p>
        <textarea className="input min-h-[320px] font-mono text-[13px]" value={raw} onChange={(e) => setRaw(e.target.value)}
          placeholder={"ej: reunión con maría, les duele el tema reporting manual, 3 personas perdiendo 2 días/mes…\npresupuesto no claro, decide el dir financiero\nquedamos en mandar propuesta antes del viernes"} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={structure} disabled={loading}>{loading ? "Estructurando…" : data ? "Re-estructurar" : "Estructurar con IA"}</button>
          {data && <button className="btn-secondary" onClick={save} disabled={saving}>{saved ? "Guardado ✓" : "Guardar notas"}</button>}
        </div>
        <ErrorNote message={error} />
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Notas estructuradas</h3>
            {data && (
              <div className="flex gap-2">
                <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={createTasks}>{tasksDone ? "Tareas creadas ✓" : "Crear tareas sugeridas"}</button>
              </div>
            )}
          </div>
          {!data && <p className="text-sm text-ink-mute">Aquí verás el resumen ejecutivo, necesidad, dolor, urgencia, decisores, objeciones, próximos pasos y tareas sugeridas.</p>}
          {data && (
            <>
              {recommendedStage && (
                <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
                  Estado recomendado para {company.name}: <strong>{stageLabel(recommendedStage)}</strong>. Puedes aplicarlo desde la ficha o el pipeline.
                </p>
              )}
              <OutputEditor sections={NOTES_SECTIONS} data={data} onChange={setData} />
            </>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Scoring de la oportunidad</h3>
            <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={runScore} disabled={scoring}>{scoring ? "Calculando…" : score ? "Recalcular" : "Calcular scoring"}</button>
          </div>
          {!score && <p className="text-sm text-ink-mute">Puntuación 0–100 con desglose: probabilidad de cierre, urgencia, presupuesto, poder de decisión y riesgo.</p>}
          {score && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ScoreBadge score={Number(score.score ?? 0)} />
                <span className="text-sm font-medium text-ink-soft">{String(score.veredicto ?? "")}</span>
              </div>
              {Array.isArray(score.desglose) && (
                <ul className="space-y-1.5">
                  {(score.desglose as any[]).map((d, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 rounded-lg bg-canvas px-3 py-2 text-sm">
                      <span><strong>{d.variable}</strong> · {d.comentario}</span>
                      <span className="shrink-0 font-semibold">{d.puntos}</span>
                    </li>
                  ))}
                </ul>
              )}
              {score.que_falta_para_subirla != null && (
                <p className="text-sm text-ink-soft"><strong>Para subirla:</strong> {Array.isArray(score.que_falta_para_subirla) ? (score.que_falta_para_subirla as any[]).join(" · ") : String(score.que_falta_para_subirla)}</p>
              )}
              {score.siguiente_mejor_accion != null && (
                <p className="rounded-lg bg-signal-soft px-3 py-2 text-sm text-signal"><strong>Siguiente mejor acción:</strong> {String(score.siguiente_mejor_accion)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Propuesta ---------------- */
const STYLES = [
  { value: "directa", label: "Directa", hint: "Corta, al grano. Para clientes ocupados." },
  { value: "consultiva", label: "Consultiva", hint: "Diagnóstico + solución. La más completa." },
  { value: "premium", label: "Premium", hint: "Tono elevado, enfoque de valor." },
];

function ProposalTab({ meeting, company, contact }: any) {
  const supabase = createClient();
  const router = useRouter();
  const [style, setStyle] = useState("consultiva");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true); setError("");
    const res = await aiCall<Record<string, unknown>>({
      action: "proposal",
      payload: {
        ...companyContext(company, contact, meeting),
        estilo: style,
        notas_estructuradas: meeting.notes_structured ?? null,
        notas_sucias: meeting.notes_structured ? null : meeting.notes_raw,
      },
    });
    if (res.error) { setLoading(false); return setError(res.error); }
    const p: any = res.data;
    const { data: row, error: e } = await supabase.from("proposals").insert({
      workspace_id: meeting.workspace_id, company_id: company.id, meeting_id: meeting.id,
      title: p.titulo ?? `Propuesta para ${company.name}`,
      style, content: p, variants: p.variantes ?? null, email_draft: p.email_envio ?? null,
    }).select("id").single();
    setLoading(false);
    if (e) {
      if (e.message?.includes("LIMITE_PLAN")) return setError("Has alcanzado el límite de 3 propuestas/mes del plan Free. Pasa a Pro para propuestas ilimitadas.");
      return setError("No se pudo guardar la propuesta.");
    }
    router.push(`/propuestas/${row!.id}`);
  }

  const hasNotes = Boolean(meeting.notes_structured || meeting.notes_raw);

  return (
    <div className="card max-w-2xl p-6">
      <h2 className="font-display text-lg font-semibold">Generar propuesta comercial</h2>
      <p className="mt-1 text-sm text-ink-mute">
        Se construye sobre {meeting.notes_structured ? "las notas estructuradas de esta reunión" : meeting.notes_raw ? "tus notas en bruto" : "los datos de la ficha (mejor si antes estructuras las notas)"}.
        Los importes salen marcados como <span className="font-mono text-xs">[AJUSTAR]</span>: la IA nunca se inventa precios.
      </p>
      {!hasNotes && (
        <p className="mt-3 rounded-lg bg-signal-soft px-3 py-2 text-sm text-signal">
          Consejo: estructura primero las notas en la pestaña «Notas». La propuesta saldrá mucho más específica.
        </p>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {STYLES.map((s) => (
          <button key={s.value} onClick={() => setStyle(s.value)}
            className={`rounded-xl border p-4 text-left transition ${style === s.value ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-ink-mute"}`}>
            <span className="block font-display text-sm font-semibold">{s.label}</span>
            <span className="mt-1 block text-xs text-ink-mute">{s.hint}</span>
          </button>
        ))}
      </div>
      <button className="btn-primary mt-5" onClick={generate} disabled={loading}>
        {loading ? "Generando propuesta…" : "Generar y abrir el editor"}
      </button>
      <ErrorNote message={error} />
    </div>
  );
}

/* ---------------- Emails ---------------- */
const EMAIL_KEYS = [
  { key: "email_corto", label: "Seguimiento corto" },
  { key: "email_consultivo", label: "Seguimiento consultivo" },
  { key: "email_con_propuesta", label: "Envío de propuesta" },
  { key: "email_si_no_responde", label: "Si no responde" },
  { key: "email_cierre_elegante", label: "Cierre elegante" },
];

function EmailsTab({ meeting, company, contact }: any) {
  const supabase = createClient();
  const [data, setData] = useState<Record<string, any> | null>(meeting.notes_structured?.followup_emails ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true); setError("");
    const res = await aiCall<Record<string, any>>({
      action: "followup_emails",
      payload: { ...companyContext(company, contact, meeting), notas_estructuradas: meeting.notes_structured ?? null, notas_sucias: meeting.notes_raw ?? null },
    });
    setLoading(false);
    if (res.error) return setError(res.error);
    setData(res.data!);
    const ns = { ...(meeting.notes_structured ?? {}), followup_emails: res.data };
    await supabase.from("meetings").update({ notes_structured: ns }).eq("id", meeting.id);
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Emails de seguimiento</h2>
          <p className="text-sm text-ink-mute">Cinco variantes listas para copiar, escritas sobre lo que pasó en esta reunión. Sin plantillas genéricas.</p>
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading}>{loading ? "Redactando…" : data ? "Regenerar" : "Generar emails"}</button>
      </div>
      <ErrorNote message={error} />
      {!data && !loading && <p className="rounded-lg bg-canvas px-4 py-3 text-sm text-ink-soft">Funciona mejor con las notas estructuradas; si no las hay, usará el contexto de la ficha.</p>}
      {data && (
        <div className="space-y-5">
          {data.asunto_principal && (
            <div className="flex items-center justify-between rounded-lg bg-canvas px-4 py-3">
              <p className="text-sm"><span className="font-semibold">Asunto sugerido:</span> {data.asunto_principal}</p>
              <CopyButton text={String(data.asunto_principal)} />
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {EMAIL_KEYS.map(({ key, label }) => data[key] ? (
              <div key={key} className="rounded-xl border border-line p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display text-sm font-semibold">{label}</span>
                  <CopyButton text={String(data[key])} />
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{String(data[key])}</p>
              </div>
            ) : null)}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { OutputEditor, SectionDef, ErrorNote, CopyButton } from "@/components/ui";

const PROPOSAL_SECTIONS: SectionDef[] = [
  { key: "contexto", label: "Contexto", kind: "text" },
  { key: "necesidad_detectada", label: "Necesidad detectada", kind: "text" },
  { key: "diagnostico", label: "Diagnóstico", kind: "text" },
  { key: "solucion_propuesta", label: "Solución propuesta", kind: "text" },
  { key: "alcance", label: "Alcance", kind: "lines" },
  { key: "metodologia", label: "Metodología", kind: "lines" },
  { key: "cronograma", label: "Cronograma", kind: "lines" },
  { key: "entregables", label: "Entregables", kind: "lines" },
  { key: "pricing", label: "Pricing (revisa los [AJUSTAR])", kind: "text" },
  { key: "condiciones", label: "Condiciones", kind: "lines" },
  { key: "proximos_pasos", label: "Próximos pasos", kind: "lines" },
];

const STATUSES = [
  { value: "borrador", label: "Borrador" },
  { value: "enviada", label: "Enviada" },
  { value: "aceptada", label: "Aceptada" },
  { value: "rechazada", label: "Rechazada" },
];

function fullText(title: string, content: Record<string, unknown>) {
  const parts: string[] = [title.toUpperCase(), ""];
  for (const s of PROPOSAL_SECTIONS) {
    const v = content[s.key];
    if (v == null || v === "") continue;
    parts.push(s.label.replace(/ \(.*\)/, "").toUpperCase());
    parts.push(Array.isArray(v) ? (v as unknown[]).map((x) => `• ${typeof x === "object" && x ? Object.values(x as object).join(" — ") : x}`).join("\n") : String(v));
    parts.push("");
  }
  return parts.join("\n");
}

export default function ProposalEditor({ proposal }: { proposal: any }) {
  const supabase = createClient();
  const [title, setTitle] = useState<string>(proposal.title);
  const [content, setContent] = useState<Record<string, unknown>>(proposal.content ?? {});
  const [status, setStatus] = useState<string>(proposal.status);
  const [variant, setVariant] = useState<string>("editor");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const variants: Record<string, string> = proposal.variants ?? {};
  const email: string | null = proposal.email_draft;

  async function save() {
    setSaving(true); setError("");
    const { error } = await supabase.from("proposals")
      .update({ title, content, status })
      .eq("id", proposal.id);
    setSaving(false);
    if (error) return setError("No se pudo guardar la propuesta.");
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: "editor", label: "Editor" },
    ...(variants.corta ? [{ id: "corta", label: "Versión corta" }] : []),
    ...(variants.formal ? [{ id: "formal", label: "Versión formal" }] : []),
    ...(variants.premium ? [{ id: "premium", label: "Versión premium" }] : []),
    ...(email ? [{ id: "email", label: "Email de envío" }] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-1 text-xs text-ink-mute">
        <Link href="/propuestas" className="hover:text-accent">Propuestas</Link>
        {proposal.companies && <> / <Link href={`/empresas/${proposal.companies.id}`} className="hover:text-accent">{proposal.companies.name}</Link></>}
        {proposal.meetings && <> · de la reunión «{proposal.meetings.title}»</>}
      </p>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <input className="input !w-auto min-w-[260px] flex-1 font-display text-lg font-semibold" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex items-center gap-2">
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <CopyButton text={fullText(title, content)} label="Copiar todo" />
          <button className="btn-primary" onClick={save} disabled={saving}>{saved ? "Guardado ✓" : "Guardar"}</button>
        </div>
      </div>
      <ErrorNote message={error} />

      <p className="mb-4 rounded-lg bg-signal-soft px-3 py-2 text-sm text-signal">
        Revisa los importes marcados como <span className="font-mono text-xs">[AJUSTAR]</span> antes de enviar: la IA no fija precios por ti.
      </p>

      {tabs.length > 1 && (
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-line">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setVariant(t.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${variant === t.id ? "bg-ink text-white" : "text-ink-soft hover:bg-canvas"}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {variant === "editor" && (
        <div className="card p-6">
          <OutputEditor sections={PROPOSAL_SECTIONS} data={content} onChange={setContent} />
        </div>
      )}
      {["corta", "formal", "premium"].includes(variant) && (
        <div className="card p-6">
          <div className="mb-3 flex justify-end"><CopyButton text={String(variants[variant])} /></div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{String(variants[variant])}</p>
        </div>
      )}
      {variant === "email" && email && (
        <div className="card p-6">
          <div className="mb-3 flex justify-end"><CopyButton text={email} /></div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{email}</p>
        </div>
      )}
    </div>
  );
}

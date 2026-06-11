"use client";
import Link from "next/link";
import { useState } from "react";
import { stageLabel } from "@/lib/types";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-mute">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, cta, href }: { title: string; body: string; cta?: string; href?: string }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-mute">{body}</p>
      {cta && href && <Link href={href} className="btn-primary mt-5">{cta}</Link>}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-mute">
      <svg className="h-4 w-4 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label ?? "Generando…"}
    </span>
  );
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{message}</p>;
}

const STAGE_STYLES: Record<string, string> = {
  nuevo: "bg-canvas text-ink-soft",
  reunion_agendada: "bg-accent-soft text-accent",
  reunion_realizada: "bg-accent-soft text-accent",
  propuesta_enviada: "bg-signal-soft text-signal",
  negociacion: "bg-signal-soft text-signal",
  ganado: "bg-accent text-white",
  perdido: "bg-danger/10 text-danger",
  dormido: "bg-canvas text-ink-mute",
};
export function StageBadge({ stage }: { stage: string }) {
  return <span className={`badge ${STAGE_STYLES[stage] ?? "bg-canvas text-ink-soft"}`}>{stageLabel(stage)}</span>;
}

export function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="badge bg-canvas text-ink-mute">Sin puntuar</span>;
  const cls = score >= 70 ? "bg-accent text-white" : score >= 40 ? "bg-signal-soft text-signal" : "bg-canvas text-ink-mute";
  return <span className={`badge ${cls}`}>{score}/100</span>;
}

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-secondary !px-3 !py-1.5 text-xs"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? "Copiado ✓" : label}
    </button>
  );
}

// ----- Render/edición genérica de outputs de IA -----
type Kind = "text" | "lines" | "objects";
export type SectionDef = { key: string; label: string; kind: Kind };

export function serializeValue(v: unknown, kind: Kind): string {
  if (v == null) return "";
  if (kind === "text") return String(v);
  if (kind === "lines") return Array.isArray(v) ? v.map(String).join("\n") : String(v);
  if (Array.isArray(v)) {
    return v.map((o) => (typeof o === "object" && o ? Object.values(o as object).join(" — ") : String(o))).join("\n");
  }
  return typeof v === "object" ? Object.entries(v as object).map(([k, val]) => `${k}: ${val}`).join("\n") : String(v);
}
export function deserializeValue(s: string, kind: Kind): unknown {
  if (kind === "text") return s;
  return s.split("\n").map((l) => l.trim()).filter(Boolean);
}

export function OutputEditor({ sections, data, onChange }: {
  sections: SectionDef[];
  data: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-5">
      {sections.map(({ key, label, kind }) => {
        const value = serializeValue(data[key], kind);
        if (!value) return null;
        const rows = Math.min(12, Math.max(2, value.split("\n").length));
        return (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label !mb-0">{label}</span>
              <CopyButton text={value} />
            </div>
            <textarea
              className="input font-[450] leading-relaxed"
              rows={rows}
              value={value}
              onChange={(e) => onChange({ ...data, [key]: deserializeValue(e.target.value, kind) })}
            />
          </div>
        );
      })}
    </div>
  );
}

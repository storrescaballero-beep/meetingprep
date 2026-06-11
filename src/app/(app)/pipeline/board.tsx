"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { STAGES } from "@/lib/types";
import { ScoreBadge, ErrorNote } from "@/components/ui";

export default function PipelineBoard({ initial }: { initial: any[] }) {
  const supabase = createClient();
  const [cards, setCards] = useState(initial);
  const [error, setError] = useState("");

  async function move(id: string, stage: string) {
    const prev = cards;
    setCards(cards.map((c) => (c.id === id ? { ...c, pipeline_stage: stage } : c)));
    const { error } = await supabase.from("companies").update({ pipeline_stage: stage }).eq("id", id);
    if (error) { setCards(prev); setError("No se pudo mover la empresa de estado."); }
  }

  return (
    <div>
      <ErrorNote message={error} />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((s) => {
          const col = cards.filter((c) => c.pipeline_stage === s.id);
          return (
            <div key={s.id} className="w-[280px] shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-mute">{s.label}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink-soft ring-1 ring-line">{col.length}</span>
              </div>
              <div className="space-y-3 rounded-xl bg-canvas-deep/60 p-2 min-h-[120px]">
                {col.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-mute">Sin empresas aquí</p>}
                {col.map((c) => (
                  <div key={c.id} className="card p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/empresas/${c.id}`} className="font-display text-sm font-semibold leading-snug hover:text-accent">{c.name}</Link>
                      <ScoreBadge score={c.opportunity_score} />
                    </div>
                    {c.contact && <p className="mt-1 text-xs text-ink-mute">{c.contact.full_name}{c.contact.job_title ? ` · ${c.contact.job_title}` : ""}</p>}
                    {c.next_task ? (
                      <p className="mt-2 rounded-md bg-canvas px-2 py-1.5 text-xs text-ink-soft">
                        <span className="font-semibold">Próxima acción:</span> {c.next_task.title}
                        {c.next_task.due_date && <span className="text-ink-mute"> · {new Date(c.next_task.due_date).toLocaleDateString("es-ES")}</span>}
                      </p>
                    ) : (
                      <p className="mt-2 rounded-md bg-signal-soft px-2 py-1.5 text-xs text-signal">Sin próxima acción definida</p>
                    )}
                    {c.last_activity && <p className="mt-1.5 text-[11px] text-ink-mute">Última actividad: {new Date(c.last_activity).toLocaleDateString("es-ES")}</p>}
                    <select className="input mt-2.5 !py-1.5 text-xs" value={c.pipeline_stage} onChange={(e) => move(c.id, e.target.value)}>
                      {STAGES.map((st) => <option key={st.id} value={st.id}>{st.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

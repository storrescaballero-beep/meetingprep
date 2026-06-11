import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/ui";

const STATUS_LABEL: Record<string, string> = { borrador: "Borrador", enviada: "Enviada", aceptada: "Aceptada", rechazada: "Rechazada" };
const STATUS_CLS: Record<string, string> = {
  borrador: "bg-canvas text-ink-soft", enviada: "bg-signal-soft text-signal",
  aceptada: "bg-accent text-white", rechazada: "bg-danger/10 text-danger",
};

export default async function ProposalsPage() {
  const supabase = createClient();
  const { data: proposals } = await supabase
    .from("proposals")
    .select("id,title,style,status,created_at,companies(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="Propuestas" subtitle="Todas las propuestas generadas en este workspace." />
      {!proposals?.length ? (
        <EmptyState
          title="Aún no hay propuestas"
          body="Las propuestas se generan desde una reunión, a partir de las notas estructuradas. Abre una reunión y ve a la pestaña «Propuesta»."
          cta="Ir a reuniones" href="/reuniones"
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-mute">
                <th className="px-4 py-3">Título</th><th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Estilo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p: any) => (
                <tr key={p.id} className="border-b border-line/60 last:border-0 hover:bg-canvas/60">
                  <td className="px-4 py-3"><Link href={`/propuestas/${p.id}`} className="font-medium hover:text-accent">{p.title}</Link></td>
                  <td className="px-4 py-3 text-ink-soft">{p.companies?.name ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-ink-soft">{p.style}</td>
                  <td className="px-4 py-3"><span className={`badge ${STATUS_CLS[p.status] ?? ""}`}>{STATUS_LABEL[p.status] ?? p.status}</span></td>
                  <td className="px-4 py-3 text-ink-mute">{new Date(p.created_at).toLocaleDateString("es-ES")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

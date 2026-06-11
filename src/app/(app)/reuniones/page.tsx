import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader, ScoreBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUS: Record<string,string> = { agendada: "Agendada", preparada: "Preparada", realizada: "Realizada", cancelada: "Cancelada" };

export default async function ReunionesPage() {
  const supabase = createClient();
  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, title, meeting_date, meeting_type, status, opportunity_score, companies(name), contacts(full_name)")
    .order("meeting_date", { ascending: false, nullsFirst: false });

  return (
    <>
      <PageHeader
        title="Reuniones"
        subtitle="Prepara una reunión que merezca la pena."
        action={<Link href="/reuniones/nueva" className="btn-primary">+ Nueva reunión</Link>}
      />
      {!meetings?.length ? (
        <EmptyState
          title="Aún no hay reuniones"
          body="Crea tu primera reunión: en un par de minutos tendrás preparación completa, preguntas inteligentes y roleplay para practicar."
          cta="Preparar mi primera reunión"
          href="/reuniones/nueva"
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-mute">
                <th className="px-5 py-3 font-medium">Reunión</th>
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Scoring</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {meetings.map((m: any) => (
                <tr key={m.id} className="hover:bg-canvas">
                  <td className="px-5 py-3"><Link href={`/reuniones/${m.id}`} className="font-medium hover:text-accent">{m.title}</Link></td>
                  <td className="px-5 py-3 text-ink-soft">{m.companies?.name}{m.contacts?.full_name ? ` · ${m.contacts.full_name}` : ""}</td>
                  <td className="px-5 py-3 text-ink-soft">{m.meeting_date ? new Date(m.meeting_date).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }) : "—"}</td>
                  <td className="px-5 py-3 text-ink-soft">{m.meeting_type}</td>
                  <td className="px-5 py-3"><span className="badge bg-canvas text-ink-soft">{STATUS[m.status] ?? m.status}</span></td>
                  <td className="px-5 py-3"><ScoreBadge score={m.opportunity_score} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

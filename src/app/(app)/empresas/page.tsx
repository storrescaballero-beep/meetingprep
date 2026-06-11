import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader, ScoreBadge, StageBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EmpresasPage() {
  const supabase = createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, sector, country, pipeline_stage, opportunity_score, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Empresas"
        subtitle="Las cuentas con las que estás trabajando."
        action={<Link href="/empresas/nueva" className="btn-primary">+ Nueva empresa</Link>}
      />
      {!companies?.length ? (
        <EmptyState
          title="Aún no hay empresas"
          body="Crea tu primera empresa para preparar una reunión comercial."
          cta="Crear empresa"
          href="/empresas/nueva"
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-mute">
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 font-medium">Sector</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Scoring</th>
                <th className="px-5 py-3 font-medium">Actualizada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-canvas">
                  <td className="px-5 py-3">
                    <Link href={`/empresas/${c.id}`} className="font-medium hover:text-accent">{c.name}</Link>
                    {c.country && <span className="ml-2 text-xs text-ink-mute">{c.country}</span>}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{c.sector ?? "—"}</td>
                  <td className="px-5 py-3"><StageBadge stage={c.pipeline_stage} /></td>
                  <td className="px-5 py-3"><ScoreBadge score={c.opportunity_score} /></td>
                  <td className="px-5 py-3 text-xs text-ink-mute">{new Date(c.updated_at).toLocaleDateString("es-ES")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

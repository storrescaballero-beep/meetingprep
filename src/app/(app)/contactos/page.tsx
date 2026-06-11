import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ContactosPage() {
  const supabase = createClient();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, full_name, job_title, email, phone, linkedin_url, confidence_score, companies(id, name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Contactos"
        subtitle="Tus interlocutores, con fuente y nivel de confianza."
        action={<Link href="/contactos/nuevo" className="btn-primary">+ Nuevo contacto</Link>}
      />
      <p className="mb-4 rounded-lg bg-signal-soft px-4 py-2.5 text-sm text-signal">
        Introduce únicamente datos profesionales que tengas derecho a tratar. No añadas datos sensibles ni información no verificada.
      </p>
      {!contacts?.length ? (
        <EmptyState title="Aún no hay contactos" body="Añade con quién te reúnes: la preparación de cada reunión usa el cargo y el contexto del interlocutor." cta="Crear contacto" href="/contactos/nuevo" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-mute">
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Teléfono</th>
                <th className="px-5 py-3 font-medium">Confianza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {contacts.map((c: any) => (
                <tr key={c.id} className="hover:bg-canvas">
                  <td className="px-5 py-3">
                    <span className="font-medium">{c.full_name}</span>
                    {c.job_title && <span className="ml-2 text-xs text-ink-mute">{c.job_title}</span>}
                  </td>
                  <td className="px-5 py-3"><Link href={`/empresas/${c.companies?.id}`} className="text-accent">{c.companies?.name}</Link></td>
                  <td className="px-5 py-3 text-ink-soft">{c.email ?? <span className="text-ink-mute">No verificado</span>}</td>
                  <td className="px-5 py-3 text-ink-soft">{c.phone ?? <span className="text-ink-mute">No verificado</span>}</td>
                  <td className="px-5 py-3"><span className="badge bg-canvas text-ink-soft">{c.confidence_score ?? "no verificado"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

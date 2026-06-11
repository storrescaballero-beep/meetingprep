"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ErrorNote, PageHeader } from "@/components/ui";

export default function NuevoContacto() {
  const router = useRouter();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ company_id: "", full_name: "", job_title: "", email: "", phone: "", linkedin_url: "", source: "manual", confidence_score: "no_verificado", consent_notes: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    createClient().from("companies").select("id, name").order("name").then(({ data }) => setCompanies(data ?? []));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_id) { setError("Selecciona la empresa del contacto."); return; }
    if (!form.full_name.trim()) { setError("El nombre es obligatorio."); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("user_profiles").select("workspace_id").eq("id", user!.id).single();
    const payload: any = { ...form, full_name: form.full_name.trim(), workspace_id: profile!.workspace_id };
    for (const k of ["email","phone","linkedin_url","job_title","consent_notes"]) if (!payload[k]) payload[k] = null;
    const { error } = await supabase.from("contacts").insert(payload);
    setLoading(false);
    if (error) { setError("No se pudo guardar el contacto."); return; }
    router.push(`/empresas/${form.company_id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nuevo contacto" subtitle="Solo datos profesionales con base legal para tratarlos." />
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <p className="rounded-lg bg-signal-soft px-3 py-2 text-xs text-signal">
          Introduce únicamente datos profesionales que tengas derecho a tratar. No añadas datos sensibles ni información no verificada.
        </p>
        <div>
          <label className="label">Empresa *</label>
          <select className="input" value={form.company_id} onChange={set("company_id")} required>
            <option value="">Selecciona empresa…</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label">Nombre completo *</label><input className="input" value={form.full_name} onChange={set("full_name")} required maxLength={200} /></div>
          <div><label className="label">Cargo</label><input className="input" value={form.job_title} onChange={set("job_title")} placeholder="Directora de Operaciones" /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={set("email")} placeholder="Solo si está verificado" /></div>
          <div><label className="label">Teléfono</label><input className="input" value={form.phone} onChange={set("phone")} placeholder="Solo si está verificado" /></div>
        </div>
        <div><label className="label">LinkedIn</label><input className="input" type="url" value={form.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/…" /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label">Fuente</label><input className="input" value={form.source} onChange={set("source")} /></div>
          <div>
            <label className="label">Nivel de confianza</label>
            <select className="input" value={form.confidence_score} onChange={set("confidence_score")}>
              <option value="no_verificado">No verificado</option>
              <option value="parcial">Parcialmente verificado</option>
              <option value="verificado">Verificado</option>
            </select>
          </div>
        </div>
        <div><label className="label">Base legal / consentimiento</label><input className="input" value={form.consent_notes} onChange={set("consent_notes")} placeholder="Ej.: interés legítimo — relación comercial B2B" /></div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancelar</button>
          <button className="btn-primary" disabled={loading}>{loading ? "Guardando…" : "Guardar contacto"}</button>
        </div>
        <ErrorNote message={error} />
      </form>
    </div>
  );
}

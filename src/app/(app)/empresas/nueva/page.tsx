"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ErrorNote, PageHeader } from "@/components/ui";

export default function NuevaEmpresa() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", website: "", sector: "", country: "España", size: "", description: "", pain_hypothesis: "", source: "manual", confidence_score: "no_verificado" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("El nombre de la empresa es obligatorio."); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("user_profiles").select("workspace_id").eq("id", user!.id).single();
    const { data, error } = await supabase
      .from("companies")
      .insert({ ...form, name: form.name.trim(), workspace_id: profile!.workspace_id, owner_id: user!.id })
      .select("id")
      .single();
    setLoading(false);
    if (error) { setError("No se pudo guardar la empresa. Inténtalo de nuevo."); return; }
    router.push(`/empresas/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nueva empresa" subtitle="Solo necesitas el nombre para empezar. El resto suma para preparar mejor." />
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label className="label">Nombre *</label>
          <input className="input" value={form.name} onChange={set("name")} required maxLength={200} placeholder="Acme Logística S.L." />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label">Web</label><input className="input" value={form.website} onChange={set("website")} placeholder="acmelogistica.es" /></div>
          <div><label className="label">Sector</label><input className="input" value={form.sector} onChange={set("sector")} placeholder="Logística y transporte" /></div>
          <div><label className="label">País</label><input className="input" value={form.country} onChange={set("country")} /></div>
          <div>
            <label className="label">Tamaño</label>
            <select className="input" value={form.size} onChange={set("size")}>
              <option value="">Sin especificar</option>
              <option>1-10 empleados</option><option>11-50 empleados</option><option>51-200 empleados</option>
              <option>201-1000 empleados</option><option>+1000 empleados</option>
            </select>
          </div>
        </div>
        <div><label className="label">Descripción</label><textarea className="input" rows={2} value={form.description} onChange={set("description")} placeholder="Qué hace la empresa, en una o dos frases." /></div>
        <div><label className="label">Hipótesis de dolor</label><textarea className="input" rows={2} value={form.pain_hypothesis} onChange={set("pain_hypothesis")} placeholder="Por qué crees que podría necesitar tu servicio." /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label">Fuente de la información</label><input className="input" value={form.source} onChange={set("source")} placeholder="manual, web corporativa, LinkedIn…" /></div>
          <div>
            <label className="label">Nivel de confianza</label>
            <select className="input" value={form.confidence_score} onChange={set("confidence_score")}>
              <option value="no_verificado">No verificado</option>
              <option value="parcial">Parcialmente verificado</option>
              <option value="verificado">Verificado</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancelar</button>
          <button className="btn-primary" disabled={loading}>{loading ? "Guardando…" : "Guardar empresa"}</button>
        </div>
        <ErrorNote message={error} />
      </form>
    </div>
  );
}

"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ErrorNote, PageHeader } from "@/components/ui";
import { MEETING_TYPES, RELATIONSHIP_LEVELS } from "@/lib/types";

function Form() {
  const router = useRouter();
  const preCompany = useSearchParams().get("company") ?? "";
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<{ id: string; full_name: string; job_title: string|null }[]>([]);
  const [form, setForm] = useState({
    company_id: preCompany, contact_id: "", title: "", meeting_date: "", duration_minutes: "45",
    meeting_type: "discovery", relationship_level: "frio", objective: "", service_offering: "", prior_context: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    createClient().from("companies").select("id, name").order("name").then(({ data }) => setCompanies(data ?? []));
  }, []);
  useEffect(() => {
    if (!form.company_id) { setContacts([]); return; }
    createClient().from("contacts").select("id, full_name, job_title").eq("company_id", form.company_id).then(({ data }) => setContacts(data ?? []));
  }, [form.company_id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_id) { setError("Selecciona la empresa."); return; }
    if (!form.title.trim()) { setError("Ponle un título a la reunión."); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("user_profiles").select("workspace_id").eq("id", user!.id).single();
    const { data, error } = await supabase.from("meetings").insert({
      workspace_id: profile!.workspace_id, created_by: user!.id,
      company_id: form.company_id, contact_id: form.contact_id || null,
      title: form.title.trim(), meeting_date: form.meeting_date || null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      meeting_type: form.meeting_type, relationship_level: form.relationship_level,
      objective: form.objective || null, service_offering: form.service_offering || null,
      prior_context: form.prior_context || null,
    }).select("id").single();
    setLoading(false);
    if (error) {
      setError(error.message.includes("LIMITE_PLAN")
        ? "Has alcanzado el límite de 3 reuniones del plan Free este mes. Pasa a Pro para reuniones ilimitadas."
        : "No se pudo crear la reunión. Inténtalo de nuevo.");
      return;
    }
    router.push(`/reuniones/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nueva reunión" subtitle="Cuanto mejor sea el contexto, mejor será la preparación." />
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Empresa *</label>
            <select className="input" value={form.company_id} onChange={set("company_id")} required>
              <option value="">Selecciona empresa…</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Interlocutor</label>
            <select className="input" value={form.contact_id} onChange={set("contact_id")}>
              <option value="">Sin contacto asignado</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.full_name}{c.job_title ? ` — ${c.job_title}` : ""}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Título *</label>
          <input className="input" value={form.title} onChange={set("title")} required maxLength={200} placeholder="Discovery con Acme — selección comercial" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div><label className="label">Fecha y hora</label><input className="input" type="datetime-local" value={form.meeting_date} onChange={set("meeting_date")} /></div>
          <div><label className="label">Duración (min)</label><input className="input" type="number" min={10} max={240} value={form.duration_minutes} onChange={set("duration_minutes")} /></div>
          <div>
            <label className="label">Tipo de reunión</label>
            <select className="input" value={form.meeting_type} onChange={set("meeting_type")}>
              {MEETING_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Nivel de relación</label>
          <select className="input" value={form.relationship_level} onChange={set("relationship_level")}>
            {RELATIONSHIP_LEVELS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Objetivo de la reunión</label>
          <input className="input" value={form.objective} onChange={set("objective")} placeholder="Ej.: validar urgencia y conseguir compromiso de propuesta" />
        </div>
        <div>
          <label className="label">Servicio que vendes</label>
          <input className="input" value={form.service_offering} onChange={set("service_offering")} placeholder="Ej.: selección de perfiles comerciales senior a éxito" />
        </div>
        <div>
          <label className="label">Contexto previo y notas internas</label>
          <textarea className="input" rows={3} value={form.prior_context} onChange={set("prior_context")} placeholder="Cómo llegaste a esta reunión, qué sabéis el uno del otro, qué pasó antes…" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancelar</button>
          <button className="btn-primary" disabled={loading}>{loading ? "Creando…" : "Crear y preparar"}</button>
        </div>
        <ErrorNote message={error} />
      </form>
    </div>
  );
}

export default function NuevaReunion() {
  return <Suspense><Form /></Suspense>;
}

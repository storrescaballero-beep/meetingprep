"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ErrorNote, PageHeader, Spinner } from "@/components/ui";
import { MEETING_TYPES, RELATIONSHIP_LEVELS } from "@/lib/types";

function Form() {
  const router = useRouter();
  const preCompany = useSearchParams().get("company") ?? "";

  // Modo: "rapido" (solo nombre empresa + interlocutor) o "completo"
  const [mode, setMode] = useState<"rapido" | "completo">("rapido");
  const [autofilling, setAutofilling] = useState(false);
  const [autofilled, setAutofilled] = useState(false);

  // Campos rápidos (texto libre)
  const [companyName, setCompanyName] = useState("");
  const [companyWeb, setCompanyWeb] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");

  // Campos autocompletados / manuales
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [painHypothesis, setPainHypothesis] = useState("");

  // Campos reunión
  const [form, setForm] = useState({
    title: "", meeting_date: "", duration_minutes: "45",
    meeting_type: "discovery", relationship_level: "frio",
    objective: "", service_offering: "", prior_context: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  // Autocompletar con IA
  async function autoFill() {
    if (!companyName.trim()) { setError("Escribe el nombre de la empresa primero."); return; }
    setAutofilling(true); setError("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "company_research",
          payload: {
            company_name: companyName.trim(),
            website: companyWeb.trim(),
            contact_name: contactName.trim(),
            contact_role: contactRole.trim(),
          },
        }),
      });
      const json = await res.json();
      if (json.data) {
        const d = json.data;
        if (d.sector) setSector(d.sector);
        if (d.country) setCountry(d.country);
        if (d.description) setDescription(d.description);
        if (d.pain_hypothesis) setPainHypothesis(d.pain_hypothesis);
        if (d.contact_role && !contactRole) setContactRole(d.contact_role);
        if (!form.title && companyName) {
          setForm(f => ({ ...f, title: `Discovery con ${companyName.trim()}${contactName ? ` — ${contactName.trim()}` : ""}` }));
        }
        setAutofilled(true);
        setMode("completo");
      } else {
        setError("No se pudo autocompletar. Rellena los campos manualmente.");
        setMode("completo");
      }
    } catch {
      setError("Error al autocompletar. Rellena los campos manualmente.");
      setMode("completo");
    } finally {
      setAutofilling(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) { setError("Escribe el nombre de la empresa."); return; }
    if (!form.title.trim()) { setError("Ponle un título a la reunión."); return; }
    setLoading(true); setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("user_profiles").select("workspace_id").eq("id", user!.id).single();

    // Buscar o crear empresa
    let companyId: string;
    const { data: existingCompany } = await supabase
      .from("companies").select("id").ilike("name", companyName.trim()).eq("workspace_id", profile!.workspace_id).maybeSingle();

    if (existingCompany) {
      companyId = existingCompany.id;
      // Actualizar datos si los tenemos
      if (sector || country || description) {
        await supabase.from("companies").update({
          ...(sector && { sector }),
          ...(country && { country }),
          ...(description && { description }),
        }).eq("id", companyId);
      }
    } else {
      const { data: newCompany, error: companyError } = await supabase.from("companies").insert({
        workspace_id: profile!.workspace_id,
        name: companyName.trim(),
        ...(sector && { sector }),
        ...(country && { country }),
        ...(description && { description }),
      }).select("id").single();
      if (companyError || !newCompany) { setError("No se pudo crear la empresa."); setLoading(false); return; }
      companyId = newCompany.id;
    }

    // Buscar o crear contacto
    let contactId: string | null = null;
    if (contactName.trim()) {
      const { data: existingContact } = await supabase
        .from("contacts").select("id").ilike("full_name", contactName.trim()).eq("company_id", companyId).maybeSingle();

      if (existingContact) {
        contactId = existingContact.id;
        if (contactRole) await supabase.from("contacts").update({ job_title: contactRole }).eq("id", contactId);
      } else {
        const { data: newContact } = await supabase.from("contacts").insert({
          workspace_id: profile!.workspace_id,
          company_id: companyId,
          full_name: contactName.trim(),
          ...(contactRole && { job_title: contactRole }),
        }).select("id").single();
        if (newContact) contactId = newContact.id;
      }
    }

    // Crear reunión
    const { data, error: meetingError } = await supabase.from("meetings").insert({
      workspace_id: profile!.workspace_id,
      created_by: user!.id,
      company_id: companyId,
      contact_id: contactId,
      title: form.title.trim(),
      meeting_date: form.meeting_date || null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      meeting_type: form.meeting_type,
      relationship_level: form.relationship_level,
      objective: form.objective || null,
      service_offering: form.service_offering || null,
      prior_context: form.prior_context || null,
      ...(painHypothesis && { pain_hypothesis: painHypothesis }),
    }).select("id").single();

    setLoading(false);
    if (meetingError) {
      setError(meetingError.message.includes("LIMITE_PLAN")
        ? "Has alcanzado el límite de 3 reuniones del plan Free este mes. Pasa a Pro para reuniones ilimitadas."
        : "No se pudo crear la reunión. Inténtalo de nuevo.");
      return;
    }
    router.push(`/reuniones/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nueva reunión" subtitle="Con el nombre de empresa e interlocutor es suficiente para empezar." />
      <form onSubmit={onSubmit} className="card space-y-5 p-6">

        {/* BLOQUE RÁPIDO — siempre visible */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Empresa *</label>
            <input
              className="input"
              value={companyName}
              onChange={e => { setCompanyName(e.target.value); setAutofilled(false); }}
              placeholder="Ej: Ormazabal"
              required
            />
          </div>
          <div>
            <label className="label">Web corporativa</label>
            <input
              className="input"
              value={companyWeb}
              onChange={e => setCompanyWeb(e.target.value)}
              placeholder="Ej: ormazabal.com"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Interlocutor</label>
            <input
              className="input"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Ej: Mª Ángeles Collantes"
            />
          </div>
          <div>
            <label className="label">Cargo</label>
            <input
              className="input"
              value={contactRole}
              onChange={e => setContactRole(e.target.value)}
              placeholder="Ej: HR Manager Southern Europe"
            />
          </div>
        </div>

        {/* BOTÓN AUTOCOMPLETAR */}
        {!autofilled && (
          <button
            type="button"
            onClick={autoFill}
            disabled={autofilling || !companyName.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {autofilling ? (
              <><Spinner /> Investigando empresa e interlocutor…</>
            ) : (
              <>✨ Autocompletar con IA</>
            )}
          </button>
        )}

        {autofilled && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
            ✓ Datos completados automáticamente. Revisa y ajusta si es necesario.
            <button type="button" className="ml-2 underline text-xs" onClick={() => setAutofilled(false)}>Regenerar</button>
          </div>
        )}

        {/* ENLACE MODO COMPLETO */}
        {!autofilled && !autofilling && (
          <button type="button" className="text-xs text-ink-mute underline w-full text-center" onClick={() => setMode(mode === "rapido" ? "completo" : "rapido")}>
            {mode === "rapido" ? "Rellenar manualmente sin IA →" : "← Volver al modo rápido"}
          </button>
        )}

        {/* CAMPOS AUTOCOMPLETADOS / MANUALES */}
        {(mode === "completo" || autofilled) && (
          <>
            <div className="border-t border-line pt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Sector</label>
                <input className="input" value={sector} onChange={e => setSector(e.target.value)} placeholder="Ej: Infraestructura eléctrica" />
              </div>
              <div>
                <label className="label">País(es)</label>
                <input className="input" value={country} onChange={e => setCountry(e.target.value)} placeholder="Ej: España, Italia" />
              </div>
            </div>
            <div>
              <label className="label">Descripción de la empresa</label>
              <textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="A qué se dedica, clientes, posicionamiento…" />
            </div>
            <div>
              <label className="label">Hipótesis de dolor</label>
              <textarea className="input" rows={2} value={painHypothesis} onChange={e => setPainHypothesis(e.target.value)} placeholder="Qué problema crees que tienen y por qué te necesitan ahora…" />
            </div>
          </>
        )}

        {/* CAMPOS REUNIÓN */}
        <div className="border-t border-line pt-4">
          <div>
            <label className="label">Título *</label>
            <input className="input" value={form.title} onChange={set("title")} required maxLength={200} placeholder="Discovery con Acme — selección comercial" />
          </div>
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

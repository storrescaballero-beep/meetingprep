export type PipelineStage = "nuevo"|"reunion_agendada"|"reunion_realizada"|"propuesta_enviada"|"negociacion"|"ganado"|"perdido"|"dormido";
export type MeetingType = "discovery"|"propuesta"|"negociacion"|"seguimiento"|"reactivacion";
export type RelationshipLevel = "frio"|"templado"|"cliente"|"antiguo_cliente";

export const STAGES: { id: PipelineStage; label: string }[] = [
  { id: "nuevo", label: "Nuevo" },
  { id: "reunion_agendada", label: "Reunión agendada" },
  { id: "reunion_realizada", label: "Reunión realizada" },
  { id: "propuesta_enviada", label: "Propuesta enviada" },
  { id: "negociacion", label: "Negociación" },
  { id: "ganado", label: "Ganado" },
  { id: "perdido", label: "Perdido" },
  { id: "dormido", label: "Dormido" },
];
export const stageLabel = (s: string) => STAGES.find(x => x.id === s)?.label ?? s;

export const MEETING_TYPES = [
  { id: "discovery", label: "Discovery" },
  { id: "propuesta", label: "Presentación de propuesta" },
  { id: "negociacion", label: "Negociación" },
  { id: "seguimiento", label: "Seguimiento" },
  { id: "reactivacion", label: "Reactivación" },
];
export const RELATIONSHIP_LEVELS = [
  { id: "frio", label: "Frío" },
  { id: "templado", label: "Templado" },
  { id: "cliente", label: "Cliente" },
  { id: "antiguo_cliente", label: "Antiguo cliente" },
];
export const PERSONAS = [
  "Amable","Escéptico","Ocupado","Orientado a precio","Técnico","Defensivo",
  "Ya trabaja con la competencia","No ve urgencia","No quiere cambiar","Pide descuento",
];

export interface Company {
  id: string; workspace_id: string; name: string; website: string|null; sector: string|null;
  country: string|null; size: string|null; description: string|null; revenue_estimate: string|null;
  pain_hypothesis: string|null; opportunity_score: number|null; pipeline_stage: PipelineStage;
  source: string|null; confidence_score: string|null; created_at: string; updated_at: string;
}
export interface Contact {
  id: string; company_id: string; full_name: string; job_title: string|null; email: string|null;
  phone: string|null; linkedin_url: string|null; source: string|null; confidence_score: string|null;
  consent_notes: string|null;
}
export interface Meeting {
  id: string; company_id: string; contact_id: string|null; title: string; meeting_date: string|null;
  objective: string|null; service_offering: string|null; prior_context: string|null;
  duration_minutes: number|null; meeting_type: MeetingType; relationship_level: RelationshipLevel;
  status: string; preparation_output: any; roleplay_output: any; notes_raw: string|null;
  notes_structured: any; opportunity_score: number|null; score_breakdown: any; next_steps: string|null;
}

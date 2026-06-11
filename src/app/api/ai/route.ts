import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  meetingPrepPrompt, roleplayPrompt, structureNotesPrompt,
  scoreOpportunityPrompt, proposalPrompt, followUpEmailsPrompt, companyResearchPrompt,
} from "@/lib/ai/prompts";

// ---------------------------------------------------------------
// Única ruta de IA. La clave API vive solo aquí (servidor).
// Requiere sesión válida; el payload se valida con zod.
// ---------------------------------------------------------------

const baseSchema = z.object({
  action: z.enum([
    "meeting_prep","roleplay","structure_notes","score_opportunity",
    "proposal","followup_emails","company_research",
  ]),
  payload: z.record(z.unknown()).default({}),
  // roleplay
  persona: z.string().max(80).optional(),
  history: z.array(z.object({ role: z.enum(["user","assistant"]), content: z.string().max(4000) })).max(40).optional(),
  finish: z.boolean().optional(),
});

const MAX_PAYLOAD_CHARS = 24000;

async function callAnthropic(system: string, messages: { role: string; content: string }[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "IA no configurada. Añade ANTHROPIC_API_KEY en las variables de entorno." };
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system,
      messages,
    }),
  });
  if (!res.ok) {
    // No exponemos detalles técnicos del proveedor al cliente.
    console.error("AI provider error", res.status, await res.text().catch(() => ""));
    return { error: "El servicio de IA no está disponible ahora mismo. Inténtalo de nuevo en un momento." };
  }
  const data = await res.json();
  const text: string = (data.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");
  return { text };
}

function parseJson(text: string) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no-json");
  return JSON.parse(clean.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const body = baseSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 });
    const { action, payload, persona, history, finish } = body.data;

    if (JSON.stringify(payload).length > MAX_PAYLOAD_CHARS) {
      return NextResponse.json({ error: "El contenido es demasiado largo. Acorta las notas o el contexto." }, { status: 400 });
    }

    let prompt: { system: string; user?: string; messages?: { role: string; content: string }[] };
    switch (action) {
      case "meeting_prep": prompt = meetingPrepPrompt(payload); break;
      case "structure_notes": prompt = structureNotesPrompt(payload); break;
      case "score_opportunity": prompt = scoreOpportunityPrompt(payload); break;
      case "proposal": prompt = proposalPrompt(payload); break;
      case "followup_emails": prompt = followUpEmailsPrompt(payload); break;
      case "company_research": prompt = companyResearchPrompt(payload); break;
      case "roleplay": {
        const h = history ?? [];
        prompt = roleplayPrompt(payload, persona ?? "Escéptico", h, Boolean(finish));
        break;
      }
    }

    const messages = prompt.messages?.length
      ? prompt.messages
      : [{ role: "user", content: prompt.user ?? (finish ? "Evalúa la conversación anterior." : "Empieza tú la conversación saludando brevemente como el cliente.") }];

    // Para el cierre de roleplay añadimos la instrucción de evaluación al final.
    if (action === "roleplay" && finish) {
      messages.push({ role: "user", content: "FIN DEL ROLEPLAY. Evalúa ahora mi actuación como comercial según el formato JSON indicado." });
    }

    const result = await callAnthropic(prompt.system, messages);
    if ("error" in result && result.error) return NextResponse.json({ error: result.error }, { status: 503 });

    let json: unknown;
    try {
      json = parseJson(result.text!);
    } catch {
      // Un reintento implícito sería costoso; devolvemos error controlado.
      return NextResponse.json({ error: "No se pudo generar un resultado estructurado. Vuelve a intentarlo." }, { status: 502 });
    }
    return NextResponse.json({ data: json });
  } catch (e) {
    console.error("AI route error", e);
    return NextResponse.json({ error: "Error inesperado. Inténtalo de nuevo." }, { status: 500 });
  }
}

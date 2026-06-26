import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  meetingPrepPrompt, roleplayPrompt, structureNotesPrompt,
  scoreOpportunityPrompt, proposalPrompt, followUpEmailsPrompt, companyResearchPrompt,
  deepResearchPrompt,
} from "@/lib/ai/prompts";

const baseSchema = z.object({
  action: z.enum([
    "meeting_prep","roleplay","structure_notes","score_opportunity",
    "proposal","followup_emails","company_research",
  ]),
  payload: z.record(z.unknown()).default({}),
  persona: z.string().max(80).optional(),
  history: z.array(z.object({ role: z.enum(["user","assistant"]), content: z.string().max(4000) })).max(40).optional(),
  finish: z.boolean().optional(),
});

const MAX_PAYLOAD_CHARS = 24000;

async function callAnthropic(system: string, messages: { role: string; content: string }[], maxTokens = 4000) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: "IA no configurada. Añade ANTHROPIC_API_KEY en las variables de entorno." };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-sonnet-4-5",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
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

async function callAnthropicWithSearch(system: string, userMessage: string): Promise<{ text?: string; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: "IA no configurada." };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 6000,
      system,
      messages: [{ role: "user", content: userMessage }],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 8 }],
    }),
  });

  if (!res.ok) {
    console.error("AI search error", res.status, await res.text().catch(() => ""));
    return { text: "" };
  }

  const data = await res.json();
  const text: string = (data.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");
  return { text };
}

function parseJson(text: string) {
  let clean = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no-json");
  clean = clean.slice(start, end + 1);
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
  return JSON.parse(clean);
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

    if (action === "meeting_prep") {
      const researchPrompt = deepResearchPrompt(payload);
      const researchResult = await callAnthropicWithSearch(researchPrompt.system, researchPrompt.user);

      const enrichedPayload = {
        ...payload,
        research_externo: researchResult.text?.trim()
          ? researchResult.text
          : "No se pudo obtener research externo. Usa el conocimiento disponible sobre la empresa y el sector.",
      };

      const prepPrompt = meetingPrepPrompt(enrichedPayload);
      // 8000 tokens para que la preparación no se corte
      const prepResult = await callAnthropic(
        prepPrompt.system,
        [{ role: "user", content: prepPrompt.user! }],
        8000,
      );

      if ("error" in prepResult && prepResult.error) {
        return NextResponse.json({ error: prepResult.error }, { status: 503 });
      }
console.log("PREP_RAW:", prepResult.text?.slice(0, 800));
      let json: unknown;
      try {
        json = parseJson(prepResult.text!);
      } catch {
        return NextResponse.json({ error: "No se pudo generar un resultado estructurado. Vuelve a intentarlo." }, { status: 502 });
      }
      return NextResponse.json({ data: json });
    }

    let prompt: { system: string; user?: string; messages?: { role: string; content: string }[] };
    switch (action) {
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
      default:
        return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
    }

    const messages = prompt.messages?.length
      ? prompt.messages
      : [{ role: "user", content: prompt.user ?? (finish ? "Evalúa la conversación anterior." : "Empieza tú la conversación saludando brevemente como el cliente.") }];

    if (action === "roleplay" && finish) {
      messages.push({ role: "user", content: "FIN DEL ROLEPLAY. Evalúa ahora mi actuación como comercial según el formato JSON indicado." });
    }

    const result = await callAnthropic(prompt.system, messages);
    if ("error" in result && result.error) return NextResponse.json({ error: result.error }, { status: 503 });

    let json: unknown;
    try {
      json = parseJson(result.text!);
    } catch {
      return NextResponse.json({ error: "No se pudo generar un resultado estructurado. Vuelve a intentarlo." }, { status: 502 });
    }
    return NextResponse.json({ data: json });
  } catch (e) {
    console.error("AI route error", e);
    return NextResponse.json({ error: "Error inesperado. Inténtalo de nuevo." }, { status: 500 });
  }
}

// =====================================================================
// Capa de prompts de MeetingPrep.
// Cada función devuelve { system, user } y el handler exige JSON válido.
// Regla común: cero frases genéricas, todo accionable y comercial.
// =====================================================================

const ANTI_GENERICO = `
REGLAS DE CALIDAD (obligatorias):
- Prohibido lo genérico: nada de "conocer mejor sus necesidades", "aportar valor", "ofrecer una solución personalizada", "entender sus retos".
- Cada pregunta debe poder hacerse tal cual en una reunión real y obligar al cliente a concretar (cifras, plazos, consecuencias, nombres de rol).
- Cada recomendación debe decir QUÉ hacer, CUÁNDO y CÓMO suena dicho en voz alta.
- Si falta información, formula hipótesis explícitas marcadas como hipótesis; nunca inventes datos verificables (emails, teléfonos, cifras de facturación concretas, nombres de personas).
- Escribe en español de España, tono profesional y directo, como un director comercial senior.
- Responde ÚNICAMENTE con JSON válido. Sin markdown, sin texto antes o después.`;

export function meetingPrepPrompt
// 3. Reemplaza TODA la función meetingPrepPrompt (hasta el cierre de llaves })
//    por la versión de abajo.
// 4. Busca con Cmd+F: export function deepResearchPrompt
// 5. Reemplaza TODA la función deepResearchPrompt por la versión de abajo.
// ================================================================

// ── REEMPLAZA meetingPrepPrompt ──────────────────────────────────
export function meetingPrepPrompt(input: Record<string, unknown>) {
  const hasResearch = input.research_externo && (input.research_externo as string).length > 50;
  return {
    system: `Eres un director comercial senior especializado en venta consultiva B2B de servicios. Preparas a un comercial para una reunión concreta. Tu preparación debe ser HIPER-ESPECÍFICA para ESTA empresa, ESTE interlocutor y ESTE objetivo.

${hasResearch ? `INSTRUCCIÓN CRÍTICA: Tienes un briefing de research externo real sobre la empresa. DEBES usarlo activamente: cita datos concretos, menciona noticias recientes, usa nombres de clientes/proyectos reales encontrados, referencia la situación actual del mercado. Una preparación genérica que ignore el research es un fallo grave.` : ""}

${`
REGLAS DE CALIDAD (obligatorias):
- Prohibido lo genérico: nada de "conocer mejor sus necesidades", "aportar valor", "ofrecer una solución personalizada", "entender sus retos".
- Cada pregunta debe poder hacerse tal cual en una reunión real y obligar al cliente a concretar (cifras, plazos, consecuencias, nombres de rol).
- Cada recomendación debe decir QUÉ hacer, CUÁNDO y CÓMO suena dicho en voz alta.
- Si falta información, formula hipótesis explícitas marcadas como hipótesis; nunca inventes datos verificables (emails, teléfonos, cifras de facturación concretas, nombres de personas).
- Escribe en español de España, tono profesional y directo, como un director comercial senior.
- Responde ÚNICAMENTE con JSON válido. Sin markdown, sin texto antes o después.`}

Devuelve JSON con esta forma exacta:
{
 "resumen_ejecutivo": "4-6 frases específicas sobre la cuenta, su situación actual y el contexto concreto de esta reunión. Si hay research externo, incorpora datos reales.",
 "contexto_mercado": "2-3 frases sobre qué está pasando en el sector/mercado de esta empresa ahora mismo y cómo les afecta directamente.",
 "senales_recientes": ["señal concreta reciente (noticia, cambio, movimiento) que justifica que la reunión sea ahora y no en 6 meses"],
 "hipotesis_negocio": ["hipótesis concreta sobre su situación de negocio, basada en datos reales cuando estén disponibles"],
 "posibles_dolores": ["dolor concreto y por qué es plausible en esta empresa ahora mismo"],
 "riesgos_reunion": ["riesgo concreto de esta reunión y cómo mitigarlo"],
 "mapa_poder": "quién decide probablemente, quién influye, quién puede bloquear, según cargo y tamaño de empresa",
 "preguntas_discovery": ["6-8 preguntas que obligan a concretar contexto, dolor y proceso actual — formuladas en primera persona, listas para decir en voz alta"],
 "preguntas_estrategicas": ["4-5 preguntas sobre impacto económico, urgencia, decisión y criterios"],
 "preguntas_incomodas": ["3 preguntas incómodas pero útiles, formuladas con elegancia"],
 "objeciones_probables": [{"objecion":"...","que_significa":"...","respuesta_recomendada":"frase literal que puede decir el comercial"}],
 "apertura_sugerida": "primeras 3-4 frases literales para abrir la reunión, específicas para este interlocutor y este momento",
 "cierre_recomendado": "cómo cerrar pidiendo un compromiso concreto con entregable y plazo, en frases literales",
 "siguiente_paso_ideal": "el próximo paso específico que debe salir de esta reunión, con plazo concreto",
 "checklist": ["6-8 comprobaciones antes de entrar en la reunión, específicas para esta cuenta"]
}`,
    user: `Prepara esta reunión con toda la especificidad posible:\n${JSON.stringify(input, null, 2)}`,
  };
}

// ── REEMPLAZA deepResearchPrompt ─────────────────────────────────
export function deepResearchPrompt(input: Record<string, unknown>) {
  const empresa = (input.company_name || input.empresa || "la empresa") as string;
  const interlocutor = (input.contact_name || input.interlocutor || "") as string;
  const cargo = (input.contact_role || input.cargo || "") as string;
  const sector = (input.sector || input.industry || "") as string;
  const web = (input.website || input.web || "") as string;

  return {
    system: `Eres un analista de inteligencia comercial de primer nivel, especializado en preparar briefings para reuniones B2B de alto valor. Tu trabajo es investigar en profundidad una empresa y su interlocutor antes de una reunión comercial.

Realiza múltiples búsquedas exhaustivas y devuelve un briefing estructurado en texto plano (NO JSON). Sé específico, concreto y accionable. Cita fuentes y fechas cuando sean relevantes. Prioriza información de los últimos 12 meses. Si no encuentras algo, dilo explícitamente.

Estructura tu respuesta así:

## EMPRESA
- Actividad principal, productos/servicios clave, modelo de negocio
- Tamaño (empleados, facturación si está disponible), presencia geográfica
- Clientes tipo y mercados que atienden
- Posicionamiento y propuesta de valor diferencial vs competidores

## SITUACIÓN ACTUAL Y NOTICIAS RECIENTES (últimos 12 meses)
- Últimas noticias relevantes (expansión, contratos ganados, cambios directivos, financiación, problemas)
- Iniciativas estratégicas en marcha o anunciadas
- Señales de crecimiento, dificultad o transformación
- Proyectos o clientes relevantes mencionados públicamente

## SECTOR Y MERCADO
- Tendencias del sector que afectan directamente a esta empresa ahora mismo
- Principales retos del sector en 2025-2026
- Regulación relevante si aplica
- Oportunidades de mercado que esta empresa puede estar persiguiendo

## COMPETIDORES
- Quiénes son sus principales competidores directos (con nombres)
- Cómo se diferencia (o no) esta empresa de ellos
- Posición competitiva percibida: ¿líder, retador, seguidor?
- Movimientos recientes de competidores que les pueden afectar

## INTERLOCUTOR
- Perfil profesional del contacto (cargo, trayectoria, áreas de responsabilidad, tiempo en el puesto)
- Publicaciones, entrevistas, ponencias o apariciones públicas relevantes
- Estilo de comunicación inferido
- Prioridades probables según su rol y el momento de la empresa

## SEÑALES COMERCIALES
- Indicios concretos de necesidad o dolor que justifiquen la reunión ahora
- Momentos de cambio (nuevo cargo, nueva estrategia, crecimiento reciente, problema conocido) que crean ventana de oportunidad
- Por qué AHORA es buen momento para esta reunión
- Posibles objeciones basadas en el contexto real de la empresa`,
    user: `Investiga en profundidad para preparar una reunión comercial de alto nivel.

Empresa: ${empresa}
${web ? `Web corporativa: ${web}` : ""}
${sector ? `Sector: ${sector}` : ""}
${interlocutor ? `Interlocutor: ${interlocutor}` : ""}
${cargo ? `Cargo: ${cargo}` : ""}
${input.description ? `Descripción/contexto: ${input.description}` : ""}
${input.pain_hypothesis ? `Hipótesis de dolor inicial: ${input.pain_hypothesis}` : ""}
${input.notes ? `Notas adicionales: ${input.notes}` : ""}

Haz todas las búsquedas necesarias. Como mínimo busca:
1. Web corporativa y "about" de ${empresa}
2. Noticias recientes de ${empresa} (últimos 12 meses)
3. ${empresa} proyectos contratos clientes 2024 2025
4. ${empresa} expansión internacional o nuevos mercados
5. ${interlocutor ? `Perfil de ${interlocutor} LinkedIn o entrevistas` : `Directivos de ${empresa}`}
6. Tendencias y retos del sector: ${sector || empresa}
7. Competidores principales de ${empresa}
8. ${empresa} resultados financieros o facturación

Sé exhaustivo. Cada sección debe tener datos concretos o indicar explícitamente que no se encontró información.`,
  };
}

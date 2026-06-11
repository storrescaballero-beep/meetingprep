export const PLANS = [
  {
    id: "free", name: "Free", price: "0 €", period: "para siempre",
    tagline: "Para probar el flujo completo.",
    features: ["3 reuniones al mes", "3 propuestas al mes", "1 usuario", "CRM básico"],
    cta: "Empezar gratis",
  },
  {
    id: "pro", name: "Pro", price: "29 €", period: "/mes",
    tagline: "Para el comercial que vive de sus reuniones.", highlight: true,
    features: ["Reuniones ilimitadas", "Propuestas ilimitadas", "Roleplay comercial", "Scoring de oportunidades", "Exportación de propuestas"],
    cta: "Pasar a Pro",
  },
  {
    id: "business", name: "Business", price: "79 €", period: "/mes",
    tagline: "Para consultoras y agencias con volumen.",
    features: ["Todo lo de Pro", "Workspaces", "Plantillas avanzadas", "Histórico extendido", "Research avanzado"],
    cta: "Pasar a Business",
  },
  {
    id: "team", name: "Team", price: "149 €", period: "/mes · hasta 5 usuarios",
    tagline: "Para equipos comerciales que comparten pipeline.",
    features: ["Todo lo de Business", "Roles y permisos", "Pipeline compartido", "Reporting de equipo"],
    cta: "Hablar con nosotros",
  },
];

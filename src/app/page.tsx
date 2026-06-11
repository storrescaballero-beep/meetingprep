import Link from "next/link";
import { PLANS } from "@/lib/plans";

const PASOS = [
  ["Añade empresa e interlocutor", "Crea la cuenta en segundos: nombre, web, sector y con quién te reúnes."],
  ["Prepara la reunión con IA", "Hipótesis de negocio, dolores probables, mapa de poder y preguntas que obligan a concretar."],
  ["Practica con roleplay", "Ensaya contra un cliente escéptico, ocupado o que pide descuento. Recibe feedback y puntuación."],
  ["Pega tus notas después", "Notas sucias, tal cual salen de la reunión. Sin formato, sin orden."],
  ["Genera propuesta y próximos pasos", "Una propuesta basada en lo que el cliente realmente dijo, lista para editar y enviar."],
  ["Guarda todo en tu CRM ligero", "Empresa, contacto, reunión, propuesta, tareas y pipeline. Sin burocracia."],
];

const BENEFICIOS = [
  ["Preparación que se nota", "Entras a la reunión con hipótesis, riesgos y un mapa de poder. No con una pestaña de Google abierta."],
  ["Preguntas que abren oportunidades", "Nada de \u201c¿cuáles son vuestros retos?\u201d. Preguntas que obligan al cliente a hablar de impacto, urgencia y decisión."],
  ["Roleplay con objeciones reales", "\u201cEs caro\u201d, \u201cya trabajamos con otro\u201d, \u201cmándame información\u201d. Practica antes de que te lo digan de verdad."],
  ["Notas convertidas en CRM", "De un párrafo desordenado a necesidad, urgencia, decisores, riesgos y tareas. En un clic."],
  ["Propuestas en minutos, no en tardes", "Tres estilos: directa, consultiva y premium. Editables, copiables y vinculadas a la reunión."],
  ["Pipeline sin burocracia", "Ocho estados, scoring honesto de 0 a 100 y la siguiente mejor acción siempre visible."],
];

const FAQ = [
  ["¿Es otro CRM más?", "No. MeetingPrep no intenta sustituir a tu CRM corporativo: es el copiloto de la reunión. Prepara, practica, estructura notas y genera la propuesta. El CRM ligero existe para que el seguimiento no se pierda."],
  ["¿La IA se inventa datos del cliente?", "No. MeetingPrep nunca inventa emails, teléfonos ni cifras. Trabaja con lo que tú introduces y con fuentes que tú aportas; lo no verificado se marca como no verificado."],
  ["¿Las propuestas suenan a texto de IA?", "Las propuestas se construyen sobre lo que el cliente dijo en tu reunión, con tres estilos de redacción comercial. Y todo es editable antes de enviar."],
  ["¿Qué pasa con los datos de mis contactos?", "Cada workspace está aislado: nadie ve tus datos. Tú eres responsable de introducir solo datos profesionales que tengas base legal para tratar, y puedes solicitar su eliminación cuando quieras."],
  ["¿Puedo probarlo sin pagar?", "Sí. El plan Free incluye 3 reuniones y 3 propuestas al mes, con el flujo completo: preparación, roleplay, notas y propuesta."],
];

function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          Meeting<span className="text-accent">Prep</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          <a href="#como-funciona" className="hover:text-ink">Cómo funciona</a>
          <a href="#beneficios" className="hover:text-ink">Beneficios</a>
          <a href="#precios" className="hover:text-ink">Precios</a>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link href="/login" className="btn-ghost">Iniciar sesión</Link>
          <Link href="/registro" className="btn-primary">Crear mi primera reunión</Link>
        </div>
      </div>
    </header>
  );
}

function HeroDemo() {
  return (
    <div className="card mx-auto mt-14 grid max-w-4xl overflow-hidden text-left md:grid-cols-[1fr_auto_1fr]">
      <div className="p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-mute">Tus notas, tal cual</p>
        <p className="rounded-lg bg-canvas p-4 text-sm leading-relaxed text-ink-soft">
          “cliente con problemas para encontrar perfiles comerciales senior, no le gusta pagar
          retained, necesita rapidez, habla de abrir delegación en Valencia, presupuesto no claro,
          próximo paso enviar propuesta el viernes”
        </p>
      </div>
      <div className="flex items-center justify-center px-2 py-4 text-accent">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-90 md:rotate-0"><path d="M5 12h14m0 0-6-6m6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className="border-t border-line bg-accent-soft/40 p-6 md:border-l md:border-t-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">Lo que genera MeetingPrep</p>
        <ul className="space-y-2 text-sm text-ink">
          <li><strong>Necesidad:</strong> incorporar perfiles comerciales senior con rapidez</li>
          <li><strong>Urgencia:</strong> alta — apertura de delegación en Valencia</li>
          <li><strong>Riesgo:</strong> presupuesto sin confirmar antes de proponer</li>
          <li><strong>Tarea:</strong> enviar propuesta el viernes · prioridad alta</li>
          <li><strong>Propuesta:</strong> borrador consultivo listo para editar →</li>
        </ul>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="bg-white">
      <Nav />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-20 text-center">
        <p className="mx-auto mb-5 w-fit rounded-full border border-line bg-canvas px-4 py-1.5 text-xs font-medium text-ink-soft">
          El copiloto comercial para venta consultiva B2B
        </p>
        <h1 className="font-display mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
          Prepara reuniones B2B. Detecta oportunidades.{" "}
          <span className="text-accent">Genera propuestas en minutos.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
          MeetingPrep ayuda a comerciales consultivos a investigar cuentas, preparar preguntas,
          registrar notas y convertir reuniones en propuestas comerciales listas para enviar.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/registro" className="btn-primary !px-7 !py-3.5 !text-base">Crear mi primera reunión</Link>
          <a href="#como-funciona" className="btn-secondary !px-7 !py-3.5 !text-base">Ver demo</a>
        </div>
        <p className="mt-4 text-xs text-ink-mute">Plan Free con 3 reuniones al mes · Sin tarjeta</p>
        <HeroDemo />
      </section>

      {/* PARA QUIÉN */}
      <section className="border-y border-line bg-canvas py-7">
        <p className="mx-auto max-w-5xl px-5 text-center text-sm text-ink-mute">
          Pensado para quien vende servicios B2B de ticket medio y alto: consultoría · headhunting ·
          agencias · RRHH · formación corporativa · tecnología · outsourcing
        </p>
      </section>

      {/* PROBLEMA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">La reunión fue bien. Y luego, nada.</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Conoces la secuencia: preparas la reunión en diez minutos entre llamada y llamada,
              improvisas las preguntas, tomas notas en cualquier sitio… y la propuesta se queda
              tres días en “la mando mañana”. Cuando la envías, ya suena genérica.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              "Entras a reuniones importantes con una preparación de dos líneas.",
              "Haces las mismas preguntas de siempre y el cliente da las respuestas de siempre.",
              "Tus notas post-reunión no las entiende ni tu CRM.",
              "La propuesta tarda días y pierde el momentum de la conversación.",
            ].map((t) => (
              <li key={t} className="card flex items-start gap-3 p-4 text-sm text-ink-soft">
                <span className="mt-0.5 text-danger">✕</span>{t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="border-y border-line bg-canvas py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-center text-3xl font-bold tracking-tight">Cómo funciona</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-soft">
            Un flujo, de la preparación a la propuesta. El orden importa porque es el de tu venta.
          </p>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {PASOS.map(([t, d], i) => (
              <li key={t} className="card p-6">
                <span className="font-display text-sm font-bold text-accent">Paso {i + 1}</span>
                <h3 className="font-display mt-2 text-base font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-center text-3xl font-bold tracking-tight">
          Compite por utilidad, velocidad y claridad
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {BENEFICIOS.map(([t, d]) => (
            <div key={t} className="card p-6">
              <h3 className="font-display text-base font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" className="border-y border-line bg-canvas py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-center text-3xl font-bold tracking-tight">Precios claros</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-soft">
            Si MeetingPrep no te ahorra horas cada semana, no merece tu suscripción. Empieza gratis.
          </p>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {PLANS.map((p) => (
              <div key={p.id} className={`card flex flex-col p-6 ${p.highlight ? "ring-2 ring-accent" : ""}`}>
                {p.highlight && <span className="badge mb-3 w-fit bg-accent text-white">Recomendado</span>}
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                <p className="mt-1 text-sm text-ink-mute">{p.tagline}</p>
                <p className="mt-4"><span className="font-display text-3xl font-extrabold">{p.price}</span>{" "}<span className="text-sm text-ink-mute">{p.period}</span></p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-ink-soft">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2"><span className="mt-0.5 text-accent">✓</span>{f}</li>
                  ))}
                </ul>
                <Link href="/registro" className={`${p.highlight ? "btn-primary" : "btn-secondary"} mt-6 w-full`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="font-display text-center text-3xl font-bold tracking-tight">Preguntas frecuentes</h2>
        <div className="mt-10 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="card group p-5">
              <summary className="cursor-pointer list-none font-display text-sm font-semibold">
                {q}<span className="float-right text-ink-mute transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-ink py-20 text-center text-white">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Tu próxima reunión merece llegar preparada.
          </h2>
          <p className="mt-4 text-white/70">
            Convierte cualquier reunión B2B en una propuesta comercial accionable en minutos.
          </p>
          <Link href="/registro" className="btn-primary mt-8 !px-8 !py-3.5 !text-base">Crear mi primera reunión</Link>
        </div>
      </section>

      <footer className="border-t border-line bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-ink-mute">
          <span className="font-display font-bold text-ink">Meeting<span className="text-accent">Prep</span></span>
          <nav className="flex gap-6">
            <Link href="/privacidad" className="hover:text-ink">Privacidad</Link>
            <Link href="/terminos" className="hover:text-ink">Términos de uso</Link>
            <Link href="/login" className="hover:text-ink">Iniciar sesión</Link>
          </nav>
          <span>© {new Date().getFullYear()} MeetingPrep</span>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";

export const metadata = { title: "Privacidad — MeetingPrep" };

export default function Privacidad() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link href="/" className="text-sm text-accent">← Volver</Link>
      <h1 className="font-display mt-4 text-3xl font-bold">Política de privacidad</h1>
      <p className="mt-2 text-sm text-ink-mute">Versión básica para fase de validación. Revísala con asesoramiento legal antes de comercializar.</p>
      <div className="prose-sm mt-8 space-y-6 leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">Qué datos guardamos</h2>
          <p>Tu cuenta (nombre, email), los datos de tu workspace y la información comercial que introduces: empresas, contactos profesionales, reuniones, notas, propuestas y tareas. También registramos actividad básica (creación y edición de registros) para tu histórico.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">Para qué se usan</h2>
          <p>Exclusivamente para prestarte el servicio: preparar reuniones, estructurar notas, generar propuestas y mantener tu seguimiento comercial. Los textos que envías a las funciones de IA se procesan a través de un proveedor de modelos de lenguaje únicamente para generar el resultado que solicitas. Tus datos no se venden ni se usan para publicidad.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">Tu responsabilidad como usuario</h2>
          <p><strong>Eres responsable de asegurar que tienes base legal para tratar los datos personales de los contactos comerciales que introduces</strong> (interés legítimo, relación contractual o consentimiento, según el caso, conforme al RGPD). Introduce únicamente datos profesionales necesarios. No introduzcas categorías especiales de datos (salud, ideología, etc.).</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">Aislamiento de datos</h2>
          <p>Los datos de cada usuario y workspace son privados. El aislamiento se aplica a nivel de base de datos (Row Level Security): ningún usuario puede acceder a datos de otro workspace.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">Tus derechos</h2>
          <p>Puedes ejercer acceso, rectificación, supresión, oposición y portabilidad sobre tus datos. Puedes solicitar la eliminación completa de tu cuenta y de tu workspace escribiendo al responsable del servicio; se atenderá en un plazo máximo de 30 días.</p>
        </section>
      </div>
    </main>
  );
}

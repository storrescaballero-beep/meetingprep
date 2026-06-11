import Link from "next/link";

export const metadata = { title: "Términos de uso — MeetingPrep" };

export default function Terminos() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link href="/" className="text-sm text-accent">← Volver</Link>
      <h1 className="font-display mt-4 text-3xl font-bold">Términos de uso</h1>
      <p className="mt-2 text-sm text-ink-mute">Versión básica para fase de validación.</p>
      <div className="mt-8 space-y-6 leading-relaxed text-ink-soft">
        <p><strong className="text-ink">1. El servicio.</strong> MeetingPrep es una herramienta de apoyo comercial: preparación de reuniones, roleplay, estructuración de notas, generación de propuestas y seguimiento. Los contenidos generados por IA son borradores de apoyo: revísalos siempre antes de enviarlos a un cliente.</p>
        <p><strong className="text-ink">2. Tu cuenta.</strong> Eres responsable de la confidencialidad de tus credenciales y de la actividad realizada con tu cuenta.</p>
        <p><strong className="text-ink">3. Uso aceptable.</strong> No está permitido usar el servicio para tratar datos sin base legal, hacer spam, introducir datos de terceros obtenidos ilícitamente, ni intentar acceder a datos de otros workspaces.</p>
        <p><strong className="text-ink">4. Sin garantías de resultado.</strong> MeetingPrep ayuda a preparar y proponer mejor; no garantiza la consecución de ventas ni la exactitud absoluta de los contenidos generados.</p>
        <p><strong className="text-ink">5. Planes y pagos.</strong> Las funcionalidades dependen del plan contratado. Los límites del plan Free se aplican por mes natural.</p>
        <p><strong className="text-ink">6. Cancelación.</strong> Puedes dejar de usar el servicio y solicitar la eliminación de tus datos en cualquier momento.</p>
      </div>
    </main>
  );
}

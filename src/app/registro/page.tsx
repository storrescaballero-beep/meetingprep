"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ErrorNote } from "@/components/ui";

export default function RegistroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName.trim().slice(0, 120), workspace_name: workspace.trim().slice(0, 120) } },
    });
    setLoading(false);
    if (error) { setError("No se pudo crear la cuenta. Revisa el email o inténtalo más tarde."); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
      <div className="card w-full max-w-md p-8">
        <Link href="/" className="font-display text-lg font-bold">Meeting<span className="text-accent">Prep</span></Link>
        <h1 className="font-display mt-6 text-xl font-bold">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-ink-mute">Plan Free: 3 reuniones y 3 propuestas al mes. Sin tarjeta.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="name">Tu nombre</label>
            <input id="name" required className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Laura Gómez" />
          </div>
          <div>
            <label className="label" htmlFor="ws">Nombre de tu workspace</label>
            <input id="ws" className="input" value={workspace} onChange={(e) => setWorkspace(e.target.value)} placeholder="Consultora Gómez (opcional)" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email profesional</label>
            <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input id="password" type="password" required minLength={8} className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Creando cuenta…" : "Crear cuenta gratis"}</button>
          <ErrorNote message={error} />
        </form>
        <p className="mt-4 text-center text-xs text-ink-mute">
          Al registrarte aceptas los <Link href="/terminos" className="underline">términos de uso</Link> y la{" "}
          <Link href="/privacidad" className="underline">política de privacidad</Link>.
        </p>
        <p className="mt-4 text-center text-sm text-ink-mute">
          ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-accent">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}

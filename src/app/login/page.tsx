"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { ErrorNote } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError("Email o contraseña incorrectos."); return; }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5">
      <div className="card w-full max-w-md p-8">
        <Link href="/" className="font-display text-lg font-bold">Meeting<span className="text-accent">Prep</span></Link>
        <h1 className="font-display mt-6 text-xl font-bold">Inicia sesión</h1>
        <p className="mt-1 text-sm text-ink-mute">Tu próxima reunión te está esperando.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input id="password" type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
          <ErrorNote message={error} />
        </form>
        <p className="mt-6 text-center text-sm text-ink-mute">
          ¿Aún no tienes cuenta? <Link href="/registro" className="font-medium text-accent">Regístrate gratis</Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

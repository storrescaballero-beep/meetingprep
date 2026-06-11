// Helper de cliente para llamar a la capa de IA con manejo de errores uniforme.
export async function aiCall<T = any>(body: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? "Error inesperado." };
    return { data: json.data as T };
  } catch {
    return { error: "No hay conexión con el servidor." };
  }
}

# MeetingPrep — Copiloto comercial para ventas B2B consultivas

> Convierte cualquier reunión B2B en una propuesta comercial accionable en minutos.

SaaS multiusuario construido con **Next.js 14 (App Router) + TypeScript + Tailwind + Supabase (PostgreSQL, Auth, RLS) + API de Anthropic**, listo para desplegar en **Vercel**.

---

## 1. Qué es y para quién

MeetingPrep acompaña a un comercial B2B consultivo (consultoría, software, marketing, ingeniería, formación, servicios financieros…) en todo el ciclo de una reunión:

1. **Antes**: preparación específica de la reunión (hipótesis, dolores, preguntas, objeciones probables, apertura y cierre) y **roleplay** con 10 perfiles de cliente + feedback puntuado.
2. **Después**: notas sucias → información estructurada de CRM, **scoring 0–100** con desglose, tareas sugeridas.
3. **Cierre**: **propuesta comercial** en 3 estilos (directa / consultiva / premium) con variantes y email de envío, más **5 emails de seguimiento**.
4. **Gestión**: CRM ligero (empresas, contactos, reuniones, propuestas, tareas, research), pipeline de 8 estados, informes y registro de actividad.

Reglas de producto que el código respeta:
- La IA **no inventa datos verificables** (emails, teléfonos, facturación). Los precios salen como `[AJUSTAR: …]`.
- Cero pantallas vacías: cada vista tiene empty state con la acción siguiente.
- Sin scraping: la pestaña de research es manual + resumen de IA marcado con nivel de confianza.

## 2. Estructura del proyecto

```
meetingprep/
├── supabase/migrations/0001_init.sql   # Esquema completo + RLS + triggers
├── middleware.ts                       # Protección de rutas con sesión
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing pública
│   │   ├── login/ · registro/          # Auth
│   │   ├── privacidad/ · terminos/     # Legal (RGPD)
│   │   ├── api/ai/route.ts             # ÚNICA ruta de IA (clave solo en servidor)
│   │   └── (app)/                      # Zona autenticada
│   │       ├── dashboard/ empresas/ contactos/ reuniones/
│   │       ├── propuestas/ pipeline/ tareas/ informes/ ajustes/
│   ├── lib/
│   │   ├── supabase/ (client.ts, server.ts)
│   │   ├── ai/ (prompts.ts, client.ts)
│   │   ├── types.ts · plans.ts
│   └── components/ (ui.tsx, nav.tsx)
```

## 3. Ejecución en local

Requisitos: Node 18.17+ y una cuenta gratuita de Supabase.

```bash
npm install
cp .env.example .env.local   # rellena las variables (punto 4)
npm run dev                  # http://localhost:3000
```

## 4. Variables de entorno

| Variable | Dónde se usa | Obligatoria |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | cliente y servidor | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente y servidor | Sí |
| `ANTHROPIC_API_KEY` | **solo servidor** (`/api/ai`) | Sí (para las funciones de IA) |
| `AI_MODEL` | servidor | No (por defecto `claude-sonnet-4-20250514`) |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | preparadas, **comentadas** | No |

La clave de IA nunca llega al navegador: todas las llamadas pasan por `/api/ai`, que exige sesión válida.

## 5. Conexión con Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta el contenido completo de `supabase/migrations/0001_init.sql`. Esto crea tablas, enums, índices, triggers (incluido el alta automática de workspace+perfil al registrarse y los límites del plan Free) y **todas las políticas RLS**.
3. En **Authentication → Providers**, deja activado Email. Para desarrollo puedes desactivar "Confirm email" y entrar directamente.
4. Copia URL y anon key de **Settings → API** a `.env.local`.

## 6. Conexión con la IA

- Proveedor: API de Anthropic (`https://api.anthropic.com/v1/messages`).
- Crea una clave en console.anthropic.com y ponla en `ANTHROPIC_API_KEY`.
- Para cambiar de modelo basta `AI_MODEL`. Para cambiar de proveedor (p. ej. OpenAI) solo hay que tocar `src/app/api/ai/route.ts`: los prompts (`src/lib/ai/prompts.ts`) son independientes del proveedor.

## 7. Deploy en Vercel

1. Sube el repo a GitHub y "Import Project" en Vercel (framework detectado: Next.js; sin config extra).
2. Añade las variables del punto 4 en **Settings → Environment Variables**.
3. En Supabase → **Authentication → URL Configuration**, añade tu dominio de Vercel como Site URL y redirect.
4. Deploy. `next.config.mjs` ya incluye cabeceras de seguridad (nosniff, frame-deny, referrer-policy).

## 8. Qué está implementado y funciona

- Registro/login con creación automática de workspace; multiusuario por roles (owner/admin/member) a nivel de esquema.
- Aislamiento estricto por workspace con **RLS en todas las tablas** (no depende del frontend).
- CRM: empresas (ficha completa), contactos (con trazabilidad de fuente y aviso RGPD), reuniones, propuestas, tareas, research manual, activity log automático por triggers.
- IA: preparación de reuniones, roleplay con 10 perfiles + evaluación puntuada, estructuración de notas, scoring 0–100 con desglose (se sincroniza con la empresa), propuestas en 3 estilos con 3 variantes + email, 5 emails de seguimiento, resumen comercial de research. Todos los outputs son **editables y copiables** sección a sección.
- Pipeline kanban de 8 estados (movimiento con selector, optimista con rollback).
- Informes: reuniones/propuestas del mes, scoring medio, embudo por estado, tasa de envío, ganado/perdido.
- Límites del plan Free (3 reuniones + 3 propuestas/mes) aplicados con **triggers de base de datos**: no se pueden saltar desde el cliente. Error legible con invitación a upgrade.
- Landing vendible, páginas de privacidad y términos, ajustes con plan actual.

## 9. Qué está preparado pero no activado

- **Stripe**: planes y precios definidos en `src/lib/plans.ts`, columna `plan` en `workspaces`, variables comentadas en `.env.example`, botón "Mejorar plan" deshabilitado en Ajustes. Activarlo = crear productos en Stripe + un endpoint de checkout + webhook que actualice `workspaces.plan`.
- **Invitaciones de equipo**: el esquema soporta varios usuarios por workspace (roles incluidos); falta la UI de invitación (hoy cada registro crea su workspace).
- **Cambio de estado sugerido con un clic** desde las notas (hoy la IA lo recomienda y se aplica desde ficha/pipeline).

## 10. Qué falta para producción seria

- Confirmación de email obligatoria + recuperación de contraseña (Supabase lo trae; falta la página de "reset").
- Rate limiting por usuario en `/api/ai` (hoy hay validación de sesión y tope de tamaño, no de frecuencia).
- Tests automatizados y monitorización de errores (Sentry o similar).
- Exportación de datos (RGPD: portabilidad) y borrado de cuenta self-service.

## 11. Riesgos de seguridad a vigilar

- **RLS es la frontera real**: cualquier tabla nueva debe llevar políticas desde el primer día.
- La anon key de Supabase es pública por diseño; lo crítico es no exponer la `service_role` (no se usa en este proyecto) ni `ANTHROPIC_API_KEY` (solo vive en el servidor).
- Los outputs de IA se guardan como JSONB: se renderizan como texto (React escapa por defecto), nunca usar `dangerouslySetInnerHTML` con ellos.
- Datos personales de contactos: el producto pide base legal y fuente; el responsable del tratamiento es el cliente (está reflejado en /privacidad y /terminos).

## 12. Mejoras siguientes recomendadas

1. Activar Stripe (es el bloqueo de monetización; todo lo demás ya limita por plan).
2. Invitaciones de equipo (desbloquea el plan Team de 149 €).
3. Recordatorios por email de tareas y reuniones (cron de Vercel + Resend).
4. Importación CSV de empresas/contactos para reducir fricción de onboarding.
5. Historial de versiones de propuesta y vista pública compartible con tracking de apertura.

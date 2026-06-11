-- =====================================================================
-- MeetingPrep · Esquema inicial + Row Level Security
-- Toda fila pertenece a un workspace. Ningún usuario ve datos de otro
-- workspace. Las políticas RLS son la frontera de seguridad real.
-- =====================================================================

-- ---------- ENUMS ----------
create type member_role as enum ('owner','admin','member');
create type pipeline_stage as enum ('nuevo','reunion_agendada','reunion_realizada','propuesta_enviada','negociacion','ganado','perdido','dormido');
create type meeting_type as enum ('discovery','propuesta','negociacion','seguimiento','reactivacion');
create type relationship_level as enum ('frio','templado','cliente','antiguo_cliente');
create type meeting_status as enum ('agendada','preparada','realizada','cancelada');
create type proposal_status as enum ('borrador','enviada','aceptada','rechazada');
create type task_priority as enum ('alta','media','baja');
create type task_status as enum ('pendiente','en_progreso','completada');
create type plan_tier as enum ('free','pro','business','team');

-- ---------- TABLAS ----------
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan plan_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role member_role not null default 'owner',
  workspace_id uuid not null references workspaces(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id),
  name text not null check (char_length(name) between 1 and 200),
  website text,
  sector text,
  country text,
  size text,
  description text,
  revenue_estimate text,
  pain_hypothesis text,
  opportunity_score int check (opportunity_score between 0 and 100),
  pipeline_stage pipeline_stage not null default 'nuevo',
  source text,                       -- de dónde sale la información
  confidence_score text default 'no_verificado', -- verificado | parcial | no_verificado
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 200),
  job_title text,
  email text,                        -- solo si está verificado; nunca inventado
  phone text,
  linkedin_url text,
  source text,
  confidence_score text default 'no_verificado',
  consent_notes text,                -- base legal / consentimiento RGPD
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table meetings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  created_by uuid not null references auth.users(id),
  title text not null,
  meeting_date timestamptz,
  objective text,
  service_offering text,             -- qué vende el usuario en esta reunión
  prior_context text,
  duration_minutes int,
  meeting_type meeting_type not null default 'discovery',
  relationship_level relationship_level not null default 'frio',
  status meeting_status not null default 'agendada',
  preparation_output jsonb,          -- output editable del preparador
  roleplay_output jsonb,             -- transcripción + feedback del roleplay
  notes_raw text,
  notes_structured jsonb,
  opportunity_score int check (opportunity_score between 0 and 100),
  score_breakdown jsonb,             -- explicación del scoring
  next_steps text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table proposals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  meeting_id uuid references meetings(id) on delete set null,
  created_by uuid not null references auth.users(id),
  title text not null,
  style text not null default 'consultiva', -- directa | consultiva | premium
  executive_summary text,
  detected_need text,
  proposed_solution text,
  scope text,
  methodology text,
  timeline text,
  deliverables text,
  pricing text,
  conditions text,
  next_steps text,
  email_draft text,
  variants jsonb,                    -- versiones corta / formal / premium
  status proposal_status not null default 'borrador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  meeting_id uuid references meetings(id) on delete set null,
  created_by uuid not null references auth.users(id),
  title text not null check (char_length(title) between 1 and 300),
  due_date date,
  priority task_priority not null default 'media',
  status task_status not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table research_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  content text not null,
  source text not null default 'manual',  -- manual | web_publica | api:<proveedor>
  source_url text,
  confidence text not null default 'no_verificado',
  collected_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,              -- created | updated | deleted | stage_changed ...
  detail text,
  created_at timestamptz not null default now()
);

-- ---------- ÍNDICES ----------
create index idx_companies_ws on companies(workspace_id, pipeline_stage);
create index idx_contacts_ws on contacts(workspace_id, company_id);
create index idx_meetings_ws on meetings(workspace_id, meeting_date);
create index idx_proposals_ws on proposals(workspace_id, status);
create index idx_tasks_ws on tasks(workspace_id, status, due_date);
create index idx_research_ws on research_notes(workspace_id, company_id);
create index idx_activity_ws on activity_log(workspace_id, created_at desc);

-- ---------- HELPERS ----------
-- Workspace del usuario autenticado (security definer para evitar recursión RLS)
create or replace function current_workspace_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select workspace_id from user_profiles where id = auth.uid()
$$;

create or replace function current_role_in_workspace()
returns member_role
language sql stable security definer set search_path = public as $$
  select role from user_profiles where id = auth.uid()
$$;

-- updated_at automático
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['workspaces','user_profiles','companies','contacts','meetings','proposals','tasks']
  loop
    execute format('create trigger trg_%s_updated before update on %s for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- Alta de usuario: crea workspace propio + perfil owner
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare ws_id uuid;
begin
  insert into workspaces (name, owner_id)
  values (coalesce(nullif(new.raw_user_meta_data->>'workspace_name',''), 'Mi workspace'), new.id)
  returning id into ws_id;

  insert into user_profiles (id, email, full_name, role, workspace_id)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''), 'owner', ws_id);
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- Límites del plan Free: 3 reuniones y 3 propuestas por mes natural.
-- Se aplica en base de datos: no se puede saltar desde el cliente.
create or replace function enforce_free_limits() returns trigger
language plpgsql security definer set search_path = public as $$
declare ws_plan plan_tier; cnt int;
begin
  select plan into ws_plan from workspaces where id = new.workspace_id;
  if ws_plan = 'free' then
    if tg_table_name = 'meetings' then
      select count(*) into cnt from meetings
        where workspace_id = new.workspace_id
          and created_at >= date_trunc('month', now());
      if cnt >= 3 then
        raise exception 'LIMITE_PLAN: el plan Free incluye 3 reuniones al mes. Pasa a Pro para reuniones ilimitadas.';
      end if;
    elsif tg_table_name = 'proposals' then
      select count(*) into cnt from proposals
        where workspace_id = new.workspace_id
          and created_at >= date_trunc('month', now());
      if cnt >= 3 then
        raise exception 'LIMITE_PLAN: el plan Free incluye 3 propuestas al mes. Pasa a Pro para propuestas ilimitadas.';
      end if;
    end if;
  end if;
  return new;
end $$;

create trigger trg_meetings_limit before insert on meetings
for each row execute function enforce_free_limits();
create trigger trg_proposals_limit before insert on proposals
for each row execute function enforce_free_limits();

-- Log de actividad automático en entidades clave
create or replace function log_activity() returns trigger
language plpgsql security definer set search_path = public as $$
declare ws uuid; act text; det text;
begin
  ws := coalesce(new.workspace_id, old.workspace_id);
  if tg_op = 'INSERT' then act := 'created'; det := null;
  elsif tg_op = 'DELETE' then act := 'deleted'; det := null;
  else
    act := 'updated';
    if tg_table_name = 'companies' and new.pipeline_stage is distinct from old.pipeline_stage then
      act := 'stage_changed'; det := old.pipeline_stage || ' → ' || new.pipeline_stage;
    end if;
  end if;
  insert into activity_log (workspace_id, user_id, entity_type, entity_id, action, detail)
  values (ws, auth.uid(), tg_table_name, coalesce(new.id, old.id), act, det);
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['companies','contacts','meetings','proposals','tasks']
  loop
    execute format('create trigger trg_%s_log after insert or update or delete on %s for each row execute function log_activity()', t, t);
  end loop;
end $$;

-- ---------- ROW LEVEL SECURITY ----------
alter table workspaces enable row level security;
alter table user_profiles enable row level security;
alter table companies enable row level security;
alter table contacts enable row level security;
alter table meetings enable row level security;
alter table proposals enable row level security;
alter table tasks enable row level security;
alter table research_notes enable row level security;
alter table activity_log enable row level security;

-- Workspaces: solo el propio
create policy ws_select on workspaces for select using (id = current_workspace_id());
create policy ws_update on workspaces for update
  using (id = current_workspace_id() and current_role_in_workspace() in ('owner','admin'))
  with check (id = current_workspace_id());

-- Perfiles: ver miembros del propio workspace, editar solo el propio perfil
create policy up_select on user_profiles for select using (workspace_id = current_workspace_id());
create policy up_update on user_profiles for update using (id = auth.uid()) with check (id = auth.uid() and workspace_id = current_workspace_id());

-- Patrón común para entidades de negocio: pertenencia estricta al workspace
do $$
declare t text;
begin
  foreach t in array array['companies','contacts','meetings','proposals','tasks','research_notes']
  loop
    execute format('create policy %1$s_select on %1$s for select using (workspace_id = current_workspace_id())', t);
    execute format('create policy %1$s_insert on %1$s for insert with check (workspace_id = current_workspace_id())', t);
    execute format('create policy %1$s_update on %1$s for update using (workspace_id = current_workspace_id()) with check (workspace_id = current_workspace_id())', t);
    execute format('create policy %1$s_delete on %1$s for delete using (workspace_id = current_workspace_id())', t);
  end loop;
end $$;

-- Activity log: solo lectura para miembros (lo escribe el trigger con security definer)
create policy al_select on activity_log for select using (workspace_id = current_workspace_id());

-- ═══════════════════════════════════════════════════════════════════
--  NOTIFICACIONES PARA EL PANEL ADMIN
--  Ejecuta este archivo UNA sola vez en Supabase:
--    Dashboard → SQL Editor → New query → pegar todo → Run
-- ═══════════════════════════════════════════════════════════════════

-- 1. Tabla ──────────────────────────────────────────────────────────
create table if not exists public.notificaciones (
  id         bigint generated always as identity primary key,
  tipo       text not null check (tipo in ('soporte','reset_solicitado','password_cambiada','registro')),
  nombre     text,
  email      text,
  mensaje    text,
  user_id    uuid references auth.users(id) on delete set null,
  leida      boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notificaciones_created_idx on public.notificaciones (created_at desc);
create index if not exists notificaciones_no_leidas_idx on public.notificaciones (leida) where leida = false;

-- 2. Helper: ¿el usuario actual es admin? ───────────────────────────
-- security definer evita que la política de `profiles` se evalúe en bucle.
create or replace function public.es_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select p.es_admin from public.profiles p where p.id = auth.uid()), false)
$$;

-- 3. Seguridad a nivel de fila (RLS) ────────────────────────────────
alter table public.notificaciones enable row level security;

drop policy if exists "crear notificaciones" on public.notificaciones;
drop policy if exists "admin lee notificaciones" on public.notificaciones;
drop policy if exists "admin actualiza notificaciones" on public.notificaciones;
drop policy if exists "admin borra notificaciones" on public.notificaciones;

-- Cualquiera puede CREAR una notificación: el aviso de "olvidé mi contraseña"
-- y el formulario de soporte del login ocurren sin sesión iniciada.
-- Los límites de largo evitan que alguien use la tabla como basurero.
create policy "crear notificaciones" on public.notificaciones
  for insert to anon, authenticated
  with check (
    tipo in ('soporte','reset_solicitado','password_cambiada','registro')
    and coalesce(length(mensaje), 0) <= 1000
    and coalesce(length(email), 0)   <= 200
    and coalesce(length(nombre), 0)  <= 100
    and leida = false
  );

-- Solo el admin puede LEER, MARCAR y BORRAR.
create policy "admin lee notificaciones" on public.notificaciones
  for select to authenticated using (public.es_admin());

create policy "admin actualiza notificaciones" on public.notificaciones
  for update to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "admin borra notificaciones" on public.notificaciones
  for delete to authenticated using (public.es_admin());

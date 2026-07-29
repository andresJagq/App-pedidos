-- ═══════════════════════════════════════════════════════════════════
--  CORREO EN LOS PERFILES
--  Sin esto, el panel solo puede mostrar el ID del usuario y no hay
--  forma de saber quién pidió restablecer su contraseña.
--  Ejecutar en: Dashboard → SQL Editor → New query → pegar todo → Run
-- ═══════════════════════════════════════════════════════════════════

-- 1. La columna ─────────────────────────────────────────────────────
alter table public.profiles add column if not exists email text;

-- 2. Rellenarla con los correos que ya existen ──────────────────────
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is distinct from u.email;

-- 3. Mantenerla al día cuando alguien se registre o cambie su correo ─
create or replace function public.sync_email_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end
$$;

-- El prefijo zz_ importa: Postgres dispara los triggers de un mismo evento en
-- orden alfabético, así que este corre DESPUÉS del que crea el perfil.
drop trigger if exists zz_sync_email_perfil on auth.users;
create trigger zz_sync_email_perfil
  after insert or update of email on auth.users
  for each row execute function public.sync_email_perfil();

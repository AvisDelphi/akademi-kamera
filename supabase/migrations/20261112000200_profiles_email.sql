-- supabase/migrations/20261112000200_profiles_email.sql
-- Admin user management needs to recognise accounts, but the e-mail only lives in auth.users.
-- Copy it into public.profiles: backfill existing users and fill it in the sign-up trigger.
-- Column privileges keep users from editing their own e-mail copy or anything except their
-- name (admins still change roles; RLS decides who may). Fresh installs already get this from
-- supabase/schema.sql. Safe to run more than once.

alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;

revoke update on public.profiles from authenticated;
grant update (full_name, role) on public.profiles to authenticated;

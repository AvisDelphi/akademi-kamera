-- supabase/migrations/20261109000000_lms_profiles.sql
-- Incremental upgrade for databases that were created before the LMS pages existed.
-- Fresh installs already get this policy from supabase/schema.sql.
-- Safe to run more than once.

drop policy if exists "read staff profiles" on public.profiles;

-- Any visitor may read instructor/admin display names so course pages can show
-- who teaches the course. Student profiles stay private.
create policy "read staff profiles" on public.profiles for select
  using (role in ('instructor', 'admin'));

-- supabase/migrations/20261112000100_restrict_lesson_progress.sql
-- G7: a student could record progress for lessons of unpublished courses. The single
-- "own lesson progress" policy (for all) is split so inserts are only allowed for
-- lessons whose course is published. Reading and deleting stay limited to own rows;
-- there is no update policy because completed_at is never edited.
-- Fresh installs already get these policies from supabase/schema.sql.
-- Safe to run more than once.

drop policy if exists "own lesson progress" on public.lesson_progress;
drop policy if exists "own lesson progress read" on public.lesson_progress;
drop policy if exists "own lesson progress insert" on public.lesson_progress;
drop policy if exists "own lesson progress delete" on public.lesson_progress;

create policy "own lesson progress read" on public.lesson_progress for select
  using (user_id = auth.uid());
create policy "own lesson progress insert" on public.lesson_progress for insert
  with check (user_id = auth.uid()
    and exists (select 1 from public.lessons l
                join public.modules m on m.id = l.module_id
                join public.courses c on c.id = m.course_id
                where l.id = lesson_id and c.is_published));
create policy "own lesson progress delete" on public.lesson_progress for delete
  using (user_id = auth.uid());

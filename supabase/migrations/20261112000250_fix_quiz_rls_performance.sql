-- supabase/migrations/20261112000250_fix_quiz_rls_performance.sql
-- The G5 policies on quiz_questions / quiz_options checked course ownership with a five-table
-- join. "for all" policies also apply to SELECT, and every joined table has RLS of its own, so
-- the planner expanded the policies recursively: reading quiz_options (a student taking a quiz)
-- could hang on a database without table statistics. Ownership is now checked by SECURITY
-- DEFINER helpers, which run without row security and are not expanded by the planner, and the
-- policies no longer apply to SELECT (split into insert/update/delete).
-- Same rules as before: the course's instructor or an admin. Safe to run more than once.

create or replace function public.owns_quiz(p_quiz_id bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.quizzes q
    join public.lessons l on l.id = q.lesson_id
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where q.id = p_quiz_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')
  );
$$;

create or replace function public.owns_question(p_question_id bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    join public.lessons l on l.id = q.lesson_id
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where qq.id = p_question_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')
  );
$$;

revoke all on function public.owns_quiz(bigint), public.owns_question(bigint) from public;
grant execute on function public.owns_quiz(bigint), public.owns_question(bigint) to anon, authenticated;

-- Write policies only (no SELECT): reads go through "read questions"/"read options", which already
-- let an instructor see their own drafts, so a per-row ownership check is not needed for reading.
drop policy if exists "owner writes questions" on public.quiz_questions;
drop policy if exists "owner inserts questions" on public.quiz_questions;
drop policy if exists "owner updates questions" on public.quiz_questions;
drop policy if exists "owner deletes questions" on public.quiz_questions;
create policy "owner inserts questions" on public.quiz_questions for insert
  with check (public.owns_quiz(quiz_id));
create policy "owner updates questions" on public.quiz_questions for update
  using (public.owns_quiz(quiz_id)) with check (public.owns_quiz(quiz_id));
create policy "owner deletes questions" on public.quiz_questions for delete
  using (public.owns_quiz(quiz_id));

drop policy if exists "owner writes options" on public.quiz_options;
drop policy if exists "owner inserts options" on public.quiz_options;
drop policy if exists "owner updates options" on public.quiz_options;
drop policy if exists "owner deletes options" on public.quiz_options;
create policy "owner inserts options" on public.quiz_options for insert
  with check (public.owns_question(question_id));
create policy "owner updates options" on public.quiz_options for update
  using (public.owns_question(question_id)) with check (public.owns_question(question_id));
create policy "owner deletes options" on public.quiz_options for delete
  using (public.owns_question(question_id));

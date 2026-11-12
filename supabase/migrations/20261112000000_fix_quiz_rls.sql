-- supabase/migrations/20261112000000_fix_quiz_rls.sql
-- G5: an instructor could edit quiz questions and options of ANY course, because the
-- write policies only checked the role. They now check course ownership through the
-- chain quiz -> lesson -> module -> course, like "owner writes quizzes". Admins keep
-- full access. Fresh installs already get these policies from supabase/schema.sql.
-- Safe to run more than once.

drop policy if exists "owner writes questions" on public.quiz_questions;
create policy "owner writes questions" on public.quiz_questions for all
  using (exists (select 1 from public.quizzes q
                 join public.lessons l on l.id = q.lesson_id
                 join public.modules m on m.id = l.module_id
                 join public.courses c on c.id = m.course_id
                 where q.id = quiz_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')))
  with check (exists (select 1 from public.quizzes q
                 join public.lessons l on l.id = q.lesson_id
                 join public.modules m on m.id = l.module_id
                 join public.courses c on c.id = m.course_id
                 where q.id = quiz_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')));

drop policy if exists "owner writes options" on public.quiz_options;
create policy "owner writes options" on public.quiz_options for all
  using (exists (select 1 from public.quiz_questions qq
                 join public.quizzes q on q.id = qq.quiz_id
                 join public.lessons l on l.id = q.lesson_id
                 join public.modules m on m.id = l.module_id
                 join public.courses c on c.id = m.course_id
                 where qq.id = question_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')))
  with check (exists (select 1 from public.quiz_questions qq
                 join public.quizzes q on q.id = qq.quiz_id
                 join public.lessons l on l.id = q.lesson_id
                 join public.modules m on m.id = l.module_id
                 join public.courses c on c.id = m.course_id
                 where qq.id = question_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')));

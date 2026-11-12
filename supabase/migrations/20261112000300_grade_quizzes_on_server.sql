-- supabase/migrations/20261112000300_grade_quizzes_on_server.sql
-- G4: quizzes were graded in the browser. The anon key is public, so students could read the
-- answer key (quiz_options.is_correct) and insert any score into quiz_attempts. Grading now
-- happens in the database:
--   * submit_quiz_attempt grades the answers, stores the attempt for logged-in users and returns
--     the score plus the correct options (revealed only after submitting)
--   * students can no longer insert quiz_attempts directly
--   * is_correct is no longer readable by anon/authenticated; get_quiz_answer_key gives the key to
--     the course's instructor and admins for the quiz editor
-- Fresh installs already get this from supabase/schema.sql. Safe to run more than once.

drop policy if exists "own quiz attempts insert" on public.quiz_attempts;

revoke select on public.quiz_options from anon, authenticated;
grant select (id, question_id, label) on public.quiz_options to anon, authenticated;

-- Grade `p_answers` ({ "<question id>": <option id> }) for a quiz the caller may see. Guests are
-- graded but nothing is stored; so are the course's own instructor (previewing as a student).
create or replace function public.submit_quiz_attempt(p_quiz_id bigint, p_answers jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_pass int;
  v_owner boolean;
  v_total int := 0;
  v_correct int := 0;
  v_score int;
  v_attempt bigint;
  v_results jsonb := '[]'::jsonb;
  v_chosen_map jsonb := '{}'::jsonb;
  q record;
  v_raw text;
  v_chosen bigint;
  v_belongs boolean;
  v_ok boolean;
  v_keys jsonb;
begin
  select qz.pass_score, (c.instructor_id = v_uid) into v_pass, v_owner
  from public.quizzes qz
  join public.lessons l on l.id = qz.lesson_id
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where qz.id = p_quiz_id
    and (c.is_published or c.instructor_id = v_uid or public.my_role() = 'admin');
  if not found then
    raise exception 'Kuis tidak ditemukan atau belum dipublikasikan.';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    p_answers := '{}'::jsonb;
  end if;

  for q in select id from public.quiz_questions where quiz_id = p_quiz_id order by position, id loop
    v_total := v_total + 1;
    v_raw := p_answers ->> q.id::text;
    v_chosen := case when v_raw ~ '^[0-9]{1,18}$' then v_raw::bigint end;

    -- The chosen option only counts if it belongs to this question.
    select exists (select 1 from public.quiz_options o where o.id = v_chosen and o.question_id = q.id)
      into v_belongs;
    select coalesce(bool_or(o.is_correct), false) into v_ok
      from public.quiz_options o where o.id = v_chosen and o.question_id = q.id;
    select coalesce(jsonb_agg(o.id order by o.id), '[]'::jsonb) into v_keys
      from public.quiz_options o where o.question_id = q.id and o.is_correct;

    if v_ok then v_correct := v_correct + 1; end if;
    if v_belongs then v_chosen_map := v_chosen_map || jsonb_build_object(q.id::text, v_chosen); end if;

    v_results := v_results || jsonb_build_object(
      'question_id', q.id,
      'is_correct', v_ok,
      'chosen_option_id', case when v_belongs then v_chosen end,
      'correct_option_ids', v_keys
    );
  end loop;

  if v_total = 0 then
    raise exception 'Kuis ini belum memiliki soal.';
  end if;

  v_score := round(100.0 * v_correct / v_total)::int;

  if v_uid is not null and not v_owner then
    insert into public.quiz_attempts (user_id, quiz_id, score, answers)
    values (v_uid, p_quiz_id, v_score, v_chosen_map)
    returning id into v_attempt;
  end if;

  return jsonb_build_object(
    'score', v_score,
    'correct', v_correct,
    'total', v_total,
    'passed', v_score >= v_pass,
    'pass_score', v_pass,
    'attempt_id', v_attempt,
    'results', v_results
  );
end;
$$;

-- Answer key for the quiz editor: only the course's instructor or an admin.
create or replace function public.get_quiz_answer_key(p_quiz_id bigint)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (
    select 1
    from public.quizzes qz
    join public.lessons l on l.id = qz.lesson_id
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where qz.id = p_quiz_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')
  ) then
    raise exception 'Akses ditolak.' using errcode = '42501';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object('question_id', qq.id, 'option_id', o.id) order by qq.id, o.id)
    from public.quiz_questions qq
    join public.quiz_options o on o.question_id = qq.id and o.is_correct
    where qq.quiz_id = p_quiz_id
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.submit_quiz_attempt(bigint, jsonb) from public;
grant execute on function public.submit_quiz_attempt(bigint, jsonb) to anon, authenticated;
revoke all on function public.get_quiz_answer_key(bigint) from public, anon;
grant execute on function public.get_quiz_answer_key(bigint) to authenticated;

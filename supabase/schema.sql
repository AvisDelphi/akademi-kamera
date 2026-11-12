-- supabase/schema.sql
-- Akademi Kamera database schema (PostgreSQL / Supabase).
-- Run once in Supabase Dashboard > SQL Editor.
-- Covers the full LMS (roles, courses, modules, lessons, quizzes, progress) and the
-- two main features (simulator exercise attempts, photo analyses).
-- Row Level Security (RLS) enforces who may read/write each row, because the
-- browser talks to the database directly with the public anon key.

-- ---------- Roles & profiles ----------
create type public.user_role as enum ('student', 'instructor', 'admin');

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  role        public.user_role not null default 'student',
  email       text,  -- copy of auth.users.email so admins can recognise accounts
  created_at  timestamptz not null default now()
);

-- Create a profile automatically when someone signs up. New users are always students;
-- only an admin can promote them (see policy below).
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by policies. SECURITY DEFINER avoids recursive RLS on profiles.
create function public.my_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------- Learning content ----------
create table public.courses (
  id             bigint generated always as identity primary key,
  instructor_id  uuid not null references public.profiles (id),
  title          text not null,
  description    text not null default '',
  level          text not null default 'pemula' check (level in ('pemula', 'menengah', 'mahir')),
  is_published   boolean not null default false,
  created_at     timestamptz not null default now()
);

create table public.modules (
  id         bigint generated always as identity primary key,
  course_id  bigint not null references public.courses (id) on delete cascade,
  title      text not null,
  position   int not null default 0
);

create table public.lessons (
  id                    bigint generated always as identity primary key,
  module_id             bigint not null references public.modules (id) on delete cascade,
  title                 text not null,
  content_md            text not null default '',
  -- Optional link from a lesson to a simulator exercise (lib/exercises.js id)
  simulator_exercise_id text,
  position              int not null default 0
);

create table public.quizzes (
  id          bigint generated always as identity primary key,
  lesson_id   bigint not null references public.lessons (id) on delete cascade,
  title       text not null,
  pass_score  int not null default 70 check (pass_score between 0 and 100)
);

create table public.quiz_questions (
  id        bigint generated always as identity primary key,
  quiz_id   bigint not null references public.quizzes (id) on delete cascade,
  prompt    text not null,
  position  int not null default 0
);

create table public.quiz_options (
  id           bigint generated always as identity primary key,
  question_id  bigint not null references public.quiz_questions (id) on delete cascade,
  label        text not null,
  is_correct   boolean not null default false
);

-- ---------- Student activity ----------
create table public.enrollments (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  course_id   bigint not null references public.courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table public.lesson_progress (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  lesson_id     bigint not null references public.lessons (id) on delete cascade,
  completed_at  timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.quiz_attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  quiz_id     bigint not null references public.quizzes (id) on delete cascade,
  score       int not null check (score between 0 and 100),
  answers     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- Feature 1: camera simulator
create table public.exercise_attempts (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  exercise_id  text not null,
  settings     jsonb not null,   -- aperture, shutter, iso, focalMm, onTripod
  metrics      jsonb not null,   -- offset, bgBlurPx, motionBlurPx, shakePx, noise, ...
  passed       boolean not null,
  created_at   timestamptz not null default now()
);

-- Feature 2: EXIF analysis (metadata and numbers only, never the photo)
create table public.photo_analyses (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  exif           jsonb not null,
  image_metrics  jsonb,
  fired_rules    text[] not null default '{}',
  created_at     timestamptz not null default now()
);

create index on public.modules (course_id);
create index on public.lessons (module_id);
create index on public.exercise_attempts (user_id, exercise_id);
create index on public.photo_analyses (user_id);

-- Ownership helpers for the quiz policies. SECURITY DEFINER keeps the planner from expanding
-- row-level security through five joined tables (see migration 20261112000250).
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

-- ---------- Row Level Security ----------
alter table public.profiles          enable row level security;
alter table public.courses           enable row level security;
alter table public.modules           enable row level security;
alter table public.lessons           enable row level security;
alter table public.quizzes           enable row level security;
alter table public.quiz_questions    enable row level security;
alter table public.quiz_options      enable row level security;
alter table public.enrollments       enable row level security;
alter table public.lesson_progress   enable row level security;
alter table public.quiz_attempts     enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.photo_analyses    enable row level security;

-- Profiles: everyone sees their own; instructors/admins see all; only admins change roles.
create policy "read own profile" on public.profiles for select
  using (id = auth.uid() or public.my_role() in ('instructor', 'admin'));
-- Any visitor may read staff display names so course pages can name the instructor.
-- Student profiles remain private.
create policy "read staff profiles" on public.profiles for select
  using (role in ('instructor', 'admin'));
create policy "update own name" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = public.my_role());
create policy "admin manages profiles" on public.profiles for all
  using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- Users may only change their name; admins may also change roles (RLS above decides who).
-- The e-mail copy is maintained by the sign-up trigger only.
revoke update on public.profiles from authenticated;
grant update (full_name, role) on public.profiles to authenticated;

-- Courses: published courses are readable by any logged-in user;
-- instructors manage their own; admins manage all.
create policy "read published courses" on public.courses for select
  using (is_published or instructor_id = auth.uid() or public.my_role() = 'admin');
create policy "instructor writes own courses" on public.courses for all
  using (instructor_id = auth.uid() and public.my_role() = 'instructor')
  with check (instructor_id = auth.uid() and public.my_role() = 'instructor');
create policy "admin writes courses" on public.courses for all
  using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- Course content follows the course it belongs to.
create policy "read modules" on public.modules for select
  using (exists (select 1 from public.courses c where c.id = course_id));
create policy "owner writes modules" on public.modules for all
  using (exists (select 1 from public.courses c where c.id = course_id
                 and (c.instructor_id = auth.uid() or public.my_role() = 'admin')))
  with check (exists (select 1 from public.courses c where c.id = course_id
                 and (c.instructor_id = auth.uid() or public.my_role() = 'admin')));

create policy "read lessons" on public.lessons for select
  using (exists (select 1 from public.modules m where m.id = module_id));
create policy "owner writes lessons" on public.lessons for all
  using (exists (select 1 from public.modules m join public.courses c on c.id = m.course_id
                 where m.id = module_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')))
  with check (exists (select 1 from public.modules m join public.courses c on c.id = m.course_id
                 where m.id = module_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')));

create policy "read quizzes" on public.quizzes for select
  using (exists (select 1 from public.lessons l where l.id = lesson_id));
create policy "owner writes quizzes" on public.quizzes for all
  using (exists (select 1 from public.lessons l join public.modules m on m.id = l.module_id
                 join public.courses c on c.id = m.course_id
                 where l.id = lesson_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')))
  with check (exists (select 1 from public.lessons l join public.modules m on m.id = l.module_id
                 join public.courses c on c.id = m.course_id
                 where l.id = lesson_id and (c.instructor_id = auth.uid() or public.my_role() = 'admin')));

create policy "read questions" on public.quiz_questions for select
  using (exists (select 1 from public.quizzes q where q.id = quiz_id));
-- Write policies only (no SELECT): reads go through the "read ..." policies, which already let an
-- instructor see their own drafts.
create policy "owner inserts questions" on public.quiz_questions for insert
  with check (public.owns_quiz(quiz_id));
create policy "owner updates questions" on public.quiz_questions for update
  using (public.owns_quiz(quiz_id)) with check (public.owns_quiz(quiz_id));
create policy "owner deletes questions" on public.quiz_questions for delete
  using (public.owns_quiz(quiz_id));

-- NOTE: students can read options, including is_correct. For the prototype that is
-- acceptable; for production, grade quizzes in a server-side function instead.
create policy "read options" on public.quiz_options for select
  using (exists (select 1 from public.quiz_questions qq where qq.id = question_id));
create policy "owner inserts options" on public.quiz_options for insert
  with check (public.owns_question(question_id));
create policy "owner updates options" on public.quiz_options for update
  using (public.owns_question(question_id)) with check (public.owns_question(question_id));
create policy "owner deletes options" on public.quiz_options for delete
  using (public.owns_question(question_id));

-- Student activity: students read/write only their own rows; instructors and admins can read all.
create policy "own enrollments" on public.enrollments for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "staff read enrollments" on public.enrollments for select
  using (public.my_role() in ('instructor', 'admin'));

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
create policy "staff read lesson progress" on public.lesson_progress for select
  using (public.my_role() in ('instructor', 'admin'));

create policy "own quiz attempts insert" on public.quiz_attempts for insert
  with check (user_id = auth.uid());
create policy "read quiz attempts" on public.quiz_attempts for select
  using (user_id = auth.uid() or public.my_role() in ('instructor', 'admin'));

create policy "own exercise attempts insert" on public.exercise_attempts for insert
  with check (user_id = auth.uid());
create policy "read exercise attempts" on public.exercise_attempts for select
  using (user_id = auth.uid() or public.my_role() in ('instructor', 'admin'));

create policy "own photo analyses insert" on public.photo_analyses for insert
  with check (user_id = auth.uid());
create policy "read photo analyses" on public.photo_analyses for select
  using (user_id = auth.uid() or public.my_role() in ('instructor', 'admin'));

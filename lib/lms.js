// lib/lms.js
// Data access for the LMS: courses, modules, lessons, quizzes, enrollments and
// progress. Every function talks to Supabase through the public anon key, so the
// Row Level Security policies in supabase/schema.sql decide what can be read or
// written. Components only see the simple shapes returned here.
import { supabase } from "./supabase.js";

const CONFIG_ERROR = "Supabase belum dikonfigurasi. Ikuti langkah pada README untuk mengaktifkan LMS.";

function client() {
  if (!supabase) throw new Error(CONFIG_ERROR);
  return supabase;
}

async function run(query) {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

async function runCount(query) {
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Accept only positive integers from URL parameters before sending them to Postgres. */
export function asId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error("Alamat halaman tidak valid.");
  return id;
}

const byPosition = (a, b) => Number(a.position ?? 0) - Number(b.position ?? 0);
const byId = (a, b) => Number(a.id) - Number(b.id);

// ---------- Courses ----------

export async function listPublishedCourses() {
  return (
    (await run(
      client()
        .from("courses")
        .select("id, title, description, level, created_at, instructor:profiles!courses_instructor_id_fkey(full_name)")
        .eq("is_published", true)
        .order("created_at", { ascending: true }),
    )) ?? []
  );
}

export async function getCourse(courseId) {
  const course = await run(
    client()
      .from("courses")
      .select("id, title, description, level, is_published, created_at, instructor:profiles!courses_instructor_id_fkey(full_name)")
      .eq("id", asId(courseId))
      .maybeSingle(),
  );
  if (!course) throw new Error("Kursus tidak ditemukan atau belum dipublikasikan.");
  return course;
}

/** Modules with their lessons and quizzes, sorted the same way for every reader. */
export async function getCourseOutline(courseId) {
  const modules =
    (await run(
      client()
        .from("modules")
        .select(
          "id, title, position, lessons(id, title, position, simulator_exercise_id, quizzes(id, title, pass_score))",
        )
        .eq("course_id", asId(courseId)),
    )) ?? [];

  return modules
    .map((module) => ({
      ...module,
      lessons: [...(module.lessons ?? [])].sort(byPosition).map((lesson) => ({
        ...lesson,
        quizzes: [...(lesson.quizzes ?? [])].sort(byId),
      })),
    }))
    .sort(byPosition);
}

export function flattenLessons(outline) {
  return outline.flatMap((module) =>
    (module.lessons ?? []).map((lesson) => ({ ...lesson, moduleTitle: module.title })),
  );
}

/** Lesson totals and completion percentage for a course outline. */
export function outlineStats(outline, completedLessonIds) {
  const lessons = flattenLessons(outline);
  const done = lessons.filter((lesson) => completedLessonIds.has(Number(lesson.id))).length;
  return {
    total: lessons.length,
    done,
    pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0,
  };
}

// ---------- Enrollment & progress ----------

export async function getEnrollment(userId, courseId) {
  const { data, error } = await client()
    .from("enrollments")
    .select("course_id, enrolled_at")
    .eq("user_id", userId)
    .eq("course_id", asId(courseId))
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function enroll(userId, courseId) {
  const { error } = await client()
    .from("enrollments")
    .upsert(
      { user_id: userId, course_id: asId(courseId) },
      { onConflict: "user_id,course_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(error.message);
}

/** Every lesson id the student has completed (all courses at once). */
export async function getCompletedLessonIds(userId) {
  const rows =
    (await run(
      client().from("lesson_progress").select("lesson_id").eq("user_id", userId),
    )) ?? [];
  return new Set(rows.map((row) => Number(row.lesson_id)));
}

export async function isLessonComplete(userId, lessonId) {
  const row = await run(
    client()
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("lesson_id", asId(lessonId))
      .maybeSingle(),
  );
  return Boolean(row);
}

export async function markLessonComplete(userId, lessonId) {
  const { error } = await client()
    .from("lesson_progress")
    .upsert(
      { user_id: userId, lesson_id: asId(lessonId) },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(error.message);
}

// ---------- Lessons ----------

export async function getLesson(lessonId) {
  const lesson = await run(
    client()
      .from("lessons")
      .select(
        "id, title, content_md, position, simulator_exercise_id, module_id, modules(id, title, position, course_id, courses(id, title))",
      )
      .eq("id", asId(lessonId))
      .maybeSingle(),
  );
  if (!lesson) throw new Error("Materi tidak ditemukan atau belum dipublikasikan.");
  return lesson;
}

export async function getQuizzesForLesson(lessonId) {
  const rows =
    (await run(
      client()
        .from("quizzes")
        .select("id, title, pass_score, quiz_questions(id)")
        .eq("lesson_id", asId(lessonId))
        .order("id", { ascending: true }),
    )) ?? [];
  return rows.map((quiz) => ({ ...quiz, questionCount: (quiz.quiz_questions ?? []).length }));
}

// ---------- Quizzes ----------

export async function getQuiz(quizId) {
  const quiz = await run(
    client()
      .from("quizzes")
      .select(
        "id, title, pass_score, lesson_id, lessons(id, title, module_id, modules(id, course_id, courses(id, title)))",
      )
      .eq("id", asId(quizId))
      .maybeSingle(),
  );
  if (!quiz) throw new Error("Kuis tidak ditemukan atau belum dipublikasikan.");

  const questions =
    (await run(
      client()
        .from("quiz_questions")
        .select("id, prompt, position, quiz_options(id, label)")
        .eq("quiz_id", quiz.id)
        .order("position", { ascending: true })
        .order("id", { ascending: true }),
    )) ?? [];

  return {
    ...quiz,
    questions: questions.map((question) => ({
      ...question,
      options: [...(question.quiz_options ?? [])].sort(byId),
    })),
  };
}

/**
 * Grade and store a quiz attempt in the database (public.submit_quiz_attempt). The answer key never
 * reaches the browser before this call; the result lists the correct options per question.
 * Guests are graded too, but nothing is stored for them.
 */
export async function submitQuizAttempt(quizId, answers) {
  const { data, error } = await client().rpc("submit_quiz_attempt", { p_quiz_id: asId(quizId), p_answers: answers });
  if (error) {
    if (error.code === "PGRST202" || /could not find the function/i.test(error.message)) {
      throw new Error("Penilaian kuis belum aktif di basis data. Jalankan migrasi 20261112000300_grade_quizzes_on_server.sql.");
    }
    throw new Error(error.message);
  }
  return data;
}

export async function getQuizAttempts(userId, quizId) {
  return (
    (await run(
      client()
        .from("quiz_attempts")
        .select("id, score, created_at")
        .eq("user_id", userId)
        .eq("quiz_id", asId(quizId))
        .order("created_at", { ascending: false })
        .limit(5),
    )) ?? []
  );
}

// ---------- Student dashboard ----------

export async function getDashboardData(userId) {
  const [enrollments, progress, quizAttempts, exerciseAttempts, photoAnalyses, quizCount, passedExerciseCount, photoCount] =
    await Promise.all([
    run(
      client()
        .from("enrollments")
        .select("course_id, enrolled_at, courses(id, title, level)")
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false }),
    ),
    run(
      client()
        .from("lesson_progress")
        .select("lesson_id, completed_at, lessons(id, module_id, modules(course_id))")
        .eq("user_id", userId),
    ),
    run(
      client()
        .from("quiz_attempts")
        .select(
          "id, score, created_at, quizzes(id, title, pass_score, lesson_id, lessons(id, title, modules(course_id)))",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8),
    ),
    run(
      client()
        .from("exercise_attempts")
        .select("id, exercise_id, passed, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8),
    ),
    run(
      client()
        .from("photo_analyses")
        .select("id, fired_rules, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ),
    runCount(
      client().from("quiz_attempts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ),
    runCount(
      client()
        .from("exercise_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("passed", true),
    ),
    runCount(
      client().from("photo_analyses").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ),
  ]);

  const courses = enrollments ?? [];
  const completedByCourse = {};
  for (const row of progress ?? []) {
    const courseId = Number(row.lessons?.modules?.course_id);
    if (!courseId) continue;
    completedByCourse[courseId] = (completedByCourse[courseId] ?? 0) + 1;
  }

  // One query for the lesson total of every enrolled course.
  let totalsByCourse = {};
  const courseIds = courses.map((course) => course.course_id);
  if (courseIds.length > 0) {
    const modules =
      (await run(
        client().from("modules").select("course_id, lessons(id)").in("course_id", courseIds),
      )) ?? [];
    totalsByCourse = modules.reduce((acc, module) => {
      const courseId = Number(module.course_id);
      acc[courseId] = (acc[courseId] ?? 0) + (module.lessons?.length ?? 0);
      return acc;
    }, {});
  }

  return {
    enrollments: courses,
    completedByCourse,
    totalsByCourse,
    quizAttempts: quizAttempts ?? [],
    exerciseAttempts: exerciseAttempts ?? [],
    photoAnalyses: photoAnalyses ?? [],
    completedLessons: (progress ?? []).length,
    totals: {
      quizAttempts: quizCount,
      passedExercises: passedExerciseCount,
      photoAnalyses: photoCount,
    },
  };
}

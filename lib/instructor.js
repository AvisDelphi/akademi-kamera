// lib/instructor.js
// Data access for the instructor area: own courses, the course/module/lesson/quiz editor
// and student progress. Like lib/lms.js, every call goes through the public anon key, so
// Row Level Security decides what is allowed; components never talk to Supabase directly.
import { supabase } from "./supabase.js";
import { asId } from "./lms.js";

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

const byPosition = (a, b) => Number(a.position ?? 0) - Number(b.position ?? 0) || Number(a.id) - Number(b.id);
const unique = (values) => [...new Set(values)];

// ---------- Courses ----------

/** Courses owned by the instructor (an admin sees every course). */
export async function listMyCourses(userId, role) {
  let query = client()
    .from("courses")
    .select("id, title, level, is_published, created_at, instructor_id, enrollments(count), modules(id, lessons(id))")
    .order("created_at", { ascending: false });
  if (role !== "admin") query = query.eq("instructor_id", userId);
  const rows = (await run(query)) ?? [];
  return rows.map((course) => ({
    ...course,
    students: course.enrollments?.[0]?.count ?? 0,
    moduleCount: (course.modules ?? []).length,
    lessonCount: (course.modules ?? []).reduce((sum, module) => sum + (module.lessons ?? []).length, 0),
  }));
}

/** New courses are always drafts (UIUX_GUIDELINE §15). */
export async function createCourse({ userId, title, description, level }) {
  return run(
    client()
      .from("courses")
      .insert({ instructor_id: userId, title, description, level, is_published: false })
      .select("id")
      .single(),
  );
}

export async function updateCourse(courseId, patch) {
  await run(client().from("courses").update(patch).eq("id", asId(courseId)));
}

export async function deleteCourse(courseId) {
  await run(client().from("courses").delete().eq("id", asId(courseId)));
}

/** Course with its modules, lessons and quiz counts, sorted for the editor. */
export async function getCourseForEdit(courseId) {
  const course = await run(
    client()
      .from("courses")
      .select(
        "id, title, description, level, is_published, instructor_id, modules(id, title, position, lessons(id, title, position, simulator_exercise_id, quizzes(id)))",
      )
      .eq("id", asId(courseId))
      .maybeSingle(),
  );
  if (!course) throw new Error("Kursus tidak ditemukan atau bukan milikmu.");
  return {
    ...course,
    modules: [...(course.modules ?? [])].sort(byPosition).map((module) => ({
      ...module,
      lessons: [...(module.lessons ?? [])].sort(byPosition),
    })),
  };
}

// ---------- Modules & lessons ----------

export async function addModule(courseId, title, position) {
  await run(client().from("modules").insert({ course_id: asId(courseId), title, position }));
}

export async function updateModule(moduleId, patch) {
  await run(client().from("modules").update(patch).eq("id", asId(moduleId)));
}

export async function deleteModule(moduleId) {
  await run(client().from("modules").delete().eq("id", asId(moduleId)));
}

export async function addLesson(moduleId, title, position) {
  return run(client().from("lessons").insert({ module_id: asId(moduleId), title, position }).select("id").single());
}

export async function updateLesson(lessonId, patch) {
  await run(client().from("lessons").update(patch).eq("id", asId(lessonId)));
}

export async function deleteLesson(lessonId) {
  await run(client().from("lessons").delete().eq("id", asId(lessonId)));
}

export async function getLessonForEdit(lessonId) {
  const lesson = await run(
    client()
      .from("lessons")
      .select(
        "id, title, content_md, position, simulator_exercise_id, module_id, modules(id, title, course_id, courses(id, title, is_published, instructor_id))",
      )
      .eq("id", asId(lessonId))
      .maybeSingle(),
  );
  if (!lesson) throw new Error("Materi tidak ditemukan atau bukan milikmu.");
  return lesson;
}

/** Swap two sibling rows' positions (modules or lessons) to move one up or down. */
export async function swapPositions(table, a, b) {
  if (table !== "modules" && table !== "lessons") throw new Error("Tabel tidak valid.");
  // Equal positions would make a swap a no-op, so give the pair distinct values first.
  const posA = Number(a.position ?? 0);
  const posB = Number(b.position ?? 0) === posA ? posA + 1 : Number(b.position ?? 0);
  await run(client().from(table).update({ position: posB }).eq("id", asId(a.id)));
  await run(client().from(table).update({ position: posA }).eq("id", asId(b.id)));
}

// ---------- Quizzes ----------

/**
 * Quizzes of a lesson with every question and option. `is_correct` is not readable from the table
 * any more, so the answer key comes from get_quiz_answer_key (course owner or admin only).
 */
export async function getLessonQuizzes(lessonId) {
  const rows =
    (await run(
      client()
        .from("quizzes")
        .select("id, title, pass_score, quiz_questions(id, prompt, position, quiz_options(id, label))")
        .eq("lesson_id", asId(lessonId))
        .order("id", { ascending: true }),
    )) ?? [];
  const keys = await Promise.all(rows.map((quiz) => run(client().rpc("get_quiz_answer_key", { p_quiz_id: quiz.id }))));
  return rows.map((quiz, index) => {
    const correct = new Set((keys[index] ?? []).map((entry) => Number(entry.option_id)));
    return {
      ...quiz,
      questions: [...(quiz.quiz_questions ?? [])].sort(byPosition).map((question) => ({
        ...question,
        options: [...(question.quiz_options ?? [])]
          .sort((a, b) => Number(a.id) - Number(b.id))
          .map((option) => ({ ...option, is_correct: correct.has(Number(option.id)) })),
      })),
    };
  });
}

export async function createQuiz(lessonId, title, passScore) {
  return run(
    client().from("quizzes").insert({ lesson_id: asId(lessonId), title, pass_score: passScore }).select("id").single(),
  );
}

export async function updateQuiz(quizId, patch) {
  await run(client().from("quizzes").update(patch).eq("id", asId(quizId)));
}

export async function deleteQuiz(quizId) {
  await run(client().from("quizzes").delete().eq("id", asId(quizId)));
}

/** Insert or update a question and replace its options. `options`: [{ label, isCorrect }]. */
export async function saveQuestion({ quizId, questionId, prompt, position, options }) {
  let id = questionId;
  if (id) {
    await run(client().from("quiz_questions").update({ prompt }).eq("id", asId(id)));
    await run(client().from("quiz_options").delete().eq("question_id", asId(id)));
  } else {
    const created = await run(
      client().from("quiz_questions").insert({ quiz_id: asId(quizId), prompt, position }).select("id").single(),
    );
    id = created.id;
  }
  await run(
    client()
      .from("quiz_options")
      .insert(options.map((option) => ({ question_id: id, label: option.label, is_correct: option.isCorrect }))),
  );
}

export async function deleteQuestion(questionId) {
  await run(client().from("quiz_questions").delete().eq("id", asId(questionId)));
}

// ---------- Overview & students ----------

/** Lesson and quiz ids that belong to a set of courses. */
async function contentIds(courseIds) {
  if (courseIds.length === 0) return { lessonIds: [], quizIds: [] };
  const modules =
    (await run(client().from("modules").select("course_id, lessons(id, quizzes(id))").in("course_id", courseIds))) ?? [];
  const lessons = modules.flatMap((module) => module.lessons ?? []);
  return {
    lessonIds: lessons.map((lesson) => lesson.id),
    quizIds: lessons.flatMap((lesson) => (lesson.quizzes ?? []).map((quiz) => quiz.id)),
  };
}

export async function getOverview(userId, role) {
  const courses = await listMyCourses(userId, role);
  const courseIds = courses.map((course) => course.id);
  const { lessonIds, quizIds } = await contentIds(courseIds);

  const [enrollments, progress, attempts] = await Promise.all([
    courseIds.length
      ? run(client().from("enrollments").select("user_id").in("course_id", courseIds))
      : Promise.resolve([]),
    lessonIds.length
      ? run(
          client()
            .from("lesson_progress")
            .select("user_id, completed_at, lessons(title), profiles(full_name)")
            .in("lesson_id", lessonIds)
            .order("completed_at", { ascending: false })
            .limit(300),
        )
      : Promise.resolve([]),
    quizIds.length
      ? run(
          client()
            .from("quiz_attempts")
            .select("score, created_at, quizzes(title, pass_score), profiles(full_name)")
            .in("quiz_id", quizIds)
            .order("created_at", { ascending: false })
            .limit(300),
        )
      : Promise.resolve([]),
  ]);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const scores = (attempts ?? []).map((row) => row.score);

  const activity = [
    ...(progress ?? []).map((row) => ({
      at: row.completed_at,
      name: row.profiles?.full_name || "Siswa",
      text: `menyelesaikan materi "${row.lessons?.title ?? "—"}"`,
    })),
    ...(attempts ?? []).map((row) => ({
      at: row.created_at,
      name: row.profiles?.full_name || "Siswa",
      text: `mengerjakan "${row.quizzes?.title ?? "kuis"}" dengan nilai ${row.score}`,
      passed: row.quizzes ? row.score >= row.quizzes.pass_score : null,
    })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8);

  return {
    courses,
    stats: {
      students: unique((enrollments ?? []).map((row) => row.user_id)).length,
      publishedCourses: courses.filter((course) => course.is_published).length,
      lessonsThisWeek: (progress ?? []).filter((row) => new Date(row.completed_at).getTime() >= weekAgo).length,
      averageScore: scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null,
    },
    activity,
  };
}

/** One row per enrolled student of a course: progress, best quiz score, passed exercises. */
export async function getCourseStudents(courseId) {
  const id = asId(courseId);
  const { lessonIds, quizIds } = await contentIds([id]);
  const enrollments =
    (await run(client().from("enrollments").select("user_id, enrolled_at, profiles(full_name)").eq("course_id", id))) ??
    [];
  const userIds = enrollments.map((row) => row.user_id);
  if (userIds.length === 0) return { students: [], totalLessons: lessonIds.length };

  const [progress, attempts, exercises] = await Promise.all([
    lessonIds.length
      ? run(client().from("lesson_progress").select("user_id, completed_at").in("lesson_id", lessonIds).in("user_id", userIds))
      : Promise.resolve([]),
    quizIds.length
      ? run(client().from("quiz_attempts").select("user_id, score, created_at").in("quiz_id", quizIds).in("user_id", userIds))
      : Promise.resolve([]),
    run(client().from("exercise_attempts").select("user_id, exercise_id, passed, created_at").in("user_id", userIds)),
  ]);

  const students = enrollments.map((row) => {
    const done = (progress ?? []).filter((item) => item.user_id === row.user_id);
    const quiz = (attempts ?? []).filter((item) => item.user_id === row.user_id);
    const practice = (exercises ?? []).filter((item) => item.user_id === row.user_id);
    const stamps = [row.enrolled_at, ...done.map((i) => i.completed_at), ...quiz.map((i) => i.created_at), ...practice.map((i) => i.created_at)];
    return {
      userId: row.user_id,
      name: row.profiles?.full_name || "Siswa",
      done: done.length,
      bestScore: quiz.length ? Math.max(...quiz.map((item) => item.score)) : null,
      passedExercises: unique(practice.filter((item) => item.passed).map((item) => item.exercise_id)).length,
      lastActivity: stamps.sort().at(-1),
    };
  });
  return { students: students.sort((a, b) => a.name.localeCompare(b.name, "id")), totalLessons: lessonIds.length };
}

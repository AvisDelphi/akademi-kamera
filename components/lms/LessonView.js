"use client";
// components/lms/LessonView.js — one lesson: reading content, completion, quiz and
// optional link to the matching simulator exercise.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  enroll,
  flattenLessons,
  getCourseOutline,
  getLesson,
  getQuizzesForLesson,
  isLessonComplete,
  markLessonComplete,
} from "@/lib/lms";
import { getExercise } from "@/lib/exercises";
import { Breadcrumbs, EmptyNote, ErrorNote, Loading, SupabaseNotice } from "./ui";
import Markdown from "./Markdown";

export default function LessonView({ courseId, lessonId }) {
  const { enabled, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [outline, setOutline] = useState([]);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || authLoading) return;
    let active = true;
    setStatus("loading");
    setError(null);
    Promise.all([
      getLesson(lessonId),
      getQuizzesForLesson(lessonId),
      user ? isLessonComplete(user.id, lessonId) : Promise.resolve(false),
      getCourseOutline(courseId),
    ])
      .then(([lessonRow, quizRows, completed, outlineRows]) => {
        if (!active) return;
        setLesson(lessonRow);
        setQuizzes(quizRows);
        setDone(completed);
        setOutline(outlineRows);
        setStatus("done");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [enabled, authLoading, user, courseId, lessonId, attempt]);

  const lessons = useMemo(() => flattenLessons(outline), [outline]);
  const index = lessons.findIndex((row) => Number(row.id) === Number(lessonId));
  const previous = index > 0 ? lessons[index - 1] : null;
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;
  const exercise = lesson?.simulator_exercise_id ? getExercise(lesson.simulator_exercise_id) : null;
  const course = lesson?.modules?.courses ?? null;
  const module = lesson?.modules ?? null;

  async function handleComplete() {
    if (!user) {
      router.push(`/masuk?next=${encodeURIComponent(`/kursus/${courseId}/lesson/${lessonId}`)}`);
      return;
    }
    setActionError(null);
    setSaving(true);
    try {
      // Completing a lesson from the catalog also enrolls the student, so the
      // course appears on the dashboard with the right progress.
      await enroll(user.id, courseId);
      await markLessonComplete(user.id, lessonId);
      setDone(true);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!enabled) {
    return (
      <div className="py-8">
        <Breadcrumbs items={[{ label: "Kursus", href: "/kursus" }, { label: "Materi" }]} />
        <h1 className="mt-6 font-display text-4xl font-semibold">Materi</h1>
        <p className="mt-2 max-w-prose text-muted">
          Materi kursus, latihan simulator terkait, dan kuis untuk menguji pemahaman.
        </p>
        <div className="mt-8">
          <SupabaseNotice />
        </div>
      </div>
    );
  }
  if (authLoading || status === "loading") return <Loading label="Memuat materi…" />;
  if (status === "error") {
    return (
      <ErrorNote
        onRetry={() => {
          setStatus("loading");
          setAttempt((value) => value + 1);
        }}
      >
        Gagal memuat materi: {error}
      </ErrorNote>
    );
  }
  if (!lesson) return null;

  return (
    <div className="py-8">
      <Breadcrumbs
        items={[
          { label: "Kursus", href: "/kursus" },
          { label: course?.title ?? "Kursus", href: `/kursus/${courseId}` },
          { label: module?.title ?? "Modul" },
          { label: lesson.title },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0">
          <h1 className="font-display text-4xl font-semibold">{lesson.title}</h1>
          <div className="mt-6">
            {lesson.content_md?.trim() ? <Markdown text={lesson.content_md} /> : <EmptyNote>Materi ini belum diisi.</EmptyNote>}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-rule pt-6">
            {done ? (
              <p className="font-display text-correct">✓ Materi ini sudah ditandai selesai.</p>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving}
                className="rounded-full bg-amber px-5 py-2 font-display font-semibold text-surround disabled:opacity-60"
              >
                {saving ? "Menyimpan…" : user ? "Tandai selesai" : "Masuk untuk menandai selesai"}
              </button>
            )}
            <Link href={`/kursus/${courseId}`} className="text-sm text-muted underline">
              Kembali ke daftar materi
            </Link>
          </div>
          {actionError && (
            <p className="mt-3 text-sm text-over" role="alert">
              {actionError}
            </p>
          )}

          {(previous || next) && (
            <nav aria-label="Materi sebelumnya dan berikutnya" className="mt-8 grid gap-3 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={`/kursus/${courseId}/lesson/${previous.id}`}
                  className="rounded border border-rule p-4 hover:border-amber"
                >
                  <span className="text-xs text-muted">Sebelumnya</span>
                  <span className="mt-1 block font-display font-semibold">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/kursus/${courseId}/lesson/${next.id}`}
                  className="rounded border border-rule p-4 text-right hover:border-amber"
                >
                  <span className="text-xs text-muted">Berikutnya</span>
                  <span className="mt-1 block font-display font-semibold">{next.title}</span>
                </Link>
              )}
            </nav>
          )}
        </article>

        <aside className="space-y-4">
          {exercise && (
            <div className="rounded border border-rule bg-panel p-5">
              <h2 className="font-display text-lg font-semibold">Latihan simulator</h2>
              <p className="mt-1 text-sm text-muted">{exercise.title}</p>
              <p className="mt-2 text-sm text-muted">{exercise.brief}</p>
              <Link
                href={`/simulator?latihan=${encodeURIComponent(exercise.id)}`}
                className="mt-4 inline-block rounded-full bg-amber px-4 py-1.5 font-display font-semibold text-surround"
              >
                Buka latihan
              </Link>
            </div>
          )}

          {quizzes.length > 0 && (
            <div className="rounded border border-rule bg-panel p-5">
              <h2 className="font-display text-lg font-semibold">Uji pemahaman</h2>
              <ul className="mt-3 space-y-3">
                {quizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <Link
                      href={`/kursus/${courseId}/kuis/${quiz.id}`}
                      className="block rounded border border-rule p-3 hover:border-amber"
                    >
                      <span className="block font-semibold">{quiz.title}</span>
                      <span className="mt-1 block text-xs text-muted">
                        {quiz.questionCount} soal · lulus ≥ {quiz.pass_score}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!exercise && quizzes.length === 0 && (
            <div className="rounded border border-dashed border-rule p-5 text-sm text-muted">
              Materi ini belum memiliki latihan atau kuis.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

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
  getCompletedLessonIds,
  markLessonComplete,
} from "@/lib/lms";
import { getExercise } from "@/lib/exercises";
import { ArrowLeftIcon, ArrowRightIcon, CameraIcon, CheckIcon } from "@/components/icons";
import { Breadcrumbs, EmptyNote, ErrorNote, Loading, PageHeader, Pill, SupabaseNotice, Toast, btn } from "./ui";
import { useToast } from "./useToast";
import Markdown from "./Markdown";

export default function LessonView({ courseId, lessonId }) {
  const { enabled, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [outline, setOutline] = useState([]);
  const [completedIds, setCompletedIds] = useState(() => new Set());
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const toast = useToast();

  useEffect(() => {
    if (!enabled || authLoading) return;
    let active = true;
    setStatus("loading");
    setError(null);
    Promise.all([
      getLesson(lessonId),
      getQuizzesForLesson(lessonId),
      user ? getCompletedLessonIds(user.id) : Promise.resolve(new Set()),
      getCourseOutline(courseId),
    ])
      .then(([lessonRow, quizRows, completed, outlineRows]) => {
        if (!active) return;
        setLesson(lessonRow);
        setQuizzes(quizRows);
        setCompletedIds(completed);
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
  const done = completedIds.has(Number(lessonId));
  const moduleLessons = outline.find((row) => Number(row.id) === Number(module?.id))?.lessons ?? [];

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
      setCompletedIds((previous) => new Set(previous).add(Number(lessonId)));
      toast.show("Materi ditandai selesai");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!enabled) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Kursus", href: "/kursus" }, { label: "Materi" }]} />
        <PageHeader title="Materi" description="Materi kursus, latihan simulator terkait, dan kuis untuk menguji pemahaman." />
        <SupabaseNotice />
      </>
    );
  }
  if (authLoading || status === "loading") return <Loading label="Memuat materi…" />;
  if (status === "error") {
    return (
      <div className="py-8">
        <ErrorNote
          onRetry={() => {
            setStatus("loading");
            setAttempt((value) => value + 1);
          }}
        >
          Materi gagal dimuat: {error}. Periksa koneksi lalu coba lagi.
        </ErrorNote>
      </div>
    );
  }
  if (!lesson) return null;

  const lessonPath = `/kursus/${courseId}/lesson/${lessonId}`;
  const firstQuiz = quizzes[0] ?? null;

  return (
    <div className="pb-4">
      <Toast message={toast.message} onClose={toast.close} />
      <Breadcrumbs
        items={[
          { label: "Kursus", href: "/kursus" },
          { label: course?.title ?? "Kursus", href: `/kursus/${courseId}` },
          { label: lesson.title },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0 rounded-3xl border border-tinta-100 bg-white p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-sprout-700">
            {module?.title ?? "Modul"}
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-10">{lesson.title}</h1>
          <div className="mt-6">
            {lesson.content_md?.trim() ? (
              <Markdown text={lesson.content_md} />
            ) : (
              <EmptyNote>Materi ini belum diisi.</EmptyNote>
            )}
          </div>

          {/* Kartu sorotan: latihan simulator yang terhubung */}
          {exercise && (
            <div data-surface="dark" className="mt-10 flex flex-col gap-4 rounded-3xl bg-tinta-900 p-6 text-white sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-tinta-800 text-sprout-300">
                  <CameraIcon size={24} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-sprout-300">Coba di simulator</p>
                  <h2 className="text-lg font-semibold leading-7">Latihan: {exercise.title}</h2>
                </div>
              </div>
              <p className="max-w-xl text-sm leading-[22px] text-tinta-300">{exercise.brief}</p>
              <Link
                href={`/simulator?latihan=${encodeURIComponent(exercise.id)}`}
                className={`${btn("primary", "m")} self-start`}
              >
                Buka latihan
              </Link>
            </div>
          )}

          {/* Navigasi materi (§8.7) */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-tinta-100 pt-6">
            {previous ? (
              <Link href={`/kursus/${courseId}/lesson/${previous.id}`} className={btn("ghost", "m")}>
                <ArrowLeftIcon size={16} /> Sebelumnya
              </Link>
            ) : (
              <Link href={`/kursus/${courseId}`} className={btn("ghost", "m")}>
                <ArrowLeftIcon size={16} /> Daftar isi
              </Link>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {done && (
                <Pill tone="success" Icon={CheckIcon}>
                  Selesai
                </Pill>
              )}
              {!user ? (
                <Link href={`/masuk?next=${encodeURIComponent(lessonPath)}`} className={btn("primary", "m")}>
                  Masuk untuk menyimpan progres
                </Link>
              ) : firstQuiz ? (
                <>
                  {!done && (
                    <button type="button" onClick={handleComplete} disabled={saving} className={btn("secondary", "m")}>
                      {saving ? "Menyimpan…" : "Tandai selesai"}
                    </button>
                  )}
                  <Link href={`/kursus/${courseId}/kuis/${firstQuiz.id}`} className={btn("primary", "m")}>
                    Kerjakan kuis <ArrowRightIcon size={16} />
                  </Link>
                </>
              ) : done ? (
                next ? (
                  <Link href={`/kursus/${courseId}/lesson/${next.id}`} className={btn("primary", "m")}>
                    Materi berikutnya <ArrowRightIcon size={16} />
                  </Link>
                ) : (
                  <Link href={`/kursus/${courseId}`} className={btn("primary", "m")}>
                    Kembali ke kursus
                  </Link>
                )
              ) : (
                <button type="button" onClick={handleComplete} disabled={saving} className={btn("primary", "m")}>
                  {saving ? "Menyimpan…" : "Tandai selesai"}
                  {!saving && <ArrowRightIcon size={16} />}
                </button>
              )}
            </div>
          </div>
          {actionError && (
            <p className="mt-3 text-sm font-medium text-danger-fg" role="alert">
              {actionError}
            </p>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Daftar materi modul" className="rounded-3xl border border-tinta-100 bg-white p-5">
            <h2 className="px-1 text-base font-semibold leading-6">Daftar materi</h2>
            <p className="px-1 text-xs font-medium text-tinta-500">{module?.title}</p>
            <ul className="mt-3 space-y-1">
              {moduleLessons.map((row) => {
                const isCurrent = Number(row.id) === Number(lessonId);
                const isDone = completedIds.has(Number(row.id));
                return (
                  <li key={row.id}>
                    <Link
                      href={`/kursus/${courseId}/lesson/${row.id}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-[120ms] ${
                        isCurrent ? "bg-sprout-50 font-semibold" : "hover:bg-tinta-50"
                      }`}
                    >
                      <span
                        role="img"
                        aria-label={isDone ? "Selesai" : isCurrent ? "Sedang dibuka" : "Belum selesai"}
                        className={`grid size-5 shrink-0 place-items-center rounded-full ${
                          isDone
                            ? "bg-sprout-300 text-tinta-900"
                            : isCurrent
                              ? "border-2 border-sprout-300 bg-white"
                              : "border-2 border-tinta-200 bg-white"
                        }`}
                      >
                        {isDone && <CheckIcon size={12} />}
                      </span>
                      <span className="min-w-0 flex-1">{row.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {quizzes.length > 0 && (
            <div className="rounded-3xl border border-tinta-100 bg-white p-5">
              <h2 className="px-1 text-base font-semibold leading-6">Uji pemahaman</h2>
              <ul className="mt-3 space-y-2">
                {quizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <Link
                      href={`/kursus/${courseId}/kuis/${quiz.id}`}
                      className="block rounded-2xl border border-tinta-100 p-4 transition duration-200 hover:border-sprout-200 hover:bg-sprout-50"
                    >
                      <span className="block text-sm font-semibold">{quiz.title}</span>
                      <span className="mt-1 block text-xs font-medium text-tinta-500">
                        {quiz.questionCount} soal · lulus minimal {quiz.pass_score}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

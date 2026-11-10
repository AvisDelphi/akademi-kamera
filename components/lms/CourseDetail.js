"use client";
// components/lms/CourseDetail.js — course overview, enrollment and lesson list.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  enroll,
  flattenLessons,
  getCompletedLessonIds,
  getCourse,
  getCourseOutline,
  getEnrollment,
  outlineStats,
} from "@/lib/lms";
import { Breadcrumbs, ErrorNote, LevelBadge, Loading, ProgressBar, SupabaseNotice } from "./ui";

export default function CourseDetail({ courseId }) {
  const { enabled, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [outline, setOutline] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [completedIds, setCompletedIds] = useState(() => new Set());
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || authLoading) return;
    let active = true;
    setStatus("loading");
    setError(null);
    Promise.all([
      getCourse(courseId),
      getCourseOutline(courseId),
      user ? getEnrollment(user.id, courseId) : Promise.resolve(null),
      user ? getCompletedLessonIds(user.id) : Promise.resolve(new Set()),
    ])
      .then(([courseRow, outlineRows, enrollment, completed]) => {
        if (!active) return;
        setCourse(courseRow);
        setOutline(outlineRows);
        setEnrolled(Boolean(enrollment));
        setCompletedIds(completed);
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
  }, [enabled, authLoading, user, courseId, attempt]);

  const lessons = useMemo(() => flattenLessons(outline), [outline]);
  const stats = useMemo(() => outlineStats(outline, completedIds), [outline, completedIds]);
  const nextLesson = lessons.find((lesson) => !completedIds.has(Number(lesson.id)));

  async function handleEnroll() {
    if (!user) {
      router.push(`/masuk?next=${encodeURIComponent(`/kursus/${courseId}`)}`);
      return;
    }
    setActionError(null);
    setEnrolling(true);
    try {
      await enroll(user.id, courseId);
      setEnrolled(true);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setEnrolling(false);
    }
  }

  if (!enabled) {
    return (
      <div className="py-8">
        <Breadcrumbs items={[{ label: "Kursus", href: "/kursus" }, { label: "Detail kursus" }]} />
        <h1 className="mt-6 font-display text-4xl font-semibold">Detail kursus</h1>
        <p className="mt-2 max-w-prose text-muted">
          Daftar kursus, baca materi secara berurutan, dan simpan progres belajarmu.
        </p>
        <div className="mt-8">
          <SupabaseNotice />
        </div>
      </div>
    );
  }
  if (authLoading || status === "loading") return <Loading label="Memuat kursus…" />;
  if (status === "error") {
    return (
      <ErrorNote
        onRetry={() => {
          setStatus("loading");
          setAttempt((value) => value + 1);
        }}
      >
        Gagal memuat kursus: {error}
      </ErrorNote>
    );
  }
  if (!course) return null;

  return (
    <div className="py-8">
      <Breadcrumbs items={[{ label: "Kursus", href: "/kursus" }, { label: course.title }]} />

      <header className="mt-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl font-semibold">{course.title}</h1>
          <LevelBadge level={course.level} />
        </div>
        <p className="mt-3 whitespace-pre-line text-muted">{course.description}</p>
        <p className="mt-3 text-sm text-muted">
          {course.instructor?.full_name ? `Instruktur: ${course.instructor.full_name}` : "Kursus Akademi Kamera"}
          {lessons.length > 0 && ` · ${lessons.length} materi`}
        </p>
      </header>

      <section aria-label="Pendaftaran dan progres" className="mt-8 max-w-3xl rounded border border-rule bg-panel p-5">
        {!user && (
          <>
            <p className="text-muted">Masuk atau buat akun untuk mendaftar dan menyimpan progres belajar.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/masuk?next=${encodeURIComponent(`/kursus/${courseId}`)}`}
                className="rounded-full bg-amber px-5 py-2 font-display font-semibold text-surround"
              >
                Masuk
              </Link>
              <Link
                href={`/daftar?next=${encodeURIComponent(`/kursus/${courseId}`)}`}
                className="rounded-full border border-rule px-5 py-2 font-display font-semibold"
              >
                Buat akun
              </Link>
            </div>
          </>
        )}

        {user && !enrolled && (
          <>
            <p className="text-muted">Daftar kursus ini untuk menyimpan materi yang selesai dan nilai kuis.</p>
            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrolling}
              className="mt-4 rounded-full bg-amber px-5 py-2 font-display font-semibold text-surround disabled:opacity-60"
            >
              {enrolling ? "Mendaftarkan…" : "Daftar kursus ini"}
            </button>
          </>
        )}

        {user && enrolled && (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-lg font-semibold">
                Progres {stats.done}/{stats.total} materi
              </p>
              <p className="tabular text-sm text-muted">{stats.pct}%</p>
            </div>
            <div className="mt-2">
              <ProgressBar pct={stats.pct} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {nextLesson ? (
                <Link
                  href={`/kursus/${course.id}/lesson/${nextLesson.id}`}
                  className="rounded-full bg-amber px-5 py-2 font-display font-semibold text-surround"
                >
                  Lanjutkan: {nextLesson.title}
                </Link>
              ) : (
                <p className="text-correct">Semua materi sudah selesai. Kerjakan kuis untuk menguji pemahamanmu.</p>
              )}
              <Link href="/dasbor" className="rounded-full border border-rule px-5 py-2 font-display font-semibold">
                Buka dasbor
              </Link>
            </div>
          </>
        )}

        {actionError && (
          <p className="mt-3 text-sm text-over" role="alert">
            {actionError}
          </p>
        )}
      </section>

      <section aria-labelledby="materi-heading" className="mt-10 max-w-3xl">
        <h2 id="materi-heading" className="font-display text-2xl font-semibold">
          Materi kursus
        </h2>

        {outline.length === 0 ? (
          <p className="mt-4 rounded border border-dashed border-rule p-5 text-muted">
            Kursus ini belum memiliki modul. Instruktur dapat menambahkannya lewat SQL Editor.
          </p>
        ) : (
          <ol className="mt-4 space-y-8">
            {outline.map((module, moduleIndex) => (
              <li key={module.id}>
                <h3 className="font-display text-lg font-semibold">
                  <span className="mr-2 text-muted">{moduleIndex + 1}.</span>
                  {module.title}
                </h3>
                <ul className="mt-3 divide-y divide-rule rounded border border-rule">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const done = completedIds.has(Number(lesson.id));
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/kursus/${course.id}/lesson/${lesson.id}`}
                          className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-panel"
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                              done ? "border-correct text-correct" : "border-rule text-muted"
                            }`}
                            aria-label={done ? "selesai" : "belum selesai"}
                          >
                            {done ? "✓" : lessonIndex + 1}
                          </span>
                          <span className="flex-1">{lesson.title}</span>
                          {lesson.simulator_exercise_id && (
                            <span className="rounded-full border border-rule px-2 py-0.5 text-xs text-muted">
                              Simulator
                            </span>
                          )}
                          {lesson.quizzes.length > 0 && (
                            <span className="rounded-full border border-amber/60 px-2 py-0.5 text-xs text-amber">
                              Kuis
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

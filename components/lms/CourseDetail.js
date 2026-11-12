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
import { ApertureIcon, CameraIcon, CheckIcon, ChevronDownIcon } from "@/components/icons";
import {
  Banner,
  Breadcrumbs,
  ErrorNote,
  LevelBadge,
  Loading,
  PageHeader,
  Pill,
  ProgressRing,
  SupabaseNotice,
  btn,
} from "./ui";

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
      <>
        <Breadcrumbs items={[{ label: "Kursus", href: "/kursus" }, { label: "Detail kursus" }]} />
        <PageHeader
          title="Detail kursus"
          description="Daftar kursus, baca materi secara berurutan, dan simpan progres belajarmu."
        />
        <SupabaseNotice />
      </>
    );
  }
  if (authLoading || status === "loading") return <Loading label="Memuat kursus…" />;
  if (status === "error") {
    return (
      <div className="py-8">
        <ErrorNote
          onRetry={() => {
            setStatus("loading");
            setAttempt((value) => value + 1);
          }}
        >
          Kursus gagal dimuat: {error}. Periksa koneksi lalu coba lagi.
        </ErrorNote>
      </div>
    );
  }
  if (!course) return null;

  const loginHref = `/masuk?next=${encodeURIComponent(`/kursus/${courseId}`)}`;
  const quizCount = lessons.reduce((sum, lesson) => sum + lesson.quizzes.length, 0);
  const finished = enrolled && stats.total > 0 && stats.done >= stats.total;

  return (
    <div className="pb-4">
      <Breadcrumbs items={[{ label: "Kursus", href: "/kursus" }, { label: course.title }]} />

      {/* Hero (kartu Ink) */}
      <header data-surface="dark" className="mt-6 rounded-3xl bg-tinta-900 p-8 text-white sm:p-10">
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-tinta-300">
          <LevelBadge level={course.level} dark />
          <span>
            {outline.length} modul · {lessons.length} materi
            {quizCount > 0 && ` · ${quizCount} kuis`}
          </span>
        </div>
        <h1 className="mt-4 max-w-3xl text-[32px] font-bold leading-10">{course.title}</h1>
        <p className="mt-3 max-w-2xl whitespace-pre-line text-base leading-[26px] text-tinta-300">{course.description}</p>
        <p className="mt-3 text-sm font-medium text-tinta-300">
          {course.instructor?.full_name ? `Instruktur: ${course.instructor.full_name}` : "Kursus Akademi Kamera"}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {!user && (
            <>
              <Link href={loginHref} className={btn("primary", "l")}>
                Masuk untuk mulai kursus
              </Link>
              <Link
                href={`/daftar?next=${encodeURIComponent(`/kursus/${courseId}`)}`}
                className="inline-flex h-12 items-center rounded-xl px-6 text-base font-semibold text-white hover:bg-tinta-700"
              >
                Buat akun
              </Link>
            </>
          )}
          {user && !enrolled && (
            <button type="button" onClick={handleEnroll} disabled={enrolling} className={btn("primary", "l")}>
              {enrolling ? "Mendaftarkan…" : "Mulai kursus"}
            </button>
          )}
          {user && enrolled && nextLesson && (
            <Link href={`/kursus/${course.id}/lesson/${nextLesson.id}`} className={btn("primary", "l")}>
              {stats.done > 0 ? "Lanjutkan materi" : "Mulai materi pertama"}
            </Link>
          )}
          {finished && (
            <Link href="/analisis" className={btn("primary", "l")}>
              Analisis foto milikmu
            </Link>
          )}
        </div>
        {actionError && (
          <p className="mt-4 text-sm font-medium text-danger-bg" role="alert">
            {actionError}
          </p>
        )}
      </header>

      {finished && (
        <div className="mt-6">
          <Banner tone="success">
            <p className="font-semibold">Kursus selesai 🎉</p>
            <p className="mt-1">
              Semua {stats.total} materi sudah kamu selesaikan. Terapkan hasilnya: unggah fotomu dan lihat setelan yang
              bisa dicoba.
            </p>
          </Banner>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Daftar isi (accordion per modul) */}
        <section aria-labelledby="materi-heading" className="lg:col-start-1 lg:row-start-1">
          <h2 id="materi-heading" className="text-2xl font-bold leading-8">
            Daftar isi
          </h2>

          {outline.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-tinta-200 bg-white p-6 text-sm text-tinta-500">
              Kursus ini belum memiliki modul. Instruktur dapat menambahkannya lewat SQL Editor.
            </div>
          ) : (
            <ol className="mt-4 space-y-4">
              {outline.map((module, moduleIndex) => {
                const doneInModule = module.lessons.filter((lesson) => completedIds.has(Number(lesson.id))).length;
                return (
                  <li key={module.id}>
                    <details open className="group overflow-hidden rounded-3xl border border-tinta-100 bg-white">
                      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-6 py-4 [&::-webkit-details-marker]:hidden">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sprout-100 text-sm font-semibold text-sprout-800 tabular">
                          {moduleIndex + 1}
                        </span>
                        <span className="flex-1">
                          <span className="block text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">
                            Modul {moduleIndex + 1}
                          </span>
                          <span className="block text-base font-semibold leading-6">{module.title}</span>
                        </span>
                        {user && enrolled && (
                          <span className="hidden text-xs font-medium text-tinta-500 tabular sm:block">
                            {doneInModule}/{module.lessons.length} materi
                          </span>
                        )}
                        <ChevronDownIcon size={20} className="text-tinta-400 transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <ul className="divide-y divide-tinta-100 border-t border-tinta-100">
                        {module.lessons.map((lesson) => {
                          const done = completedIds.has(Number(lesson.id));
                          const current = nextLesson && Number(nextLesson.id) === Number(lesson.id);
                          return (
                            <li key={lesson.id}>
                              <Link
                                href={`/kursus/${course.id}/lesson/${lesson.id}`}
                                className="flex min-h-14 flex-wrap items-center gap-3 px-6 py-3 transition-colors duration-[120ms] hover:bg-sprout-50"
                              >
                                <span
                                  className={`grid size-5 shrink-0 place-items-center rounded-full ${
                                    done
                                      ? "bg-sprout-300 text-tinta-900"
                                      : current && enrolled
                                        ? "border-2 border-sprout-300 bg-white"
                                        : "border-2 border-tinta-200 bg-white"
                                  }`}
                                  role="img"
                                  aria-label={done ? "Selesai" : current && enrolled ? "Materi berikutnya" : "Belum selesai"}
                                >
                                  {done && <CheckIcon size={12} />}
                                </span>
                                <span className="min-w-0 flex-1 text-sm font-semibold">{lesson.title}</span>
                                {lesson.simulator_exercise_id && (
                                  <Pill tone="neutral" Icon={CameraIcon}>
                                    Latihan simulator
                                  </Pill>
                                )}
                                {lesson.quizzes.length > 0 && <Pill tone="success">Kuis</Pill>}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Progres kursus (menempel saat scroll di desktop; di mobile tampil di atas daftar isi) */}
        <aside
          aria-label="Progres kursus"
          className="order-first self-start rounded-3xl border border-tinta-100 bg-white p-6 lg:sticky lg:top-24 lg:order-none lg:col-start-2 lg:row-start-1"
        >
          <h2 className="text-base font-semibold leading-6">Progres kursus</h2>
          {user && enrolled ? (
            <div className="mt-4 flex items-center gap-5">
              <ProgressRing pct={stats.pct} label={`Progres kursus ${stats.pct}%`}>
                <span className="text-2xl font-bold tabular">{stats.pct}%</span>
              </ProgressRing>
              <div className="text-sm leading-[22px] text-tinta-500">
                <p>
                  <span className="font-semibold text-tinta-900 tabular">{stats.done}</span> dari{" "}
                  <span className="tabular">{stats.total}</span> materi
                </p>
                <Link href="/dasbor" className="mt-2 inline-block font-semibold text-sprout-700 hover:underline">
                  Buka dasbor
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sprout-100 text-sprout-800">
                <ApertureIcon size={24} />
              </span>
              <p className="text-sm leading-[22px] text-tinta-500">
                {user
                  ? "Mulai kursus ini untuk menyimpan materi yang selesai dan nilai kuis."
                  : "Masuk atau buat akun untuk mendaftar dan menyimpan progres belajar."}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

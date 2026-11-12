"use client";
// components/lms/Dashboard.js — dasbor siswa (UIUX_GUIDELINE §10): sapaan + langkah berikutnya,
// ringkasan, kursus yang diikuti, kuis/latihan terakhir, dan analisis foto terakhir.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  flattenLessons,
  getCompletedLessonIds,
  getCourseOutline,
  getDashboardData,
} from "@/lib/lms";
import { EXERCISES, getExercise } from "@/lib/exercises";
import { BookIcon, CameraIcon, CheckIcon, ChartIcon, ImageIcon, XIcon, ArrowRightIcon } from "@/components/icons";
import {
  AuthPrompt,
  EmptyNote,
  ErrorNote,
  LevelBadge,
  Loading,
  PageHeader,
  Pill,
  ProgressBar,
  StatCard,
  SupabaseNotice,
  btn,
} from "./ui";

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

function PassPill({ passed }) {
  return passed ? (
    <Pill tone="success" Icon={CheckIcon}>
      Lulus
    </Pill>
  ) : (
    <Pill tone="warning" Icon={XIcon}>
      Belum lulus
    </Pill>
  );
}

function SectionHeader({ id, title, href, linkLabel }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-2xl font-bold leading-8">
        {title}
      </h2>
      {href && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold text-sprout-700 hover:underline">
          {linkLabel} <ArrowRightIcon size={16} />
        </Link>
      )}
    </div>
  );
}

const listRow = "flex min-h-14 flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors duration-[120ms] hover:bg-sprout-50";

export default function Dashboard() {
  const { enabled, loading: authLoading, user, displayName } = useAuth();
  const [data, setData] = useState(null);
  const [resume, setResume] = useState(null); // { course, lesson } untuk "Lanjutkan materi"
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled || authLoading || !user) return;
    let active = true;
    setStatus("loading");
    setError(null);
    (async () => {
      const payload = await getDashboardData(user.id);
      // Materi pertama yang belum selesai pada kursus terbaru yang belum 100%.
      let next = null;
      const pending = payload.enrollments.find((row) => {
        const total = payload.totalsByCourse[row.course_id] ?? 0;
        return row.courses && total > 0 && (payload.completedByCourse[row.course_id] ?? 0) < total;
      });
      if (pending) {
        try {
          const [outline, completed] = await Promise.all([getCourseOutline(pending.course_id), getCompletedLessonIds(user.id)]);
          const lesson = flattenLessons(outline).find((row) => !completed.has(Number(row.id)));
          if (lesson) next = { course: pending.courses, lesson };
        } catch {
          // Tombol "Lanjutkan" cukup jatuh kembali ke daftar kursus.
        }
      }
      return { payload, next };
    })()
      .then(({ payload, next }) => {
        if (!active) return;
        setData(payload);
        setResume(next);
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
  }, [enabled, authLoading, user, reloadKey]);

  if (!enabled) {
    return (
      <>
        <PageHeader
          title="Dasbor"
          description="Ringkasan kursus yang diikuti, progres materi, nilai kuis, dan aktivitas belajar."
        />
        <SupabaseNotice />
      </>
    );
  }
  if (authLoading) return <Loading label="Memeriksa sesi…" />;
  if (!user) {
    return (
      <AuthPrompt
        next="/dasbor"
        message="Masuk untuk melihat kursus yang kamu ikuti, progres materi, nilai kuis, dan riwayat latihan."
      />
    );
  }
  if (status === "loading") return <Loading label="Memuat dasbor…" />;
  if (status === "error") {
    return (
      <div className="py-8">
        <ErrorNote
          onRetry={() => {
            setStatus("loading");
            setReloadKey((value) => value + 1);
          }}
        >
          Dasbor gagal dimuat: {error}. Periksa koneksi lalu coba lagi.
        </ErrorNote>
      </div>
    );
  }
  if (!data) return null;

  const { enrollments, completedByCourse, totalsByCourse, quizAttempts, exerciseAttempts, photoAnalyses } = data;

  const rows = enrollments
    .filter((enrollment) => enrollment.courses)
    .map((enrollment) => {
      const course = enrollment.courses;
      const done = completedByCourse[course.id] ?? 0;
      const total = totalsByCourse[course.id] ?? 0;
      const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
      return { course, done, total, pct };
    })
    // Kursus 100% turun ke bawah (§10.2).
    .sort((a, b) => Number(a.pct >= 100) - Number(b.pct >= 100));

  const totalLessons = rows.reduce((sum, row) => sum + row.total, 0);
  const avgQuiz = quizAttempts.length
    ? Math.round(quizAttempts.reduce((sum, row) => sum + row.score, 0) / quizAttempts.length)
    : null;

  return (
    <div className="flex flex-col gap-10 pb-4">
      {/* A. Sapaan */}
      <section aria-labelledby="sapaan" className="order-1 pt-8">
        <h1 id="sapaan" className="text-[32px] font-bold leading-10">
          Halo, {displayName || "Siswa"}. <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-[26px] text-tinta-500">
          {resume
            ? `Terakhir kamu belajar di kursus "${resume.course.title}". Materi berikutnya: "${resume.lesson.title}".`
            : rows.length > 0
              ? "Semua materi di kursusmu sudah selesai. Coba analisis fotomu sendiri untuk menerapkannya."
              : "Mulai dari kursus pertamamu, lalu praktikkan di simulator."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {resume ? (
            <Link href={`/kursus/${resume.course.id}/lesson/${resume.lesson.id}`} className={btn("primary", "l")}>
              Lanjutkan materi <ArrowRightIcon size={20} />
            </Link>
          ) : rows.length > 0 ? (
            <Link href="/analisis" className={btn("primary", "l")}>
              Analisis foto
            </Link>
          ) : (
            <Link href="/kursus" className={btn("primary", "l")}>
              Cari kursus
            </Link>
          )}
        </div>
      </section>

      {/* B. Ringkasan */}
      <section aria-label="Ringkasan" className="order-3 grid gap-4 sm:grid-cols-3 lg:order-2">
        <StatCard Icon={BookIcon} label="Materi selesai" value={`${data.completedLessons}/${totalLessons}`} />
        <StatCard
          Icon={ChartIcon}
          label="Rata-rata nilai kuis"
          value={avgQuiz ?? "—"}
          hint={avgQuiz === null ? "Belum ada kuis" : `dari ${quizAttempts.length} percobaan terakhir`}
        />
        <StatCard
          Icon={CameraIcon}
          label="Latihan lulus"
          value={`${data.totals.passedExercises}/${EXERCISES.length}`}
          hint="percobaan lulus tercatat"
        />
      </section>

      {/* C. Kursus */}
      <section aria-labelledby="kursus-saya" className="order-2 lg:order-3">
        <SectionHeader id="kursus-saya" title="Kursus yang kamu ikuti" href="/kursus" linkLabel="Lihat katalog" />
        {rows.length === 0 ? (
          <div className="mt-4">
            <EmptyNote Icon={BookIcon} action={{ href: "/kursus", label: "Jelajahi kursus" }}>
              Kamu belum mengikuti kursus.
            </EmptyNote>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {rows.map(({ course, done, total, pct }) => (
              <li
                key={course.id}
                className="rounded-3xl border border-tinta-100 bg-white p-6 shadow-e1 transition duration-200 hover:-translate-y-0.5 hover:border-sprout-200 hover:shadow-e2"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/kursus/${course.id}`} className="text-xl font-semibold leading-7 hover:underline">
                      {course.title}
                    </Link>
                    <LevelBadge level={course.level} />
                    {pct >= 100 && (
                      <Pill tone="success" Icon={CheckIcon}>
                        Selesai
                      </Pill>
                    )}
                  </div>
                  <Link href={`/kursus/${course.id}`} className={btn(pct >= 100 ? "secondary" : "dark", "s")}>
                    {pct >= 100 ? "Buka kursus" : "Lanjutkan"}
                  </Link>
                </div>
                <div className="mt-4 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-tinta-500">
                    {done} dari {total} materi
                  </span>
                  <span className="font-semibold text-sprout-700 tabular">{pct}%</span>
                </div>
                <div className="mt-2">
                  <ProgressBar pct={pct} size="l" label={`Progres ${course.title}: ${done} dari ${total} materi`} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* D + E */}
      <div className="order-4 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="kuis-terakhir">
          <SectionHeader id="kuis-terakhir" title="Kuis terakhir" />
          {quizAttempts.length === 0 ? (
            <div className="mt-4">
              <EmptyNote Icon={ChartIcon}>Belum ada nilai kuis. Buka materi yang memiliki kuis untuk mulai.</EmptyNote>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-tinta-100 overflow-hidden rounded-3xl border border-tinta-100 bg-white">
              {quizAttempts.slice(0, 5).map((attempt) => {
                const quiz = attempt.quizzes;
                const courseId = quiz?.lessons?.modules?.course_id;
                const passed = quiz ? attempt.score >= quiz.pass_score : false;
                const label = quiz?.title ?? "Kuis";
                const body = (
                  <>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{label}</p>
                      <p className="text-xs font-medium text-tinta-500">{formatDate(attempt.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold tabular">{attempt.score}</span>
                      <PassPill passed={passed} />
                    </div>
                  </>
                );
                return (
                  <li key={attempt.id}>
                    {quiz && courseId ? (
                      <Link href={`/kursus/${courseId}/kuis/${quiz.id}`} className={listRow}>
                        {body}
                      </Link>
                    ) : (
                      <div className={listRow}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="latihan-terakhir">
          <SectionHeader id="latihan-terakhir" title="Latihan simulator terakhir" />
          {exerciseAttempts.length === 0 ? (
            <div className="mt-4">
              <EmptyNote Icon={CameraIcon} action={{ href: "/simulator", label: "Buka simulator" }}>
                Belum ada latihan.
              </EmptyNote>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-tinta-100 overflow-hidden rounded-3xl border border-tinta-100 bg-white">
              {exerciseAttempts.slice(0, 5).map((attempt) => {
                const exercise = getExercise(attempt.exercise_id);
                return (
                  <li key={attempt.id}>
                    <Link href={`/simulator?latihan=${encodeURIComponent(attempt.exercise_id)}`} className={listRow}>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{exercise?.title ?? attempt.exercise_id}</p>
                        <p className="text-xs font-medium text-tinta-500">{formatDate(attempt.created_at)}</p>
                      </div>
                      <PassPill passed={attempt.passed} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* F. Analisis foto */}
      <section aria-labelledby="analisis-terakhir" className="order-5">
        <SectionHeader id="analisis-terakhir" title="Analisis foto terakhir" href="/analisis" linkLabel="Analisis foto lain" />
        {photoAnalyses.length === 0 ? (
          <div className="mt-4">
            <EmptyNote Icon={ImageIcon} action={{ href: "/analisis", label: "Analisis foto" }}>
              Belum ada analisis tersimpan.
            </EmptyNote>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-tinta-100 overflow-hidden rounded-3xl border border-tinta-100 bg-white">
            {photoAnalyses.map((analysis) => (
              <li key={analysis.id} className="flex min-h-14 flex-wrap items-center gap-4 px-5 py-3">
                {/* Foto tidak disimpan di server, jadi hanya ikon gambar (§10.2 F). */}
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-tinta-100 text-tinta-400">
                  <ImageIcon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{analysis.fired_rules?.length ?? 0} aturan terpicu</p>
                  <p className="text-xs font-medium text-tinta-500">{formatDate(analysis.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

"use client";
// components/lms/Dashboard.js — student overview: enrolled courses, progress and
// the latest quiz, simulator and photo-analysis activity.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getDashboardData } from "@/lib/lms";
import { getExercise } from "@/lib/exercises";
import {
  AuthPrompt,
  EmptyNote,
  ErrorNote,
  LevelBadge,
  Loading,
  ProgressBar,
  SupabaseNotice,
} from "./ui";

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });
const ROLE_LABEL = { student: "Siswa", instructor: "Instruktur", admin: "Admin" };

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

function Stat({ label, value }) {
  return (
    <div className="rounded border border-rule bg-panel p-4">
      <p className="font-display text-3xl font-semibold tabular text-amber">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { enabled, loading: authLoading, user, displayName, role } = useAuth();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled || authLoading || !user) return;
    let active = true;
    setStatus("loading");
    setError(null);
    getDashboardData(user.id)
      .then((payload) => {
        if (!active) return;
        setData(payload);
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
      <div className="py-8">
        <h1 className="font-display text-4xl font-semibold">Dasbor</h1>
        <p className="mt-2 max-w-prose text-muted">
          Ringkasan kursus yang diikuti, progres materi, nilai kuis, dan aktivitas belajar.
        </p>
        <div className="mt-8">
          <SupabaseNotice />
        </div>
      </div>
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
      <ErrorNote
        onRetry={() => {
          setStatus("loading");
          setReloadKey((value) => value + 1);
        }}
      >
        Gagal memuat dasbor: {error}
      </ErrorNote>
    );
  }
  if (!data) return null;

  const { enrollments, completedByCourse, totalsByCourse, quizAttempts, exerciseAttempts, photoAnalyses } = data;

  return (
    <div className="py-8">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold">Halo, {displayName || "Siswa"}.</h1>
          <p className="mt-1 text-sm text-muted">
            {ROLE_LABEL[role] ?? "Siswa"} · ringkasan belajar dan aktivitas terakhirmu.
          </p>
        </div>
        <Link href="/kursus" className="rounded-full bg-amber px-5 py-2 font-display font-semibold text-surround">
          Jelajahi kursus
        </Link>
      </header>

      <section aria-label="Ringkasan" className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Kursus diikuti" value={enrollments.length} />
        <Stat label="Materi selesai" value={data.completedLessons} />
        <Stat label="Kuis dikerjakan" value={data.totals.quizAttempts} />
        <Stat label="Latihan simulator lulus" value={data.totals.passedExercises} />
      </section>

      <section aria-labelledby="kursus-saya" className="mt-10">
        <h2 id="kursus-saya" className="font-display text-2xl font-semibold">
          Kursus saya
        </h2>
        {enrollments.length === 0 ? (
          <div className="mt-4">
            <EmptyNote>
              Kamu belum mendaftar kursus.{" "}
              <Link href="/kursus" className="text-amber underline">
                Lihat katalog kursus
              </Link>
              .
            </EmptyNote>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {enrollments.map((enrollment) => {
              const course = enrollment.courses;
              if (!course) return null;
              const done = completedByCourse[course.id] ?? 0;
              const total = totalsByCourse[course.id] ?? 0;
              const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
              return (
                <li key={course.id} className="rounded border border-rule bg-panel p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/kursus/${course.id}`} className="font-display text-xl font-semibold hover:text-amber">
                      {course.title}
                    </Link>
                    <LevelBadge level={course.level} />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between text-sm text-muted">
                    <span>
                      {done}/{total} materi
                    </span>
                    <span className="tabular">{pct}%</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar pct={pct} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="kuis-terakhir">
          <h2 id="kuis-terakhir" className="font-display text-2xl font-semibold">
            Kuis terakhir
          </h2>
          {quizAttempts.length === 0 ? (
            <div className="mt-4">
              <EmptyNote>Belum ada nilai kuis. Buka materi yang memiliki kuis untuk mulai.</EmptyNote>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-rule rounded border border-rule">
              {quizAttempts.map((attempt) => {
                const quiz = attempt.quizzes;
                const courseId = quiz?.lessons?.modules?.course_id;
                const passed = quiz ? attempt.score >= quiz.pass_score : false;
                return (
                  <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <div>
                      {quiz && courseId ? (
                        <Link href={`/kursus/${courseId}/kuis/${quiz.id}`} className="hover:text-amber">
                          {quiz.title}
                        </Link>
                      ) : (
                        <span>Kuis</span>
                      )}
                      <p className="text-xs text-muted">{formatDate(attempt.created_at)}</p>
                    </div>
                    <span className={`tabular text-sm ${passed ? "text-correct" : "text-over"}`}>
                      {attempt.score} · {passed ? "lulus" : "belum lulus"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="latihan-terakhir">
          <h2 id="latihan-terakhir" className="font-display text-2xl font-semibold">
            Latihan simulator terakhir
          </h2>
          {exerciseAttempts.length === 0 ? (
            <div className="mt-4">
              <EmptyNote>
                Belum ada latihan tersimpan.{" "}
                <Link href="/simulator" className="text-amber underline">
                  Buka simulator
                </Link>
                .
              </EmptyNote>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-rule rounded border border-rule">
              {exerciseAttempts.map((attempt) => {
                const exercise = getExercise(attempt.exercise_id);
                return (
                  <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <div>
                      <Link
                        href={`/simulator?latihan=${encodeURIComponent(attempt.exercise_id)}`}
                        className="hover:text-amber"
                      >
                        {exercise?.title ?? attempt.exercise_id}
                      </Link>
                      <p className="text-xs text-muted">{formatDate(attempt.created_at)}</p>
                    </div>
                    <span className={`text-sm ${attempt.passed ? "text-correct" : "text-over"}`}>
                      {attempt.passed ? "lulus" : "belum lulus"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="analisis-terakhir" className="mt-10">
        <h2 id="analisis-terakhir" className="font-display text-2xl font-semibold">
          Analisis foto terakhir
        </h2>
        {photoAnalyses.length === 0 ? (
          <div className="mt-4">
            <EmptyNote>
              Belum ada analisis tersimpan.{" "}
              <Link href="/analisis" className="text-amber underline">
                Analisis fotomu
              </Link>
              .
            </EmptyNote>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-rule rounded border border-rule">
            {photoAnalyses.map((analysis) => (
              <li key={analysis.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span>
                  {analysis.fired_rules?.length ?? 0} aturan terpicu
                  <span className="ml-2 text-xs text-muted">{formatDate(analysis.created_at)}</span>
                </span>
                <Link href="/analisis" className="text-sm text-amber underline">
                  Analisis lagi
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

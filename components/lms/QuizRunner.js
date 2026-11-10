"use client";
// components/lms/QuizRunner.js — multiple-choice quiz, graded in the browser and
// stored in quiz_attempts for logged-in students.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getQuiz, getQuizAttempts, saveQuizAttempt } from "@/lib/lms";
import { gradeQuiz, isQuizPassed, serializeAnswers } from "@/lib/quiz";
import { Breadcrumbs, EmptyNote, ErrorNote, Loading, SupabaseNotice } from "./ui";

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default function QuizRunner({ courseId, quizId }) {
  const { enabled, loading: authLoading, user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled || authLoading) return;
    let active = true;
    setStatus("loading");
    setError(null);
    Promise.all([getQuiz(quizId), user ? getQuizAttempts(user.id, quizId) : Promise.resolve([])])
      .then(([quizRow, attemptRows]) => {
        if (!active) return;
        setQuiz(quizRow);
        setAttempts(attemptRows);
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
  }, [enabled, authLoading, user, quizId, reloadKey]);

  const answeredCount = quiz ? Object.keys(answers).length : 0;
  const total = quiz?.questions.length ?? 0;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((row) => row.score)) : null;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!quiz) return;
    setSaveError(null);
    const graded = gradeQuiz(quiz.questions, answers);
    setResult(graded);
    if (!user) return;
    setSubmitting(true);
    try {
      await saveQuizAttempt(user.id, quiz.id, graded.score, serializeAnswers(answers));
      setAttempts(await getQuizAttempts(user.id, quiz.id));
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setSaveError(null);
  }

  if (!enabled) {
    return (
      <div className="py-8">
        <Breadcrumbs items={[{ label: "Kursus", href: "/kursus" }, { label: "Kuis" }]} />
        <h1 className="mt-6 font-display text-4xl font-semibold">Kuis</h1>
        <p className="mt-2 max-w-prose text-muted">
          Kerjakan soal pilihan ganda; nilai dan riwayat percobaan tersimpan di akunmu.
        </p>
        <div className="mt-8">
          <SupabaseNotice />
        </div>
      </div>
    );
  }
  if (authLoading || status === "loading") return <Loading label="Memuat kuis…" />;
  if (status === "error") {
    return (
      <ErrorNote
        onRetry={() => {
          setStatus("loading");
          setReloadKey((value) => value + 1);
        }}
      >
        Gagal memuat kuis: {error}
      </ErrorNote>
    );
  }
  if (!quiz) return null;

  const lesson = quiz.lessons ?? null;
  const course = lesson?.modules?.courses ?? null;
  const passed = result ? isQuizPassed(result.score, quiz.pass_score) : false;

  return (
    <div className="py-8">
      <Breadcrumbs
        items={[
          { label: "Kursus", href: "/kursus" },
          { label: course?.title ?? "Kursus", href: `/kursus/${courseId}` },
          lesson ? { label: lesson.title, href: `/kursus/${courseId}/lesson/${lesson.id}` } : { label: "Materi" },
          { label: quiz.title },
        ]}
      />

      <header className="mt-6 max-w-3xl">
        <h1 className="font-display text-4xl font-semibold">{quiz.title}</h1>
        <p className="mt-2 text-muted">
          {total} soal · nilai lulus minimal {quiz.pass_score}
          {bestScore !== null && ` · nilai terbaikmu ${bestScore}`}
        </p>
      </header>

      {total === 0 && (
        <div className="mt-6 max-w-3xl">
          <EmptyNote>Kuis ini belum memiliki soal.</EmptyNote>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-6">
        <ol className="space-y-6">
          {quiz.questions.map((question, questionIndex) => (
            <li key={question.id} className="rounded border border-rule bg-panel p-5">
              <fieldset>
                <legend className="font-display text-lg font-semibold">
                  {questionIndex + 1}. {question.prompt}
                </legend>
                <div className="mt-3 space-y-2">
                  {question.options.map((option) => (
                    <label key={option.id} className="flex cursor-pointer items-start gap-3 text-sm">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={Number(answers[question.id]) === Number(option.id)}
                        onChange={() =>
                          setAnswers((previous) => ({ ...previous, [question.id]: option.id }))
                        }
                        disabled={Boolean(result)}
                        className="mt-0.5 h-4 w-4 accent-amber"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>

        {result ? (
          <section aria-live="polite" className="rounded border border-rule bg-panel p-5">
            <p className={`font-display text-2xl font-semibold ${passed ? "text-correct" : "text-over"}`}>
              {passed ? "Lulus" : "Belum lulus"} · nilai {result.score}
            </p>
            <p className="mt-1 text-sm text-muted">
              Benar {result.correct} dari {result.total} soal.
              {!user && " Masuk agar nilai dan riwayat kuis tersimpan di akunmu."}
            </p>

            <ul className="mt-4 space-y-1 text-sm">
              {result.perQuestion.map((row, index) => {
                const question = quiz.questions.find((item) => item.id === row.questionId);
                return (
                  <li key={row.questionId} className="flex gap-2">
                    <span className={row.isCorrect ? "text-correct" : "text-over"} aria-hidden="true">
                      {row.isCorrect ? "✓" : "✗"}
                    </span>
                    <span>
                      Soal {index + 1}: {row.isCorrect ? "benar" : "salah"}
                      {question ? ` — ${question.prompt}` : ""}
                    </span>
                  </li>
                );
              })}
            </ul>

            {saveError && (
              <p className="mt-3 text-sm text-over" role="alert">
                Nilai gagal disimpan: {saveError}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={retry}
                className="rounded-full bg-amber px-5 py-2 font-display font-semibold text-surround"
              >
                Coba lagi
              </button>
              {lesson && (
                <Link
                  href={`/kursus/${courseId}/lesson/${lesson.id}`}
                  className="rounded-full border border-rule px-5 py-2 font-display font-semibold"
                >
                  Kembali ke materi
                </Link>
              )}
            </div>
          </section>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting || total === 0 || answeredCount < total}
              className="rounded-full bg-amber px-6 py-2 font-display text-lg font-semibold text-surround disabled:opacity-60"
            >
              {submitting ? "Menyimpan…" : "Kirim jawaban"}
            </button>
            <p className="text-sm text-muted" aria-live="polite">
              {answeredCount}/{total} soal dijawab
            </p>
          </div>
        )}
      </form>

      {attempts.length > 0 && (
        <section aria-labelledby="riwayat-kuis" className="mt-10 max-w-3xl">
          <h2 id="riwayat-kuis" className="font-display text-xl font-semibold">
            Riwayat percobaan
          </h2>
          <ul className="mt-3 divide-y divide-rule rounded border border-rule">
            {attempts.map((attempt) => (
              <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                <span className="tabular">Nilai {attempt.score}</span>
                <span className="text-muted">{dateFormat.format(new Date(attempt.created_at))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

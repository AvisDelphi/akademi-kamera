"use client";
// components/lms/QuizRunner.js — multiple-choice quiz, graded in the browser and
// stored in quiz_attempts for logged-in students.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { flattenLessons, getCourseOutline, getQuiz, getQuizAttempts, submitQuizAttempt } from "@/lib/lms";
import { serializeAnswers } from "@/lib/quiz";
import { ArrowRightIcon, CheckIcon, XIcon } from "@/components/icons";
import {
  Banner,
  Breadcrumbs,
  EmptyNote,
  ErrorNote,
  Loading,
  PageHeader,
  Pill,
  ProgressRing,
  SupabaseNotice,
  Toast,
  btn,
} from "./ui";
import { useToast } from "./useToast";

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
  const [submitError, setSubmitError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [outline, setOutline] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (!enabled || authLoading) return;
    let active = true;
    setStatus("loading");
    setError(null);
    Promise.all([
      getQuiz(quizId),
      user ? getQuizAttempts(user.id, quizId) : Promise.resolve([]),
      getCourseOutline(courseId).catch(() => []),
    ])
      .then(([quizRow, attemptRows, outlineRows]) => {
        if (!active) return;
        setQuiz(quizRow);
        setOutline(outlineRows);
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
  }, [enabled, authLoading, user, quizId, courseId, reloadKey]);

  const answeredCount = quiz ? Object.keys(answers).length : 0;
  const total = quiz?.questions.length ?? 0;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((row) => row.score)) : null;

  // The answers are graded in the database; the browser never sees the answer key beforehand.
  async function handleSubmit(event) {
    event.preventDefault();
    if (!quiz) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const graded = await submitQuizAttempt(quiz.id, serializeAnswers(answers));
      setResult(graded);
      if (graded.passed) toast.show("Kuis lulus 🎉");
      if (user && graded.attempt_id) {
        try {
          setAttempts(await getQuizAttempts(user.id, quiz.id));
        } catch {
          // Riwayat gagal dimuat ulang; nilai sudah tersimpan dan tampil di hasil.
        }
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setSubmitError(null);
  }

  if (!enabled) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Kursus", href: "/kursus" }, { label: "Kuis" }]} />
        <PageHeader title="Kuis" description="Kerjakan soal pilihan ganda; nilai dan riwayat percobaan tersimpan di akunmu." />
        <SupabaseNotice />
      </>
    );
  }
  if (authLoading || status === "loading") return <Loading label="Memuat kuis…" />;
  if (status === "error") {
    return (
      <div className="py-8">
        <ErrorNote
          onRetry={() => {
            setStatus("loading");
            setReloadKey((value) => value + 1);
          }}
        >
          Kuis gagal dimuat: {error}. Periksa koneksi lalu coba lagi.
        </ErrorNote>
      </div>
    );
  }
  if (!quiz) return null;

  const lesson = quiz.lessons ?? null;
  const course = lesson?.modules?.courses ?? null;
  const passed = Boolean(result?.passed);
  const optionLabel = (question, optionId) => question?.options.find((option) => Number(option.id) === Number(optionId))?.label;
  const allLessons = flattenLessons(outline);
  const lessonIndex = lesson ? allLessons.findIndex((row) => Number(row.id) === Number(lesson.id)) : -1;
  const nextLesson = lessonIndex >= 0 ? allLessons[lessonIndex + 1] ?? null : null;

  return (
    <div className="pb-4">
      <Toast message={toast.message} onClose={toast.close} />
      <Breadcrumbs
        items={[
          { label: "Kursus", href: "/kursus" },
          { label: course?.title ?? "Kursus", href: `/kursus/${courseId}` },
          lesson ? { label: lesson.title, href: `/kursus/${courseId}/lesson/${lesson.id}` } : { label: "Materi" },
          { label: quiz.title },
        ]}
      />

      <div className="mx-auto max-w-[760px]">
        <PageHeader
          overline="Kuis"
          title={quiz.title}
          description={`${total} soal · lulus minimal ${quiz.pass_score}${bestScore !== null ? ` · nilai terbaikmu ${bestScore}` : ""}`}
        />

        {!user && !result && (
          <div className="mb-6">
            <Banner
              tone="info"
              action={
                <Link href={`/masuk?next=${encodeURIComponent(`/kursus/${courseId}/kuis/${quizId}`)}`} className={btn("secondary", "s")}>
                  Masuk
                </Link>
              }
            >
              Kamu belum masuk. Kuis tetap bisa dikerjakan, tetapi nilainya tidak tersimpan.
            </Banner>
          </div>
        )}

        {total === 0 && <EmptyNote>Kuis ini belum memiliki soal.</EmptyNote>}

        {result && (
          <section aria-live="polite" aria-label="Hasil kuis" className="mb-8 space-y-4">
            {passed ? (
              <Banner tone="success">
                <p className="font-semibold">Kuis lulus 🎉</p>
                <p className="mt-1">Pemahamanmu sudah cukup kuat untuk lanjut ke materi berikutnya.</p>
              </Banner>
            ) : (
              <Banner tone="info">
                <p className="font-semibold">Belum lulus, dan itu wajar.</p>
                <p className="mt-1">
                  Baca ulang materinya, lalu coba lagi.{" "}
                  {lesson && (
                    <Link href={`/kursus/${courseId}/lesson/${lesson.id}`} className="font-semibold underline">
                      Buka materi terkait
                    </Link>
                  )}
                </p>
              </Banner>
            )}

            <div className="rounded-3xl border border-tinta-100 bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-6">
                <ProgressRing pct={result.score} size={128} label={`Nilai kuis ${result.score} dari 100`}>
                  <span>
                    <span className="block text-[28px] font-bold leading-8 tabular">{result.score}</span>
                    <span className="block text-xs font-medium text-tinta-500">dari 100</span>
                  </span>
                </ProgressRing>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">Hasil</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    {passed ? (
                      <Pill tone="success" Icon={CheckIcon}>
                        Lulus
                      </Pill>
                    ) : (
                      <Pill tone="warning" Icon={XIcon}>
                        Belum lulus
                      </Pill>
                    )}
                    <span className="text-sm font-medium text-tinta-500">Lulus minimal {quiz.pass_score}</span>
                  </div>
                  <p className="mt-2 text-sm text-tinta-500">
                    Benar <span className="font-semibold text-tinta-900 tabular">{result.correct}</span> dari{" "}
                    <span className="tabular">{result.total}</span> soal.
                    {!user && " Masuk agar nilai dan riwayat kuis tersimpan di akunmu."}
                  </p>
                </div>
              </div>

              <ul className="mt-6 divide-y divide-tinta-100 border-t border-tinta-100">
                {result.results.map((row, index) => {
                  const question = quiz.questions.find((item) => Number(item.id) === Number(row.question_id));
                  const correctLabels = (row.correct_option_ids ?? []).map((id) => optionLabel(question, id)).filter(Boolean);
                  return (
                    <li key={row.question_id} className="flex items-start gap-3 py-3 text-sm">
                      <span
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                          row.is_correct ? "bg-sprout-100 text-sprout-800" : "bg-warn-bg text-warn-fg"
                        }`}
                      >
                        {row.is_correct ? <CheckIcon size={12} /> : <XIcon size={12} />}
                      </span>
                      <span>
                        <span className="font-semibold">
                          Soal {index + 1}: {row.is_correct ? "benar" : "salah"}
                        </span>
                        {question ? <span className="text-tinta-500"> — {question.prompt}</span> : null}
                        {!row.is_correct && correctLabels.length > 0 && (
                          <span className="mt-1 block text-tinta-700">
                            Jawaban benar: <span className="font-semibold">{correctLabels.join(" / ")}</span>
                            {row.chosen_option_id ? (
                              <span className="text-tinta-500"> · jawabanmu: {optionLabel(question, row.chosen_option_id)}</span>
                            ) : (
                              <span className="text-tinta-500"> · belum dijawab</span>
                            )}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {user && !result.attempt_id && (
                <p className="mt-4 text-xs font-medium text-tinta-500">
                  Sebagai pemilik kursus, percobaan pratinjau ini tidak disimpan ke riwayat siswa.
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={retry} className={btn("secondary", "m")}>
                  Ulangi kuis
                </button>
                {nextLesson ? (
                  <Link href={`/kursus/${courseId}/lesson/${nextLesson.id}`} className={btn("primary", "m")}>
                    Lanjut ke materi berikutnya <ArrowRightIcon size={16} />
                  </Link>
                ) : (
                  <Link href={`/kursus/${courseId}`} className={btn("primary", "m")}>
                    Kembali ke kursus
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <ol className="space-y-6">
            {quiz.questions.map((question, questionIndex) => (
              <li key={question.id} className="rounded-3xl border border-tinta-100 bg-white p-6">
                <fieldset disabled={Boolean(result)}>
                  <legend className="w-full">
                    <span className="block text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500 tabular">
                      Pertanyaan {questionIndex + 1} dari {total}
                    </span>
                    <span className="mt-1 block text-base font-semibold leading-[26px]">{question.prompt}</span>
                  </legend>
                  <div className="mt-4 space-y-3">
                    {question.options.map((option) => {
                      const selected = Number(answers[question.id]) === Number(option.id);
                      return (
                        <label
                          key={option.id}
                          className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors duration-[120ms] has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sprout-300 ${
                            selected
                              ? "border-sprout-300 bg-sprout-50"
                              : "border-tinta-100 hover:border-sprout-200 hover:bg-sprout-50"
                          } ${result ? "cursor-default opacity-80" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={selected}
                            onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: option.id }))}
                            className="size-5 shrink-0 accent-sprout-600"
                          />
                          <span className="leading-[22px]">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>

          {submitError && (
            <Banner tone="danger" role="alert">
              Jawabanmu belum bisa dinilai: {submitError}
            </Banner>
          )}

          {!result && (
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={submitting || total === 0 || answeredCount < total}
                className={btn("primary", "l")}
              >
                {submitting ? "Mengirim jawaban…" : "Kirim jawaban"}
              </button>
              <p className="text-sm font-medium text-tinta-500 tabular" aria-live="polite">
                {answeredCount} dari {total} soal terjawab
              </p>
            </div>
          )}
        </form>

        {attempts.length > 0 && (
          <section aria-labelledby="riwayat-kuis" className="mt-10">
            <h2 id="riwayat-kuis" className="text-2xl font-bold leading-8">
              Riwayat percobaan
            </h2>
            <ul className="mt-4 divide-y divide-tinta-100 overflow-hidden rounded-3xl border border-tinta-100 bg-white">
              {attempts.map((attempt) => {
                const ok = attempt.score >= quiz.pass_score;
                return (
                  <li key={attempt.id} className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span className="font-medium text-tinta-500">{dateFormat.format(new Date(attempt.created_at))}</span>
                    <span className="flex items-center gap-3">
                      {attempt.score === bestScore && <Pill tone="neutral">Terbaik</Pill>}
                      <span className="font-semibold tabular">{attempt.score}</span>
                      {ok ? (
                        <Pill tone="success" Icon={CheckIcon}>
                          Lulus
                        </Pill>
                      ) : (
                        <Pill tone="warning" Icon={XIcon}>
                          Belum lulus
                        </Pill>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

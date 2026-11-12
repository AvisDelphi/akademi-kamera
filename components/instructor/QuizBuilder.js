"use client";
// components/instructor/QuizBuilder.js — pembuat kuis per materi: judul, ambang lulus, soal, dan opsi
// dengan satu jawaban benar. Kunci jawaban hanya terbaca instruktur pemilik/admin lewat RLS.
import { useEffect, useState } from "react";
import {
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  getLessonQuizzes,
  saveQuestion,
  updateQuiz,
} from "@/lib/instructor";
import { PlusIcon, TrashIcon, CheckIcon } from "@/components/icons";
import { Banner, ErrorNote, Loading, Pill, btn, inputClass, labelClass } from "@/components/lms/ui";
import ConfirmModal from "./ConfirmModal";
import { useLoad } from "./useLoad";

const EMPTY_OPTIONS = [
  { label: "", isCorrect: true },
  { label: "", isCorrect: false },
  { label: "", isCorrect: false },
  { label: "", isCorrect: false },
];

function QuestionForm({ initial, onSave, onCancel, onDelete, busy }) {
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [options, setOptions] = useState(
    initial ? initial.options.map((option) => ({ label: option.label, isCorrect: option.is_correct })) : EMPTY_OPTIONS,
  );
  const [error, setError] = useState(null);
  const groupName = `benar-${initial?.id ?? "baru"}`;

  const setOption = (index, patch) => setOptions((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  function submit(event) {
    event.preventDefault();
    const filled = options.filter((option) => option.label.trim());
    if (!prompt.trim()) return setError("Isi teks soal terlebih dahulu.");
    if (filled.length < 2) return setError("Isi minimal dua opsi jawaban.");
    if (!filled.some((option) => option.isCorrect)) return setError("Tandai satu opsi sebagai jawaban benar.");
    setError(null);
    onSave({ prompt: prompt.trim(), options: filled.map((option) => ({ label: option.label.trim(), isCorrect: option.isCorrect })) });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor={`${groupName}-soal`} className={labelClass}>Teks soal</label>
        <textarea id={`${groupName}-soal`} rows={2} value={prompt} onChange={(event) => setPrompt(event.target.value)} className={`${inputClass} mt-1.5 h-auto py-3`} />
      </div>
      <fieldset>
        <legend className={labelClass}>Opsi jawaban (pilih satu yang benar)</legend>
        <div className="mt-2 space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input type="radio" name={groupName} checked={option.isCorrect} onChange={() => setOptions((rows) => rows.map((row, i) => ({ ...row, isCorrect: i === index })))} aria-label={`Opsi ${index + 1} adalah jawaban benar`} className="size-5 shrink-0 accent-sprout-600" />
              <input value={option.label} onChange={(event) => setOption(index, { label: event.target.value })} placeholder={`Opsi ${index + 1}`} aria-label={`Teks opsi ${index + 1}`} className={`${inputClass} h-10`} />
              <button type="button" disabled={options.length <= 2} onClick={() => setOptions((rows) => rows.filter((_, i) => i !== index))} aria-label={`Hapus opsi ${index + 1}`} className="grid size-9 shrink-0 place-items-center rounded-lg text-tinta-500 hover:bg-tinta-100 disabled:opacity-40"><TrashIcon size={16} /></button>
            </div>
          ))}
        </div>
        {options.length < 6 && (
          <button type="button" onClick={() => setOptions((rows) => [...rows, { label: "", isCorrect: false }])} className="mt-2 text-sm font-semibold text-sprout-700 hover:underline">+ Tambah opsi</button>
        )}
      </fieldset>
      {error && <Banner tone="danger" role="alert">{error}</Banner>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className={btn("primary", "s")}>{busy ? "Menyimpan…" : "Simpan soal"}</button>
        <button type="button" onClick={onCancel} disabled={busy} className={btn("ghost", "s")}>Batal</button>
        {onDelete && <button type="button" onClick={onDelete} disabled={busy} className="ml-auto text-sm font-semibold text-danger-fg hover:underline">Hapus soal</button>}
      </div>
    </form>
  );
}

function QuizCard({ quiz, onChanged, onToast }) {
  const [title, setTitle] = useState(quiz.title);
  const [pass, setPass] = useState(String(quiz.pass_score));
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: 'quiz' | 'question', target }

  useEffect(() => {
    setTitle(quiz.title);
    setPass(String(quiz.pass_score));
  }, [quiz.title, quiz.pass_score]);

  const passNumber = Number(pass);
  const passValid = Number.isInteger(passNumber) && passNumber >= 0 && passNumber <= 100;
  const dirty = title.trim() !== quiz.title || passNumber !== quiz.pass_score;

  async function run(action, message) {
    setBusy(true);
    setError(null);
    try {
      await action();
      if (message) onToast(message);
      onChanged();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-3xl border border-tinta-100 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
        <div>
          <label htmlFor={`kuis-${quiz.id}`} className={labelClass}>Judul kuis</label>
          <input id={`kuis-${quiz.id}`} value={title} onChange={(event) => setTitle(event.target.value)} className={`${inputClass} mt-1.5`} />
        </div>
        <div>
          <label htmlFor={`lulus-${quiz.id}`} className={labelClass}>Nilai lulus (0–100)</label>
          <input id={`lulus-${quiz.id}`} type="number" min="0" max="100" inputMode="numeric" value={pass} onChange={(event) => setPass(event.target.value)} aria-invalid={!passValid} className={`${inputClass} mt-1.5 ${passValid ? "" : "!border-danger-fg"}`} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy || !dirty || !title.trim() || !passValid} onClick={() => run(() => updateQuiz(quiz.id, { title: title.trim(), pass_score: passNumber }), "Kuis disimpan")} className={btn("dark", "s")}>Simpan kuis</button>
        <button type="button" onClick={() => setConfirm({ kind: "quiz" })} className="text-sm font-semibold text-danger-fg hover:underline">Hapus kuis</button>
      </div>
      {error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}

      <h3 className="mt-6 text-base font-semibold leading-6">Soal ({quiz.questions.length})</h3>
      {quiz.questions.length === 0 && !adding && <p className="mt-2 text-sm text-tinta-500">Kuis ini belum punya soal.</p>}
      <ul className="mt-3 space-y-3">
        {quiz.questions.map((question, index) => (
          <li key={question.id}>
            <details className="group rounded-2xl border border-tinta-100">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-2 text-sm font-semibold hover:bg-sprout-50 [&::-webkit-details-marker]:hidden">
                <span className="tabular text-tinta-500">{index + 1}.</span>
                <span className="min-w-0 flex-1 truncate">{question.prompt}</span>
                <Pill tone="neutral">{question.options.length} opsi</Pill>
              </summary>
              <div className="border-t border-tinta-100 p-4">
                <ul className="mb-4 space-y-1 text-sm">
                  {question.options.map((option) => (
                    <li key={option.id} className="flex items-center gap-2">
                      {option.is_correct ? <CheckIcon size={16} className="text-sprout-600" /> : <span className="size-4" />}
                      <span className={option.is_correct ? "font-semibold" : "text-tinta-600"}>{option.label}</span>
                      {option.is_correct && <span className="sr-only">(jawaban benar)</span>}
                    </li>
                  ))}
                </ul>
                <QuestionForm
                  key={question.id + question.options.map((o) => o.id).join("-")}
                  initial={question}
                  busy={busy}
                  onCancel={() => {}}
                  onSave={(payload) => run(() => saveQuestion({ questionId: question.id, ...payload }), "Soal disimpan")}
                  onDelete={() => setConfirm({ kind: "question", target: question })}
                />
              </div>
            </details>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="mt-4 rounded-2xl border border-sprout-200 bg-sprout-50 p-4">
          <QuestionForm
            busy={busy}
            onCancel={() => setAdding(false)}
            onSave={async (payload) => {
              const next = quiz.questions.reduce((max, q) => Math.max(max, Number(q.position ?? 0)), 0) + 1;
              if (await run(() => saveQuestion({ quizId: quiz.id, position: next, ...payload }), "Soal ditambahkan")) setAdding(false);
            }}
          />
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={`${btn("secondary", "s")} mt-4`}><PlusIcon size={16} /> Tambah soal</button>
      )}

      <ConfirmModal
        open={Boolean(confirm)}
        busy={busy}
        danger
        title={confirm?.kind === "quiz" ? `Hapus kuis "${quiz.title}" beserta ${quiz.questions.length} soalnya?` : "Hapus soal ini beserta opsinya?"}
        description={confirm?.kind === "quiz" ? "Riwayat nilai siswa pada kuis ini ikut terhapus. Tindakan ini tidak bisa dibatalkan." : "Tindakan ini tidak bisa dibatalkan."}
        confirmLabel={confirm?.kind === "quiz" ? "Hapus kuis" : "Hapus soal"}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const ok = await run(() => (confirm.kind === "quiz" ? deleteQuiz(quiz.id) : deleteQuestion(confirm.target.id)), confirm.kind === "quiz" ? "Kuis dihapus" : "Soal dihapus");
          if (ok) setConfirm(null);
        }}
      />
    </li>
  );
}

export default function QuizBuilder({ lessonId, onToast }) {
  const { data, status, error, reload } = useLoad(() => getLessonQuizzes(lessonId), [lessonId]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [createError, setCreateError] = useState(null);

  if (status === "loading") return <Loading label="Memuat kuis…" />;
  if (status === "error") return <ErrorNote onRetry={reload}>Kuis gagal dimuat: {error}</ErrorNote>;

  async function handleCreate(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setCreateError(null);
    try {
      await createQuiz(lessonId, title.trim(), 70);
      setTitle("");
      onToast("Kuis dibuat. Tambahkan soalnya.");
      reload();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {data.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-tinta-200 bg-white p-6 text-sm text-tinta-500">Materi ini belum punya kuis. Kuis bersifat opsional.</p>
      ) : (
        <ul className="space-y-4">
          {data.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onChanged={reload} onToast={onToast} />
          ))}
        </ul>
      )}
      <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-center gap-2">
        <label htmlFor="kuis-baru" className="sr-only">Judul kuis baru</label>
        <input id="kuis-baru" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Judul kuis baru, misalnya Kuis aperture" className={`${inputClass} !w-auto min-w-0 flex-1 sm:max-w-md`} />
        <button type="submit" disabled={busy || !title.trim()} className={btn("secondary", "m")}><PlusIcon size={16} /> Tambah kuis</button>
      </form>
      {createError && <div className="mt-3"><ErrorNote>{createError}</ErrorNote></div>}
    </div>
  );
}

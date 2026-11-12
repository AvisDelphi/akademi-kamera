"use client";
// components/instructor/LessonEditor.js — editor materi: judul, latihan simulator terkait, isi Markdown
// dengan pratinjau, dan pembuat kuis (UIUX_GUIDELINE §15).
import { useEffect, useState } from "react";
import Link from "next/link";
import { getLessonForEdit, updateLesson } from "@/lib/instructor";
import { EXERCISES } from "@/lib/exercises";
import { Banner, Breadcrumbs, ErrorNote, Loading, Toast, btn, inputClass, labelClass } from "@/components/lms/ui";
import { useToast } from "@/components/lms/useToast";
import MarkdownEditor from "./MarkdownEditor";
import QuizBuilder from "./QuizBuilder";
import { useLoad } from "./useLoad";

export default function LessonEditor({ courseId, lessonId }) {
  const toast = useToast();
  const { data: lesson, status, error, reload } = useLoad(() => getLessonForEdit(lessonId), [lessonId]);
  const [form, setForm] = useState({ title: "", content: "", exercise: "" });
  const [titleError, setTitleError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (lesson) setForm({ title: lesson.title, content: lesson.content_md ?? "", exercise: lesson.simulator_exercise_id ?? "" });
  }, [lesson]);

  const dirty =
    Boolean(lesson) &&
    (form.title !== lesson.title || form.content !== (lesson.content_md ?? "") || form.exercise !== (lesson.simulator_exercise_id ?? ""));

  // Peringatan bila tab ditutup saat ada perubahan yang belum disimpan.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  if (status === "loading") return <Loading label="Memuat materi…" />;
  if (status === "error") return <div className="py-8"><ErrorNote onRetry={reload}>Materi gagal dimuat: {error}</ErrorNote></div>;
  if (!lesson) return null;

  const course = lesson.modules?.courses;

  async function save(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setTitleError("Judul materi tidak boleh kosong.");
      return;
    }
    setTitleError(null);
    setSaveError(null);
    setBusy(true);
    try {
      await updateLesson(lesson.id, {
        title: form.title.trim(),
        content_md: form.content,
        simulator_exercise_id: form.exercise || null,
      });
      toast.show("Perubahan disimpan");
      reload();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Toast message={toast.message} onClose={toast.close} />
      <Breadcrumbs
        items={[
          { label: "Kursus saya", href: "/instruktur/kursus" },
          { label: course?.title ?? "Kursus", href: `/instruktur/kursus/${courseId}` },
          { label: form.title || lesson.title },
        ]}
      />
      <header className="flex flex-wrap items-end justify-between gap-4 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-sprout-700">Modul: {lesson.modules?.title}</p>
          <h1 className="mt-1 text-[32px] font-bold leading-10">Editor materi</h1>
        </div>
        <Link href={`/kursus/${courseId}/lesson/${lesson.id}`} target="_blank" className={btn("secondary", "m")}>Pratinjau sebagai siswa</Link>
      </header>

      <form onSubmit={save} noValidate className="rounded-3xl border border-tinta-100 bg-white p-6 sm:p-8">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <label htmlFor="judul-materi" className={labelClass}>Judul materi</label>
            <input id="judul-materi" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} onBlur={() => setTitleError(form.title.trim() ? null : "Judul materi tidak boleh kosong.")} aria-invalid={titleError ? true : undefined} className={`${inputClass} mt-1.5 ${titleError ? "!border-danger-fg" : ""}`} />
            {titleError && <p className="mt-1.5 text-xs font-medium text-danger-fg">{titleError}</p>}
          </div>
          <div>
            <label htmlFor="latihan" className={labelClass}>Latihan simulator terkait</label>
            <select id="latihan" value={form.exercise} onChange={(event) => setForm({ ...form, exercise: event.target.value })} className={`${inputClass} mt-1.5`}>
              <option value="">Tidak ada</option>
              {EXERCISES.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>{exercise.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <MarkdownEditor id="isi-materi" value={form.content} onChange={(content) => setForm({ ...form, content })} />
        </div>

        {saveError && <div className="mt-5"><Banner tone="danger" role="alert">Perubahan gagal disimpan: {saveError}</Banner></div>}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy || !dirty} className={btn("primary", "m")}>{busy ? "Menyimpan…" : "Simpan perubahan"}</button>
          <Link href={`/instruktur/kursus/${courseId}`} className={btn("ghost", "m")}>Kembali ke kursus</Link>
          {dirty && <span className="text-xs font-medium text-tinta-500">Ada perubahan yang belum disimpan.</span>}
        </div>
      </form>

      <section aria-labelledby="kuis-materi" className="mt-10">
        <h2 id="kuis-materi" className="text-2xl font-bold leading-8">Kuis materi ini</h2>
        <p className="mt-1 mb-4 text-sm text-tinta-500">Soal pilihan ganda dengan satu jawaban benar. Siswa lulus bila nilainya mencapai ambang yang kamu tentukan.</p>
        <QuizBuilder lessonId={lesson.id} onToast={toast.show} />
      </section>
    </div>
  );
}

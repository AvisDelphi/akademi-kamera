"use client";
// components/instructor/CourseEditor.js — editor kursus minimal (ROADMAP Sprint 6, UIUX_GUIDELINE §15):
// info kursus, status Draf/Terbit, serta struktur modul dan materi. Urutan diatur dengan tombol naik/turun.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  addLesson,
  addModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  getCourseForEdit,
  swapPositions,
  updateCourse,
  updateModule,
} from "@/lib/instructor";
import { getExercise } from "@/lib/exercises";
import { ArrowDownIcon, ArrowUpIcon, CameraIcon, PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import {
  Banner,
  Breadcrumbs,
  ErrorNote,
  Loading,
  Pill,
  Toast,
  btn,
  inputClass,
  labelClass,
} from "@/components/lms/ui";
import { useToast } from "@/components/lms/useToast";
import ConfirmModal from "./ConfirmModal";
import { useLoad } from "./useLoad";

const iconButton =
  "grid size-9 place-items-center rounded-lg text-tinta-500 transition-colors duration-[120ms] hover:bg-tinta-100 hover:text-tinta-900 disabled:cursor-not-allowed disabled:opacity-40";

const nextPosition = (rows) => rows.reduce((max, row) => Math.max(max, Number(row.position ?? 0)), 0) + 1;

function ModuleCard({ module, index, total, siblings, busy, onRename, onMove, onDelete, onAddLesson, onDeleteLesson, onMoveLesson, courseId }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [lessonTitle, setLessonTitle] = useState("");

  useEffect(() => setTitle(module.title), [module.title]);

  return (
    <li className="overflow-hidden rounded-3xl border border-tinta-100 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-tinta-100 px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sprout-100 text-sm font-semibold text-sprout-800 tabular">
          {index + 1}
        </span>
        {editing ? (
          <form
            className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!title.trim()) return;
              onRename(module, title.trim()).then(() => setEditing(false));
            }}
          >
            <label htmlFor={`modul-${module.id}`} className="sr-only">Nama modul</label>
            <input id={`modul-${module.id}`} value={title} onChange={(event) => setTitle(event.target.value)} className={`${inputClass} h-10 !w-auto min-w-0 flex-1`} autoFocus />
            <button type="submit" disabled={busy || !title.trim() || title.trim() === module.title} className={btn("dark", "s")}>Simpan</button>
            <button type="button" onClick={() => { setEditing(false); setTitle(module.title); }} className={btn("ghost", "s")}>Batal</button>
          </form>
        ) : (
          <h3 className="min-w-0 flex-1 break-words text-base font-semibold leading-6">{module.title}</h3>
        )}
        {!editing && (
          <div className="flex items-center">
            <button type="button" aria-label={`Ubah nama modul ${module.title}`} onClick={() => setEditing(true)} className={iconButton}><PencilIcon size={16} /></button>
            <button type="button" aria-label="Naikkan modul" disabled={busy || index === 0} onClick={() => onMove(siblings[index - 1], module)} className={iconButton}><ArrowUpIcon size={16} /></button>
            <button type="button" aria-label="Turunkan modul" disabled={busy || index === total - 1} onClick={() => onMove(module, siblings[index + 1])} className={iconButton}><ArrowDownIcon size={16} /></button>
            <button type="button" aria-label={`Hapus modul ${module.title}`} onClick={() => onDelete(module)} className={`${iconButton} hover:!bg-danger-bg hover:!text-danger-fg`}><TrashIcon size={16} /></button>
          </div>
        )}
      </div>

      {module.lessons.length === 0 ? (
        <p className="px-5 py-4 text-sm text-tinta-500">Modul ini belum punya materi.</p>
      ) : (
        <ul className="divide-y divide-tinta-100">
          {module.lessons.map((lesson, lessonIndex) => {
            const exercise = lesson.simulator_exercise_id ? getExercise(lesson.simulator_exercise_id) : null;
            const quizCount = lesson.quizzes?.length ?? 0;
            return (
              <li key={lesson.id} className="flex min-h-14 flex-wrap items-center gap-3 px-5 py-2 hover:bg-sprout-50">
                <Link href={`/instruktur/kursus/${courseId}/materi/${lesson.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold hover:underline">
                  {lesson.title}
                </Link>
                {exercise && <Pill tone="neutral" Icon={CameraIcon}>Latihan</Pill>}
                {quizCount > 0 && <Pill tone="success">{quizCount} kuis</Pill>}
                <div className="flex items-center">
                  <Link href={`/instruktur/kursus/${courseId}/materi/${lesson.id}`} aria-label={`Edit materi ${lesson.title}`} className={iconButton}><PencilIcon size={16} /></Link>
                  <button type="button" aria-label="Naikkan materi" disabled={busy || lessonIndex === 0} onClick={() => onMoveLesson(module.lessons[lessonIndex - 1], lesson)} className={iconButton}><ArrowUpIcon size={16} /></button>
                  <button type="button" aria-label="Turunkan materi" disabled={busy || lessonIndex === module.lessons.length - 1} onClick={() => onMoveLesson(lesson, module.lessons[lessonIndex + 1])} className={iconButton}><ArrowDownIcon size={16} /></button>
                  <button type="button" aria-label={`Hapus materi ${lesson.title}`} onClick={() => onDeleteLesson(lesson)} className={`${iconButton} hover:!bg-danger-bg hover:!text-danger-fg`}><TrashIcon size={16} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form
        className="flex flex-wrap items-center gap-2 border-t border-tinta-100 bg-tinta-50 px-5 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!lessonTitle.trim()) return;
          onAddLesson(module, lessonTitle.trim());
        }}
      >
        <label htmlFor={`materi-baru-${module.id}`} className="sr-only">Judul materi baru</label>
        <input id={`materi-baru-${module.id}`} value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} placeholder="Judul materi baru" className={`${inputClass} h-10 !w-auto min-w-0 flex-1`} />
        <button type="submit" disabled={busy || !lessonTitle.trim()} className={btn("secondary", "s")}><PlusIcon size={16} /> Tambah materi</button>
      </form>
    </li>
  );
}

export default function CourseEditor({ courseId }) {
  const router = useRouter();
  const { user, role } = useAuth();
  const toast = useToast();
  const { data: course, status, error, reload } = useLoad(() => getCourseForEdit(courseId), [courseId]);

  const [form, setForm] = useState({ title: "", description: "", level: "pemula" });
  const [titleError, setTitleError] = useState(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind, target }

  useEffect(() => {
    if (course) setForm({ title: course.title, description: course.description, level: course.level });
  }, [course]);

  if (status === "loading") return <Loading label="Memuat kursus…" />;
  if (status === "error") {
    return (
      <div className="py-8">
        <ErrorNote onRetry={reload}>Kursus gagal dimuat: {error}</ErrorNote>
      </div>
    );
  }
  if (!course) return null;

  const isOwner = course.instructor_id === user.id || role === "admin";
  const lessonCount = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const dirty = form.title !== course.title || form.description !== course.description || form.level !== course.level;

  async function run(action, successMessage, skipReload = false) {
    setActionError(null);
    setBusy(true);
    try {
      await action();
      if (successMessage) toast.show(successMessage);
      if (!skipReload) reload();
      return true;
    } catch (err) {
      setActionError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveInfo(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setTitleError("Judul kursus tidak boleh kosong.");
      return;
    }
    setTitleError(null);
    await run(() => updateCourse(course.id, { title: form.title.trim(), description: form.description.trim(), level: form.level }), "Perubahan disimpan");
  }

  async function confirmAction() {
    const { kind, target } = confirm;
    const ok = await run(async () => {
      if (kind === "publish") await updateCourse(course.id, { is_published: true });
      if (kind === "unpublish") await updateCourse(course.id, { is_published: false });
      if (kind === "delete-course") await deleteCourse(course.id);
      if (kind === "delete-module") await deleteModule(target.id);
      if (kind === "delete-lesson") await deleteLesson(target.id);
    }, {
      publish: "Kursus diterbitkan",
      unpublish: "Kursus dikembalikan ke draf",
      "delete-module": "Modul dihapus",
      "delete-lesson": "Materi dihapus",
    }[kind], kind === "delete-course");
    if (!ok) return;
    setConfirm(null);
    if (kind === "delete-course") router.push("/instruktur/kursus");
  }

  const modal = (() => {
    if (!confirm) return {};
    const { kind, target } = confirm;
    if (kind === "publish")
      return {
        title: `Terbitkan kursus ini?`,
        description: `Kursus dengan ${course.modules.length} modul dan ${lessonCount} materi akan terlihat oleh semua siswa dan pengunjung.`,
        confirmLabel: "Terbitkan",
      };
    if (kind === "unpublish")
      return {
        title: "Kembalikan kursus ke draf?",
        description: "Kursus tidak lagi tampil di katalog. Siswa yang sudah mendaftar tidak bisa membukanya sampai kamu menerbitkannya lagi.",
        confirmLabel: "Jadikan draf",
      };
    if (kind === "delete-course")
      return {
        title: `Hapus kursus "${course.title}"?`,
        description: `${course.modules.length} modul, ${lessonCount} materi beserta kuisnya, dan progres siswa pada kursus ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.`,
        confirmLabel: "Hapus kursus",
        danger: true,
      };
    if (kind === "delete-module")
      return {
        title: `Hapus modul "${target.title}" beserta ${target.lessons.length} materinya?`,
        description: "Kuis dan progres siswa pada materi di modul ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.",
        confirmLabel: "Hapus modul",
        danger: true,
      };
    return {
      title: `Hapus materi "${target.title}"?`,
      description: `${target.quizzes?.length ?? 0} kuis dan progres siswa pada materi ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: "Hapus materi",
      danger: true,
    };
  })();

  return (
    <div>
      <Toast message={toast.message} onClose={toast.close} />
      <Breadcrumbs items={[{ label: "Kursus saya", href: "/instruktur/kursus" }, { label: course.title }]} />

      <header className="flex flex-wrap items-start justify-between gap-4 py-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[32px] font-bold leading-10">{course.title}</h1>
            <Pill tone={course.is_published ? "success" : "neutral"}>{course.is_published ? "Terbit" : "Draf"}</Pill>
          </div>
          <p className="mt-1 text-sm font-medium text-tinta-500">{course.modules.length} modul · {lessonCount} materi</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/kursus/${course.id}`} target="_blank" className={btn("secondary", "m")}>Pratinjau sebagai siswa</Link>
          {isOwner && (course.is_published ? (
            <button type="button" onClick={() => setConfirm({ kind: "unpublish" })} className={btn("secondary", "m")}>Jadikan draf</button>
          ) : (
            <button type="button" onClick={() => setConfirm({ kind: "publish" })} disabled={lessonCount === 0} title={lessonCount === 0 ? "Tambahkan minimal satu materi sebelum menerbitkan" : undefined} className={btn("dark", "m")}>Terbitkan</button>
          ))}
        </div>
      </header>

      {!course.is_published && lessonCount === 0 && (
        <div className="mb-6"><Banner tone="info">Tambahkan minimal satu modul dan satu materi sebelum menerbitkan kursus.</Banner></div>
      )}
      {actionError && (
        <div className="mb-6"><Banner tone="danger" role="alert">Perubahan gagal disimpan: {actionError}</Banner></div>
      )}

      <form onSubmit={saveInfo} noValidate className="rounded-3xl border border-tinta-100 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold leading-7">Info kursus</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_200px]">
          <div>
            <label htmlFor="judul" className={labelClass}>Judul kursus</label>
            <input id="judul" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} onBlur={() => setTitleError(form.title.trim() ? null : "Judul kursus tidak boleh kosong.")} aria-invalid={titleError ? true : undefined} className={`${inputClass} mt-1.5 ${titleError ? "!border-danger-fg" : ""}`} />
            {titleError && <p className="mt-1.5 text-xs font-medium text-danger-fg">{titleError}</p>}
          </div>
          <div>
            <label htmlFor="level" className={labelClass}>Level</label>
            <select id="level" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} className={`${inputClass} mt-1.5`}>
              <option value="pemula">Pemula</option>
              <option value="menengah">Menengah</option>
              <option value="mahir">Mahir</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="deskripsi" className={labelClass}>Deskripsi</label>
            <textarea id="deskripsi" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={`${inputClass} mt-1.5 h-auto py-3`} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy || !dirty} className={btn("primary", "m")}>{busy ? "Menyimpan…" : "Simpan perubahan"}</button>
          {dirty && <span className="text-xs font-medium text-tinta-500">Ada perubahan yang belum disimpan.</span>}
        </div>
      </form>

      <section aria-labelledby="struktur" className="mt-10">
        <h2 id="struktur" className="text-2xl font-bold leading-8">Struktur kursus</h2>
        <p className="mt-1 text-sm text-tinta-500">Atur urutan dengan tombol panah. Klik judul materi untuk menulis isi dan kuisnya.</p>

        {course.modules.length === 0 ? (
          <p className="mt-4 rounded-3xl border border-dashed border-tinta-200 bg-white p-6 text-sm text-tinta-500">Belum ada modul. Tambahkan modul pertama di bawah.</p>
        ) : (
          <ol className="mt-4 space-y-4">
            {course.modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={index}
                total={course.modules.length}
                siblings={course.modules}
                busy={busy}
                courseId={course.id}
                onRename={(row, title) => run(() => updateModule(row.id, { title }), "Nama modul diperbarui")}
                onMove={(a, b) => run(() => swapPositions("modules", a, b))}
                onDelete={(row) => setConfirm({ kind: "delete-module", target: row })}
                onAddLesson={async (row, title) => {
                  setActionError(null);
                  setBusy(true);
                  try {
                    const lesson = await addLesson(row.id, title, nextPosition(row.lessons));
                    router.push(`/instruktur/kursus/${course.id}/materi/${lesson.id}`);
                  } catch (err) {
                    setActionError(err.message);
                    setBusy(false);
                  }
                }}
                onDeleteLesson={(row) => setConfirm({ kind: "delete-lesson", target: row })}
                onMoveLesson={(a, b) => run(() => swapPositions("lessons", a, b))}
              />
            ))}
          </ol>
        )}

        <form
          className="mt-4 flex flex-wrap items-center gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!moduleTitle.trim()) return;
            const ok = await run(() => addModule(course.id, moduleTitle.trim(), nextPosition(course.modules)), "Modul ditambahkan");
            if (ok) setModuleTitle("");
          }}
        >
          <label htmlFor="modul-baru" className="sr-only">Judul modul baru</label>
          <input id="modul-baru" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="Judul modul baru, misalnya Cahaya dan exposure" className={`${inputClass} !w-auto min-w-0 flex-1 sm:max-w-md`} />
          <button type="submit" disabled={busy || !moduleTitle.trim()} className={btn("secondary", "m")}><PlusIcon size={16} /> Tambah modul</button>
        </form>
      </section>

      {isOwner && (
        <section aria-labelledby="zona-bahaya" className="mt-12 rounded-3xl border border-danger-line bg-white p-6">
          <h2 id="zona-bahaya" className="text-base font-semibold leading-6">Hapus kursus</h2>
          <p className="mt-1 text-sm text-tinta-500">Menghapus kursus juga menghapus seluruh modul, materi, kuis, dan progres siswa di dalamnya.</p>
          <button type="button" onClick={() => setConfirm({ kind: "delete-course" })} className={`${btn("danger", "m")} mt-4`}>Hapus kursus</button>
        </section>
      )}

      <ConfirmModal open={Boolean(confirm)} busy={busy} onCancel={() => setConfirm(null)} onConfirm={confirmAction} {...modal} />
    </div>
  );
}

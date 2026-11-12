"use client";
// components/instructor/CourseList.js — "Kursus saya" (UIUX_GUIDELINE §15): tabel kursus dan pembuatan kursus baru.
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createCourse, listMyCourses } from "@/lib/instructor";
import { BookIcon, PlusIcon } from "@/components/icons";
import { Banner, EmptyNote, ErrorNote, Loading, PageHeader, Pill, btn, inputClass, labelClass, LevelBadge } from "@/components/lms/ui";
import { useLoad } from "./useLoad";

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

function NewCourseForm({ userId, onCancel }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("pemula");
  const [titleError, setTitleError] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (!title.trim()) {
      setTitleError("Isi judul kursus, misalnya \"Dasar Segitiga Exposure\".");
      return;
    }
    setBusy(true);
    try {
      const course = await createCourse({ userId, title: title.trim(), description: description.trim(), level });
      router.push(`/instruktur/kursus/${course.id}`);
    } catch (err) {
      setError(`Kursus gagal dibuat: ${err.message}`);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mb-6 rounded-3xl border border-sprout-200 bg-sprout-50 p-6">
      <h2 className="text-xl font-semibold leading-7">Kursus baru</h2>
      <p className="mt-1 text-sm text-tinta-500">Kursus baru berstatus Draf dan belum terlihat oleh siswa sampai kamu menerbitkannya.</p>
      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_200px]">
        <div>
          <label htmlFor="judul-baru" className={labelClass}>Judul kursus</label>
          <input
            id="judul-baru"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => setTitleError(title.trim() ? null : "Isi judul kursus.")}
            aria-invalid={titleError ? true : undefined}
            className={`${inputClass} mt-1.5 ${titleError ? "!border-danger-fg" : ""}`}
          />
          {titleError && <p className="mt-1.5 text-xs font-medium text-danger-fg">{titleError}</p>}
        </div>
        <div>
          <label htmlFor="level-baru" className={labelClass}>Level</label>
          <select id="level-baru" value={level} onChange={(event) => setLevel(event.target.value)} className={`${inputClass} mt-1.5`}>
            <option value="pemula">Pemula</option>
            <option value="menengah">Menengah</option>
            <option value="mahir">Mahir</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="deskripsi-baru" className={labelClass}>Deskripsi singkat</label>
          <textarea
            id="deskripsi-baru"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${inputClass} mt-1.5 h-auto py-3`}
          />
        </div>
      </div>
      {error && (
        <div className="mt-4">
          <Banner tone="danger" role="alert">{error}</Banner>
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={btn("primary", "m")}>{busy ? "Menyimpan…" : "Buat kursus"}</button>
        <button type="button" onClick={onCancel} disabled={busy} className={btn("ghost", "m")}>Batal</button>
      </div>
    </form>
  );
}

export default function CourseList() {
  const { user, role } = useAuth();
  const params = useSearchParams();
  const [creating, setCreating] = useState(params.get("baru") === "1");
  const { data, status, error, reload } = useLoad(() => listMyCourses(user.id, role), [user.id, role]);

  if (status === "loading") return <Loading label="Memuat kursus…" />;
  if (status === "error") {
    return (
      <div className="py-8">
        <ErrorNote onRetry={reload}>Kursus gagal dimuat: {error}. Periksa koneksi lalu coba lagi.</ErrorNote>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Kursus saya" description="Susun kursus, modul, dan materi, lalu terbitkan agar siswa bisa belajar.">
        {!creating && (
          <button type="button" onClick={() => setCreating(true)} className={btn("primary", "l")}>
            <PlusIcon size={20} /> Buat kursus
          </button>
        )}
      </PageHeader>

      {creating && <NewCourseForm userId={user.id} onCancel={() => setCreating(false)} />}

      {data.length === 0 ? (
        <EmptyNote Icon={BookIcon}>Kamu belum membuat kursus. Mulai dengan satu kursus berisi satu modul dan satu materi.</EmptyNote>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-tinta-100 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-tinta-50 text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">
              <tr>
                <th scope="col" className="px-5 py-3">Judul</th>
                <th scope="col" className="px-5 py-3">Level</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Siswa</th>
                <th scope="col" className="px-5 py-3">Dibuat</th>
                <th scope="col" className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tinta-100">
              {data.map((course) => (
                <tr key={course.id} className="h-[52px] hover:bg-sprout-50">
                  <td className="px-5 py-3">
                    <Link href={`/instruktur/kursus/${course.id}`} className="font-semibold hover:underline">{course.title}</Link>
                    <p className="text-xs font-medium text-tinta-500">{course.moduleCount} modul · {course.lessonCount} materi</p>
                  </td>
                  <td className="px-5 py-3"><LevelBadge level={course.level} /></td>
                  <td className="px-5 py-3"><Pill tone={course.is_published ? "success" : "neutral"}>{course.is_published ? "Terbit" : "Draf"}</Pill></td>
                  <td className="px-5 py-3 text-right font-semibold tabular">{course.students}</td>
                  <td className="px-5 py-3 text-tinta-500">{dateFormat.format(new Date(course.created_at))}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/instruktur/kursus/${course.id}`} className={btn("secondary", "s")}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

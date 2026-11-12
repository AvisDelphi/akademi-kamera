"use client";
// components/instructor/StudentTable.js — "Siswa & nilai" (UIUX_GUIDELINE §15): filter kursus dan tabel
// progres materi, nilai kuis terbaik, latihan lulus, serta aktivitas terakhir.
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getCourseStudents, listMyCourses } from "@/lib/instructor";
import { EXERCISES } from "@/lib/exercises";
import { UsersIcon } from "@/components/icons";
import { EmptyNote, ErrorNote, Loading, PageHeader, ProgressBar, btn, inputClass, labelClass } from "@/components/lms/ui";
import { useLoad } from "./useLoad";

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

function Students({ courseId }) {
  const { data, status, error, reload } = useLoad(() => getCourseStudents(courseId), [courseId]);

  if (status === "loading") return <Loading label="Memuat siswa…" />;
  if (status === "error") return <ErrorNote onRetry={reload}>Data siswa gagal dimuat: {error}. Periksa koneksi lalu coba lagi.</ErrorNote>;
  if (data.students.length === 0)
    return <EmptyNote Icon={UsersIcon}>Belum ada siswa yang mendaftar di kursus ini. Pastikan kursus sudah diterbitkan.</EmptyNote>;

  return (
    <div className="overflow-x-auto rounded-3xl border border-tinta-100 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-tinta-50 text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">
          <tr>
            <th scope="col" className="px-5 py-3">Siswa</th>
            <th scope="col" className="px-5 py-3">Progres materi</th>
            <th scope="col" className="px-5 py-3 text-right">Nilai kuis terbaik</th>
            <th scope="col" className="px-5 py-3 text-right">Latihan lulus</th>
            <th scope="col" className="px-5 py-3">Aktivitas terakhir</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tinta-100">
          {data.students.map((student) => {
            const pct = data.totalLessons ? Math.round((student.done / data.totalLessons) * 100) : 0;
            return (
              <tr key={student.userId} className="h-[52px] hover:bg-sprout-50">
                <td className="px-5 py-3 font-semibold">{student.name}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-28"><ProgressBar pct={pct} label={`Progres ${student.name}: ${student.done} dari ${data.totalLessons} materi`} /></div>
                    <span className="text-xs font-medium text-tinta-500 tabular">{student.done}/{data.totalLessons}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-semibold tabular">{student.bestScore ?? "—"}</td>
                <td className="px-5 py-3 text-right font-semibold tabular">{student.passedExercises}/{EXERCISES.length}</td>
                <td className="px-5 py-3 text-tinta-500">{student.lastActivity ? dateFormat.format(new Date(student.lastActivity)) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function StudentTable() {
  const { user, role } = useAuth();
  const { data: courses, status, error, reload } = useLoad(() => listMyCourses(user.id, role), [user.id, role]);
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    if (courses?.length && !courseId) setCourseId(String(courses[0].id));
  }, [courses, courseId]);

  if (status === "loading") return <Loading label="Memuat kursus…" />;
  if (status === "error") return <div className="py-8"><ErrorNote onRetry={reload}>Kursus gagal dimuat: {error}</ErrorNote></div>;

  return (
    <div>
      <PageHeader title="Siswa & nilai" description="Lihat progres materi, nilai kuis, dan latihan simulator siswa per kursus." />
      {courses.length === 0 ? (
        <EmptyNote Icon={UsersIcon} action={{ href: "/instruktur/kursus?baru=1", label: "Buat kursus" }}>
          Kamu belum punya kursus, jadi belum ada siswa untuk dipantau.
        </EmptyNote>
      ) : (
        <>
          <div className="mb-6 max-w-sm">
            <label htmlFor="filter-kursus" className={labelClass}>Kursus</label>
            <select id="filter-kursus" value={courseId} onChange={(event) => setCourseId(event.target.value)} className={`${inputClass} mt-1.5`}>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          {courseId && <Students courseId={courseId} />}
        </>
      )}
    </div>
  );
}

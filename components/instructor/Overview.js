"use client";
// components/instructor/Overview.js — Ringkasan instruktur (UIUX_GUIDELINE §15): 4 kartu statistik
// dan aktivitas siswa terbaru.
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getOverview } from "@/lib/instructor";
import { BookIcon, CheckIcon, ChartIcon, PlusIcon, PresentationIcon, UsersIcon, XIcon } from "@/components/icons";
import { Banner, EmptyNote, ErrorNote, Loading, PageHeader, Pill, StatCard, btn } from "@/components/lms/ui";
import { useLoad } from "./useLoad";

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default function Overview() {
  const { user, role, displayName } = useAuth();
  const { data, status, error, reload } = useLoad(() => getOverview(user.id, role), [user.id, role]);

  if (status === "loading") return <Loading label="Memuat ringkasan…" />;
  if (status === "error") {
    return (
      <div className="py-8">
        <ErrorNote onRetry={reload}>Ringkasan gagal dimuat: {error}. Periksa koneksi lalu coba lagi.</ErrorNote>
      </div>
    );
  }

  const { stats, courses, activity } = data;

  return (
    <div>
      <PageHeader title={`Halo, ${displayName || "Instruktur"}.`} description="Pantau siswa dan kelola kursusmu dari satu tempat.">
        <Link href="/instruktur/kursus?baru=1" className={btn("primary", "l")}>
          <PlusIcon size={20} /> Buat kursus
        </Link>
      </PageHeader>

      <section aria-label="Statistik" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={UsersIcon} label="Siswa terdaftar" value={stats.students} />
        <StatCard Icon={BookIcon} label="Kursus terbit" value={`${stats.publishedCourses}/${courses.length}`} />
        <StatCard Icon={CheckIcon} label="Materi selesai minggu ini" value={stats.lessonsThisWeek} />
        <StatCard Icon={ChartIcon} label="Rata-rata nilai kuis" value={stats.averageScore ?? "—"} />
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="aktivitas">
          <h2 id="aktivitas" className="text-2xl font-bold leading-8">
            Aktivitas siswa terbaru
          </h2>
          {activity.length === 0 ? (
            <div className="mt-4">
              <EmptyNote Icon={UsersIcon}>
                Belum ada aktivitas siswa. Terbitkan kursus agar siswa bisa mendaftar dan mulai belajar.
              </EmptyNote>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-tinta-100 overflow-hidden rounded-3xl border border-tinta-100 bg-white">
              {activity.map((item, index) => (
                <li key={`${item.at}-${index}`} className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <p className="text-sm">
                    <span className="font-semibold">{item.name}</span> {item.text}
                  </p>
                  <span className="flex items-center gap-3">
                    {item.passed !== undefined && item.passed !== null && (
                      <Pill tone={item.passed ? "success" : "warning"} Icon={item.passed ? CheckIcon : XIcon}>
                        {item.passed ? "Lulus" : "Belum lulus"}
                      </Pill>
                    )}
                    <span className="text-xs font-medium text-tinta-500">{dateFormat.format(new Date(item.at))}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <section aria-labelledby="kursus-ringkas" className="rounded-3xl border border-tinta-100 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="kursus-ringkas" className="text-base font-semibold leading-6">
                Kursus saya
              </h2>
              <Link href="/instruktur/kursus" className="text-sm font-semibold text-sprout-700 hover:underline">
                Lihat semua
              </Link>
            </div>
            {courses.length === 0 ? (
              <p className="mt-3 text-sm leading-[22px] text-tinta-500">Kamu belum membuat kursus.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {courses.slice(0, 4).map((course) => (
                  <li key={course.id}>
                    <Link
                      href={`/instruktur/kursus/${course.id}`}
                      className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-sprout-50"
                    >
                      <span className="truncate">{course.title}</span>
                      <Pill tone={course.is_published ? "success" : "neutral"}>{course.is_published ? "Terbit" : "Draf"}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <Banner tone="info">
            <p className="flex items-center gap-2 font-semibold">
              <PresentationIcon size={16} /> Catatan akses
            </p>
            <p className="mt-1">Untuk prototipe ini, data siswa yang tampil mencakup semua siswa terdaftar di kursusmu.</p>
          </Banner>
        </aside>
      </div>
    </div>
  );
}

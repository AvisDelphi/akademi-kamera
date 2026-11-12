"use client";
// components/lms/CourseCatalog.js — katalog kursus terbit (UIUX_GUIDELINE §11.1).
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { listPublishedCourses } from "@/lib/lms";
import { ApertureIcon, BookIcon, SearchIcon } from "@/components/icons";
import { Banner, EmptyNote, ErrorNote, LevelBadge, Loading, SupabaseNotice, btn, inputClass } from "./ui";

const LEVELS = [
  { value: "", label: "Semua" },
  { value: "pemula", label: "Pemula" },
  { value: "menengah", label: "Menengah" },
  { value: "mahir", label: "Mahir" },
];

export default function CourseCatalog() {
  const { enabled, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setStatus("loading");
    setError(null);
    listPublishedCourses()
      .then((rows) => {
        if (!active) return;
        setCourses(rows);
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
  }, [enabled, attempt]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesLevel = !level || course.level === level;
      const matchesQuery =
        !needle ||
        course.title.toLowerCase().includes(needle) ||
        (course.description ?? "").toLowerCase().includes(needle);
      return matchesLevel && matchesQuery;
    });
  }, [courses, query, level]);

  if (!enabled) return <SupabaseNotice />;
  if (status === "loading") return <Loading label="Memuat katalog kursus…" />;
  if (status === "error") {
    return (
      <ErrorNote
        onRetry={() => {
          setStatus("loading");
          setAttempt((value) => value + 1);
        }}
      >
        Kursus gagal dimuat: {error}. Periksa koneksi lalu coba lagi.
      </ErrorNote>
    );
  }

  return (
    <div>
      {!user && (
        <div className="mb-6">
          <Banner
            tone="info"
            action={
              <div className="flex shrink-0 gap-2">
                <Link href="/masuk?next=/kursus" className={btn("secondary", "s")}>
                  Masuk
                </Link>
                <Link href="/daftar?next=/kursus" className={btn("primary", "s")}>
                  Daftar
                </Link>
              </div>
            }
          >
            Kamu bisa membaca materi tanpa akun. Masuk agar pendaftaran kursus, progres, dan nilai kuis tersimpan.
          </Banner>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-72">
          <label htmlFor="cari-kursus" className="sr-only">
            Cari kursus
          </label>
          <SearchIcon size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tinta-400" />
          <input
            id="cari-kursus"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari judul atau kata kunci"
            className={`${inputClass} pl-10`}
          />
        </div>

        <div role="group" aria-label="Filter level" className="inline-flex rounded-xl bg-tinta-100 p-1">
          {LEVELS.map((option) => {
            const active = level === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setLevel(option.value)}
                className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors duration-[120ms] ${
                  active ? "bg-white text-tinta-900 shadow-e1" : "text-tinta-500 hover:text-tinta-900"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm font-medium text-tinta-500 sm:ml-auto" aria-live="polite">
          {filtered.length} kursus
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyNote Icon={BookIcon}>
          Belum ada kursus yang diterbitkan. Instruktur dapat menambahkannya lewat SQL Editor, atau jalankan
          supabase/lms-seed.sql untuk contoh materi.
        </EmptyNote>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-tinta-200 bg-white px-6 py-10 text-center">
          <p className="text-sm text-tinta-500">Tidak ada kursus yang cocok dengan pencarian atau level ini.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLevel("");
            }}
            className={btn("secondary", "s")}
          >
            Tampilkan semua
          </button>
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <li key={course.id}>
              <Link
                href={`/kursus/${course.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-tinta-100 bg-white shadow-e1 transition duration-200 hover:-translate-y-0.5 hover:border-sprout-200 hover:shadow-e2"
              >
                <div className="relative grid aspect-video place-items-center bg-sprout-100 text-sprout-800">
                  <span className="grid size-16 place-items-center rounded-2xl bg-tinta-900 text-sprout-300">
                    <ApertureIcon size={32} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <LevelBadge level={course.level} />
                  <h2 className="mt-3 text-base font-semibold leading-6">{course.title}</h2>
                  <p className="mt-1 text-xs font-medium text-tinta-500">
                    {course.instructor?.full_name ? `Instruktur: ${course.instructor.full_name}` : "Kursus Akademi Kamera"}
                  </p>
                  <p className="mt-3 line-clamp-2 flex-1 text-sm leading-[22px] text-tinta-500">{course.description}</p>
                  <span className="mt-5 text-sm font-semibold text-sprout-700 group-hover:underline">Lihat kursus →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

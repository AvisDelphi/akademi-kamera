"use client";
// components/lms/CourseCatalog.js — public catalog of published courses.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { listPublishedCourses } from "@/lib/lms";
import { EmptyNote, ErrorNote, LevelBadge, Loading, SupabaseNotice } from "./ui";

const LEVELS = [
  { value: "", label: "Semua level" },
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
        Gagal memuat kursus: {error}
      </ErrorNote>
    );
  }

  return (
    <div>
      {!user && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded border border-rule bg-panel p-4">
          <p className="text-sm text-muted">
            Kamu bisa membaca materi tanpa akun. Masuk agar pendaftaran kursus, progres, dan nilai kuis tersimpan.
          </p>
          <div className="flex gap-3">
            <Link href="/masuk?next=/kursus" className="rounded-full bg-amber px-4 py-1.5 font-display font-semibold text-surround">
              Masuk
            </Link>
            <Link href="/daftar?next=/kursus" className="rounded-full border border-rule px-4 py-1.5 font-display font-semibold">
              Daftar
            </Link>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="text-sm text-muted">
          Cari kursus
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Judul atau kata kunci"
            className="mt-1 block w-64 rounded border border-rule bg-panel px-3 py-2 text-ink"
          />
        </label>
        <label className="text-sm text-muted">
          Level
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="mt-1 block rounded border border-rule bg-panel px-3 py-2 text-ink"
          >
            {LEVELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="ml-auto pb-2 text-sm text-muted" aria-live="polite">
          {filtered.length} kursus
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyNote>
          Belum ada kursus yang dipublikasikan. Instruktur dapat menambahkannya lewat SQL Editor, atau jalankan{" "}
          <code className="rounded bg-surround px-1">supabase/lms-seed.sql</code> untuk contoh materi.
        </EmptyNote>
      ) : filtered.length === 0 ? (
        <EmptyNote>Tidak ada kursus yang cocok dengan pencarian.</EmptyNote>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <li key={course.id}>
              <Link
                href={`/kursus/${course.id}`}
                className="flex h-full flex-col rounded border border-rule bg-panel p-5 transition-colors hover:border-amber"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold">{course.title}</h2>
                  <LevelBadge level={course.level} />
                </div>
                <p className="mt-2 line-clamp-4 flex-1 text-sm text-muted">{course.description}</p>
                <p className="mt-4 text-xs text-muted">
                  {course.instructor?.full_name ? `Instruktur: ${course.instructor.full_name}` : "Kursus Akademi Kamera"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

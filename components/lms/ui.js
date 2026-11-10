// components/lms/ui.js — small presentational building blocks shared by LMS pages.
import Link from "next/link";

export function SupabaseNotice() {
  return (
    <div className="rounded border border-rule bg-panel p-6">
      <h2 className="font-display text-xl font-semibold">LMS membutuhkan Supabase</h2>
      <p className="mt-2 max-w-prose text-muted">
        Fitur akun, kursus, dan progres disimpan di Supabase. Simulator dan analisis foto tetap berjalan tanpa
        konfigurasi. Untuk mengaktifkan LMS:
      </p>
      <ol className="mt-4 max-w-prose list-decimal space-y-2 pl-5 text-sm">
        <li>
          Buat proyek di{" "}
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber underline">
            supabase.com
          </a>
          , lalu jalankan seluruh isi <code className="rounded bg-surround px-1">supabase/schema.sql</code> di SQL
          Editor.
        </li>
        <li>
          Salin <code className="rounded bg-surround px-1">.env.example</code> menjadi{" "}
          <code className="rounded bg-surround px-1">.env.local</code>, lalu isi{" "}
          <code className="rounded bg-surround px-1">NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
          <code className="rounded bg-surround px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </li>
        <li>
          Jalankan <code className="rounded bg-surround px-1">supabase/lms-seed.sql</code> untuk mengisi contoh kursus
          (butuh satu akun berperan instruktur, lihat README).
        </li>
        <li>Mulai ulang server pengembangan.</li>
      </ol>
    </div>
  );
}

export function Loading({ label = "Memuat…" }) {
  return (
    <p className="py-8 text-muted" role="status">
      {label}
    </p>
  );
}

export function ErrorNote({ children, onRetry }) {
  return (
    <div className="rounded border border-over/50 bg-panel p-4" role="alert">
      <p className="text-over">{children}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 text-sm text-amber underline">
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function AuthPrompt({ next = "/kursus", message = "Masuk untuk memakai fitur ini." }) {
  return (
    <div className="rounded border border-rule bg-panel p-6">
      <p className="max-w-prose">{message}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/masuk?next=${encodeURIComponent(next)}`}
          className="rounded-full bg-amber px-5 py-2 font-display font-semibold text-surround"
        >
          Masuk
        </Link>
        <Link href="/daftar" className="rounded-full border border-rule px-5 py-2 font-display font-semibold">
          Buat akun
        </Link>
      </div>
    </div>
  );
}

export function EmptyNote({ children }) {
  return <p className="rounded border border-dashed border-rule p-5 text-muted">{children}</p>;
}

const LEVEL_LABEL = { pemula: "Pemula", menengah: "Menengah", mahir: "Mahir" };

export function LevelBadge({ level }) {
  return (
    <span className="rounded-full border border-rule px-3 py-0.5 text-xs text-muted">
      {LEVEL_LABEL[level] ?? level}
    </span>
  );
}

export function ProgressBar({ pct }) {
  return (
    <div className="h-2 w-full rounded-full bg-rule" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-2 rounded-full bg-amber transition-[width]" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Remah roti" className="flex flex-wrap items-center gap-2 text-sm text-muted">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden="true">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

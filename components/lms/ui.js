// components/lms/ui.js — blok presentasi bersama (UIUX_GUIDELINE §8): tombol, input, banner,
// skeleton, progres, badge, breadcrumb, toast. Dipakai oleh seluruh halaman aplikasi.
import Link from "next/link";
import { AlertIcon, CheckIcon, InfoIcon, XIcon } from "@/components/icons";

// ---------- Tombol & input (§8.1, §8.2) ----------

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-[120ms] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0";
const BTN_SIZE = { s: "h-8 px-4 text-[13px]", m: "h-10 px-5 text-sm", l: "h-12 px-6 text-base" };
const BTN_VARIANT = {
  primary: "bg-sprout-300 text-tinta-900 hover:bg-sprout-400 active:bg-sprout-500",
  dark: "bg-tinta-900 text-white hover:bg-tinta-700",
  secondary: "border border-tinta-200 bg-white text-tinta-900 hover:bg-tinta-50",
  ghost: "text-tinta-600 hover:bg-tinta-50",
  danger: "bg-danger-fg text-white hover:brightness-90",
};

/** Kelas Tailwind untuk <button> atau <Link> bergaya tombol. */
export function btn(variant = "primary", size = "m") {
  return `${BTN_BASE} ${BTN_SIZE[size]} ${BTN_VARIANT[variant]}`;
}

export const inputClass =
  "block h-11 w-full rounded-xl border border-tinta-200 bg-tinta-50 px-3 text-sm text-tinta-900 placeholder:text-tinta-400 hover:border-tinta-300 focus:border-sprout-600 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-sprout-100 disabled:cursor-not-allowed disabled:text-tinta-400";

export const labelClass = "block text-sm font-semibold text-tinta-600";

// ---------- Banner & catatan (§8.11, §17) ----------

const TONE = {
  info: { box: "border-tinta-200 bg-tinta-100 text-tinta-600", Icon: InfoIcon },
  success: { box: "border-sprout-200 bg-sprout-100 text-sprout-800", Icon: CheckIcon },
  warning: { box: "border-warn-line bg-warn-bg text-warn-fg", Icon: AlertIcon },
  danger: { box: "border-danger-line bg-danger-bg text-danger-fg", Icon: AlertIcon },
};

export function Banner({ tone = "info", children, action, role }) {
  const { box, Icon } = TONE[tone];
  return (
    <div role={role} className={`flex items-start gap-3 rounded-2xl border p-4 text-sm leading-[22px] ${box}`}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}

export function SupabaseNotice() {
  return (
    <div className="rounded-3xl border border-tinta-100 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-tinta-100 text-tinta-600">
          <InfoIcon size={24} />
        </span>
        <h2 className="text-xl font-semibold leading-7">Fitur akun belum aktif</h2>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-[22px] text-tinta-500">
        Akun, kursus, dan progres disimpan di Supabase. Simulator dan analisis foto tetap berjalan tanpa konfigurasi.
        Untuk mengaktifkan LMS:
      </p>
      <ol className="mt-4 max-w-2xl list-decimal space-y-2 pl-5 text-sm leading-[22px] text-tinta-600">
        <li>
          Buat proyek di{" "}
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="font-semibold text-sprout-700 underline">
            supabase.com
          </a>
          , lalu jalankan seluruh isi <Code>supabase/schema.sql</Code> di SQL Editor.
        </li>
        <li>
          Salin <Code>.env.example</Code> menjadi <Code>.env.local</Code>, lalu isi <Code>NEXT_PUBLIC_SUPABASE_URL</Code>{" "}
          dan <Code>NEXT_PUBLIC_SUPABASE_ANON_KEY</Code>.
        </li>
        <li>
          Jalankan <Code>supabase/lms-seed.sql</Code> untuk mengisi contoh kursus (butuh satu akun berperan instruktur,
          lihat README).
        </li>
        <li>Mulai ulang server pengembangan.</li>
      </ol>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/simulator" className={btn("dark")}>
          Buka simulator
        </Link>
        <Link href="/analisis" className={btn("secondary")}>
          Analisis foto
        </Link>
      </div>
    </div>
  );
}

function Code({ children }) {
  return <code className="rounded-md bg-tinta-100 px-1.5 py-0.5 text-[0.9em] text-tinta-800">{children}</code>;
}

export function ErrorNote({ children, onRetry }) {
  return (
    <Banner
      tone="danger"
      role="alert"
      action={
        onRetry && (
          <button type="button" onClick={onRetry} className={btn("secondary", "s")}>
            Coba lagi
          </button>
        )
      }
    >
      {children}
    </Banner>
  );
}

export function AuthPrompt({ next = "/kursus", message = "Masuk untuk memakai fitur ini." }) {
  return (
    <div className="my-8 max-w-2xl rounded-3xl border border-tinta-100 bg-white p-6 sm:p-8">
      <p className="text-base leading-[26px]">{message}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/masuk?next=${encodeURIComponent(next)}`} className={btn("primary", "l")}>
          Masuk
        </Link>
        <Link href={`/daftar?next=${encodeURIComponent(next)}`} className={btn("secondary", "l")}>
          Buat akun
        </Link>
      </div>
    </div>
  );
}

/** Empty state (§8.13): ikon kecil, kalimat penjelas, satu aksi. */
export function EmptyNote({ children, Icon, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-tinta-200 bg-white px-6 py-8 text-center">
      {Icon && (
        <span className="grid size-12 place-items-center rounded-2xl bg-sprout-100 text-sprout-800">
          <Icon size={24} />
        </span>
      )}
      <p className="max-w-md text-sm leading-[22px] text-tinta-500">{children}</p>
      {action && (
        <Link href={action.href} className={btn("secondary", "s")}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ---------- Loading (§8.12) ----------

export function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`skeleton rounded-xl ${className}`} />;
}

/** Skeleton halaman: judul + deretan kartu. `label` dibacakan pembaca layar. */
export function Loading({ label = "Memuat…" }) {
  return (
    <div role="status" className="py-8">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="hidden h-40 rounded-3xl lg:block" />
      </div>
    </div>
  );
}

// ---------- Badge, progres, kartu (§8.3–§8.5) ----------

const LEVEL_LABEL = { pemula: "Pemula", menengah: "Menengah", mahir: "Mahir" };

export function LevelBadge({ level, dark = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${
        dark ? "bg-tinta-700 text-sprout-100" : "bg-tinta-50 text-tinta-600"
      }`}
    >
      {LEVEL_LABEL[level] ?? level}
    </span>
  );
}

const PILL_TONE = {
  success: "bg-sprout-100 text-tinta-900",
  warning: "bg-warn-bg text-warn-fg",
  danger: "bg-danger-bg text-danger-fg",
  info: "bg-tinta-100 text-tinta-600",
  neutral: "bg-tinta-50 text-tinta-600",
  role: "bg-tinta-900 text-sprout-300",
};

export function Pill({ tone = "neutral", children, Icon }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${PILL_TONE[tone]}`}>
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
}

export function ProgressBar({ pct, label, size = "m" }) {
  const value = Math.min(100, Math.max(0, pct));
  return (
    <div
      className={`w-full rounded-full bg-tinta-100 ${size === "l" ? "h-3" : "h-2"}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Progres ${value}%`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-[800ms] ease-out ${
          value >= 100 ? "bg-sprout-500" : "bg-sprout-300"
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/** Ring progres (§8.4): track Ink-100, isian Sprout, angka di tengah. */
export function ProgressRing({ pct, size = 112, stroke = 8, children, label }) {
  const value = Math.min(100, Math.max(0, pct));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Progres ${value}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-tinta-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          className="stroke-sprout-300 transition-[stroke-dashoffset] duration-[800ms] ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** Kartu statistik (§8.3): ikon di wadah Mint + overline + angka. */
export function StatCard({ Icon, label, value, hint }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-tinta-100 bg-white p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sprout-100 text-sprout-800">
        <Icon size={24} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">{label}</p>
        <p className="mt-0.5 text-[28px] font-bold leading-8 tabular">{value}</p>
        {hint && <p className="mt-0.5 text-xs font-medium text-tinta-500">{hint}</p>}
      </div>
    </div>
  );
}

/** Judul halaman (§9.4): h1 + deskripsi + aksi di kanan. */
export function PageHeader({ title, description, children, overline }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 py-8">
      <div className="max-w-3xl">
        {overline && (
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-sprout-700">{overline}</p>
        )}
        <h1 className="text-[32px] font-bold leading-10">{title}</h1>
        {description && <p className="mt-2 text-base leading-[26px] text-tinta-500">{description}</p>}
      </div>
      {children}
    </header>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Remah roti" className="pt-8 text-xs font-medium text-tinta-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">›</span>}
            {item.href ? (
              <Link href={item.href} className="rounded hover:text-tinta-900 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-tinta-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ---------- Toast (§8.11) ----------

/** Toast kanan atas: latar Ink, ikon Sprout, ditutup manual atau otomatis oleh pemanggil. */
export function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      data-surface="dark"
      role="status"
      className="toast-in fixed inset-x-4 top-20 z-50 flex items-center gap-3 rounded-2xl bg-tinta-900 p-4 text-sm font-medium text-white shadow-e3 sm:left-auto sm:right-6 sm:w-[360px]"
    >
      <CheckIcon size={20} className="shrink-0 text-sprout-300" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup pemberitahuan"
        className="grid size-8 place-items-center rounded-lg text-tinta-300 hover:bg-tinta-700 hover:text-white"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}

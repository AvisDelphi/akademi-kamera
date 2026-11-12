"use client";
// components/auth/RequireRole.js — penjaga peran di sisi tampilan (UIUX_GUIDELINE §17, FR-27).
// Hanya untuk kenyamanan: hak akses sebenarnya ditegakkan RLS di basis data.
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ShieldIcon } from "@/components/icons";
import { AuthPrompt, Loading, SupabaseNotice, btn } from "@/components/lms/ui";

export function AccessDenied({ message }) {
  return (
    <section role="alert" className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-warn-bg text-warn-fg">
        <ShieldIcon size={32} />
      </span>
      <h1 className="mt-6 text-[32px] font-bold leading-10">Akses ditolak</h1>
      <p className="mt-3 text-base leading-[26px] text-tinta-500">{message}</p>
      <Link href="/dasbor" className={`${btn("primary", "l")} mt-8`}>
        Kembali ke dasbor
      </Link>
    </section>
  );
}

/** Tampilkan `children` hanya jika peran pengguna ada di `roles`. */
export default function RequireRole({ roles, message, nextPath, children }) {
  const { enabled, loading, user, role } = useAuth();
  if (!enabled) return <div className="py-8"><SupabaseNotice /></div>;
  if (loading || (user && !role)) return <Loading label="Memeriksa akses…" />;
  if (!user) return <AuthPrompt next={nextPath} message="Masuk untuk membuka halaman ini." />;
  if (!roles.includes(role)) return <AccessDenied message={message} />;
  return children;
}

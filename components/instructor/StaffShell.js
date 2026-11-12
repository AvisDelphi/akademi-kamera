"use client";
// components/instructor/StaffShell.js — kerangka Area Instruktur (UIUX_GUIDELINE §9.2, §15):
// sidebar Ink 264px (ikon saja 72px di tablet, drawer di mobile) dan penjaga peran.
// Penjaga ini hanya untuk kenyamanan tampilan; hak akses sebenarnya ditegakkan RLS di basis data.
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  ApertureIcon,
  ArrowLeftIcon,
  BookIcon,
  MenuIcon,
  PresentationIcon,
  ShieldIcon,
  UsersIcon,
  XIcon,
} from "@/components/icons";
import { AccessDenied } from "@/components/auth/RequireRole";
import { AuthPrompt, Loading, SupabaseNotice } from "@/components/lms/ui";

const NAV = [
  { href: "/instruktur", label: "Ringkasan", Icon: PresentationIcon, exact: true },
  { href: "/instruktur/kursus", label: "Kursus saya", Icon: BookIcon },
  { href: "/instruktur/siswa", label: "Siswa & nilai", Icon: UsersIcon },
];

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

const ADMIN_NAV = [{ href: "/admin/pengguna", label: "Pengguna & peran", Icon: ShieldIcon }];

function NavItems({ items, pathname, compact, onNavigate }) {
  return (
    <ul className="space-y-1">
      {items.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              title={label}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-[120ms] ${
                active ? "bg-tinta-700 text-white" : "text-tinta-300 hover:bg-tinta-700/50"
              } ${compact ? "md:justify-center lg:justify-start" : ""}`}
            >
              {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-sprout-300" />}
              <Icon size={20} className={active ? "text-sprout-300" : undefined} />
              <span className={compact ? "md:hidden lg:inline" : ""}>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function NavList({ pathname, compact, onNavigate, role }) {
  return (
    <nav aria-label="Navigasi Area Instruktur" className="flex-1 px-3">
      <p className={`px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-[0.06em] text-tinta-300 ${compact ? "md:hidden lg:block" : ""}`}>
        Mengajar
      </p>
      <NavItems items={NAV} pathname={pathname} compact={compact} onNavigate={onNavigate} />
      {role === "admin" && (
        <>
          <p className={`px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-[0.06em] text-tinta-300 ${compact ? "md:hidden lg:block" : ""}`}>
            Admin
          </p>
          <NavItems items={ADMIN_NAV} pathname={pathname} compact={compact} onNavigate={onNavigate} />
        </>
      )}
    </nav>
  );
}

function Sidebar({ pathname, displayName, role, compact, onNavigate }) {
  return (
    <div data-surface="dark" className="flex h-full flex-col bg-tinta-900 py-4 text-white">
      <Link
        href="/instruktur"
        onClick={onNavigate}
        className={`mx-3 flex h-11 items-center gap-3 rounded-xl px-2 text-base font-semibold ${compact ? "md:justify-center lg:justify-start" : ""}`}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tinta-800 text-sprout-300">
          <ApertureIcon size={20} />
        </span>
        <span className={compact ? "md:hidden lg:inline" : ""}>Akademi Kamera</span>
      </Link>

      <NavList pathname={pathname} compact={compact} onNavigate={onNavigate} role={role} />

      <div className="mx-3 border-t border-tinta-700 pt-3">
        <Link
          href="/dasbor"
          title="Kembali ke situs"
          onClick={onNavigate}
          className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-tinta-300 hover:bg-tinta-700/50 ${compact ? "md:justify-center lg:justify-start" : ""}`}
        >
          <ArrowLeftIcon size={20} />
          <span className={compact ? "md:hidden lg:inline" : ""}>Kembali ke situs</span>
        </Link>
        <div className={`mt-2 flex items-center gap-3 px-3 py-2 ${compact ? "md:justify-center lg:justify-start" : ""}`}>
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-sprout-100 text-xs font-semibold text-sprout-800">
            {initials(displayName)}
          </span>
          <span className={`truncate text-sm font-medium text-tinta-300 ${compact ? "md:hidden lg:inline" : ""}`}>{displayName}</span>
        </div>
      </div>
    </div>
  );
}

export default function StaffShell({ children }) {
  const pathname = usePathname();
  const { enabled, loading, user, role, displayName } = useAuth();
  const areaTitle = pathname.startsWith("/admin") ? "Admin" : "Area Instruktur";
  const [drawer, setDrawer] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    if (!drawer) return;
    const onKey = (event) => event.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  let body;
  if (!enabled) body = <div className="py-8"><SupabaseNotice /></div>;
  else if (loading || (user && !role)) body = <Loading label="Memeriksa akses…" />;
  else if (!user) body = <AuthPrompt next={pathname} message="Masuk dengan akun instruktur untuk membuka Area Instruktur." />;
  else if (role !== "instructor" && role !== "admin")
    body = <AccessDenied message="Area ini khusus instruktur dan admin. Akunmu berperan siswa. Peran instruktur diberikan oleh admin." />;
  else body = children;

  return (
    <div className="font-instrument text-tinta-900 md:flex">
      {/* Sidebar tablet/desktop */}
      <aside className="sticky top-0 hidden h-screen shrink-0 md:block md:w-[72px] lg:w-[264px]">
        <Sidebar pathname={pathname} displayName={displayName} role={role} compact />
      </aside>

      {/* Bar atas + drawer mobile */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-tinta-100 bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          aria-label="Buka menu"
          aria-expanded={drawer}
          className="grid size-11 place-items-center rounded-xl hover:bg-tinta-50"
        >
          <MenuIcon size={24} />
        </button>
        <span className="text-base font-semibold">{areaTitle}</span>
      </div>
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Tutup menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-tinta-950/60 backdrop-blur-sm" />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-e3">
            <Sidebar pathname={pathname} displayName={displayName} role={role} onNavigate={() => setDrawer(false)} />
            <button
              type="button"
              onClick={() => setDrawer(false)}
              aria-label="Tutup menu"
              className="absolute right-3 top-4 grid size-9 place-items-center rounded-lg text-tinta-300 hover:bg-tinta-700"
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 pb-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1200px]">{body}</div>
      </main>
    </div>
  );
}

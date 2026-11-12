"use client";
// components/SiteHeader.js — navbar atas, navigasi bawah mobile, dan menu akun (UIUX_GUIDELINE §9).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  ApertureIcon,
  BookIcon,
  CameraIcon,
  ChevronDownIcon,
  GridIcon,
  LoginIcon,
  LogoutIcon,
  PhotoSearchIcon,
  PresentationIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/icons";

const LINKS = [
  { href: "/kursus", label: "Kursus" },
  { href: "/simulator", label: "Simulator kamera" },
  { href: "/analisis", label: "Analisis foto" },
];

const isActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

const menuItem =
  "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-tinta-700 transition-colors duration-[120ms] hover:bg-tinta-50";

function AccountMenu({ user, displayName, role, onSignOut }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);

  // Tutup dengan Esc atau klik di luar menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    const onClick = (event) => wrapper.current && !wrapper.current.contains(event.target) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu akun"
        className="flex h-11 items-center gap-2 rounded-xl px-1 transition-colors duration-[120ms] hover:bg-tinta-50 sm:px-2"
      >
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-full bg-sprout-100 text-xs font-semibold text-sprout-800"
        >
          {initials(displayName)}
        </span>
        <span className="hidden max-w-36 truncate text-sm font-semibold text-tinta-600 lg:inline">{displayName}</span>
        <ChevronDownIcon size={16} className="hidden text-tinta-400 sm:block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-64 rounded-2xl border border-tinta-100 bg-white p-2 shadow-e2"
        >
          <div className="px-3 pb-2 pt-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs font-medium text-tinta-500">{user.email}</p>
          </div>
          <div className="border-t border-tinta-100 pt-2">
            <Link href="/dasbor" role="menuitem" onClick={() => setOpen(false)} className={menuItem}>
              <GridIcon size={20} /> Dasbor
            </Link>
            {(role === "instructor" || role === "admin") && (
              <Link href="/instruktur" role="menuitem" onClick={() => setOpen(false)} className={menuItem}>
                <PresentationIcon size={20} /> Area Instruktur
              </Link>
            )}
            {role === "admin" && (
              <Link href="/admin/pengguna" role="menuitem" onClick={() => setOpen(false)} className={menuItem}>
                <ShieldIcon size={20} /> Admin
              </Link>
            )}
            <Link href="/profil" role="menuitem" onClick={() => setOpen(false)} className={menuItem}>
              <UserIcon size={20} /> Profil
            </Link>
          </div>
          <div className="mt-2 border-t border-tinta-100 pt-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className={`${menuItem} !text-danger-fg hover:!bg-danger-bg`}
            >
              <LogoutIcon size={20} /> Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, user, displayName, role, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const links = user ? [...LINKS, { href: "/dasbor", label: "Dasbor" }] : LINKS;
  const mobileLinks = [
    { href: "/kursus", label: "Kursus", Icon: BookIcon },
    { href: "/simulator", label: "Simulator", Icon: CameraIcon },
    { href: "/analisis", label: "Analisis", Icon: PhotoSearchIcon },
    user ? { href: "/dasbor", label: "Dasbor", Icon: GridIcon } : { href: "/masuk", label: "Masuk", Icon: LoginIcon },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b border-tinta-100 bg-white font-instrument transition-shadow duration-200 ${
          scrolled ? "shadow-e2" : ""
        }`}
      >
        <nav aria-label="Navigasi utama" className="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="mr-auto flex items-center gap-3 rounded-xl text-base font-semibold text-tinta-900">
            <span className="grid size-9 place-items-center rounded-xl bg-tinta-900 text-sprout-300">
              <ApertureIcon size={20} />
            </span>
            Akademi Kamera
          </Link>

          <ul className="hidden h-full items-center gap-6 md:flex">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href} className="h-full">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-full items-center border-b-2 text-sm font-semibold transition-colors duration-[120ms] ${
                      active
                        ? "border-sprout-300 text-tinta-900"
                        : "border-transparent text-tinta-500 hover:text-tinta-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {!loading && user && <AccountMenu user={user} displayName={displayName} role={role} onSignOut={handleSignOut} />}

          {!loading && !user && (
            <div className="flex items-center gap-2">
              <Link href="/masuk" className="hidden h-10 items-center rounded-xl px-4 text-sm font-semibold text-tinta-600 transition-colors duration-[120ms] hover:bg-tinta-50 sm:inline-flex">
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="flex h-10 items-center rounded-xl bg-sprout-300 px-5 text-sm font-semibold text-tinta-900 transition-colors duration-[120ms] hover:bg-sprout-400 active:translate-y-px active:bg-sprout-500"
              >
                Daftar
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Navigasi bawah di mobile (§9.3) */}
      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-tinta-100 bg-white font-instrument md:hidden"
      >
        <ul className="grid h-16 grid-cols-4">
          {mobileLinks.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-1 text-xs font-medium ${
                    active ? "text-tinta-900" : "text-tinta-500"
                  }`}
                >
                  <Icon size={20} className={active ? "text-sprout-600" : undefined} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

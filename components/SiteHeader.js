"use client";
// components/SiteHeader.js — top navigation, active page and account state.
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApertureIcon, BookIcon, CameraIcon, GridIcon, LoginIcon, PhotoSearchIcon } from "@/components/icons";

const LINKS = [
  { href: "/kursus", label: "Kursus" },
  { href: "/simulator", label: "Simulator kamera" },
  { href: "/analisis", label: "Analisis foto" },
];

const isActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, user, displayName, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  // Pages already migrated to the Ink & Sprout theme get the light navbar
  // (UIUX_GUIDELINE §9.1) so one page never mixes two themes.
  if (pathname === "/") {
    return (
      <SproutHeader
        pathname={pathname}
        loading={loading}
        user={user}
        displayName={displayName}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <header className="border-b border-rule">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-auto font-display text-lg font-semibold">
          Akademi Kamera
        </Link>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
            className={`text-sm ${isActive(pathname, link.href) ? "text-amber" : "text-muted hover:text-ink"}`}
          >
            {link.label}
          </Link>
        ))}

        {!loading && user && (
          <>
            <Link
              href="/dasbor"
              aria-current={isActive(pathname, "/dasbor") ? "page" : undefined}
              className={`text-sm ${isActive(pathname, "/dasbor") ? "text-amber" : "text-muted hover:text-ink"}`}
            >
              Dasbor
            </Link>
            <span className="hidden max-w-40 truncate text-sm text-muted sm:inline" title={displayName}>
              {displayName}
            </span>
            <button type="button" onClick={handleSignOut} className="text-sm text-muted hover:text-ink">
              Keluar
            </button>
          </>
        )}

        {!loading && !user && (
          <Link href="/masuk" className="text-sm text-amber">
            Masuk
          </Link>
        )}
      </nav>
    </header>
  );
}

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function SproutHeader({ pathname, loading, user, displayName, onSignOut }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <nav aria-label="Navigasi utama" className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
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

          {!loading && user && (
            <div className="flex items-center gap-2">
              <span
                className="grid size-8 place-items-center rounded-full bg-sprout-100 text-xs font-semibold text-sprout-800"
                title={displayName}
                aria-hidden="true"
              >
                {initials(displayName)}
              </span>
              <span className="hidden max-w-40 truncate text-sm text-tinta-600 lg:inline">{displayName}</span>
              <button
                type="button"
                onClick={onSignOut}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-tinta-600 transition-colors duration-[120ms] hover:bg-tinta-50"
              >
                Keluar
              </button>
            </div>
          )}

          {!loading && !user && (
            <div className="flex items-center gap-2">
              <Link
                href="/masuk"
                className="hidden h-10 items-center rounded-xl px-4 text-sm font-semibold text-tinta-600 transition-colors duration-[120ms] hover:bg-tinta-50 sm:flex"
              >
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

      {/* Bottom navigation on mobile (UIUX_GUIDELINE §9.3) */}
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

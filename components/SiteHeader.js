"use client";
// components/SiteHeader.js — top navigation, active page and account state.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

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

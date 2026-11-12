"use client";
// components/landing/LandingNav.js — navbar khusus landing page: logo, navigasi antar-section,
// serta Masuk/Daftar (atau "Buka dasbor" bila sudah masuk). Di mobile, tautan section ada di menu lipat.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ApertureIcon, MenuIcon, XIcon } from "@/components/icons";

const SECTIONS = [
  { id: "mengapa", label: "Mengapa kami" },
  { id: "fitur", label: "Fitur" },
  { id: "faq", label: "FAQ" },
];

const primary =
  "flex h-10 items-center rounded-xl bg-sprout-300 px-5 text-sm font-semibold text-tinta-900 transition-colors duration-[120ms] hover:bg-sprout-400 active:translate-y-px active:bg-sprout-500";
const ghost =
  "flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-tinta-600 transition-colors duration-[120ms] hover:bg-tinta-50";

export default function LandingNav() {
  const { loading, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tandai section yang sedang terlihat di area tengah layar.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const signedIn = !loading && Boolean(user);

  return (
    <header
      className={`sticky top-0 z-30 border-b border-tinta-100 bg-white font-instrument transition-shadow duration-200 ${
        scrolled ? "shadow-e2" : ""
      }`}
    >
      <nav aria-label="Navigasi landing page" className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-auto flex items-center gap-3 rounded-xl text-base font-semibold text-tinta-900">
          <span className="grid size-9 place-items-center rounded-xl bg-tinta-900 text-sprout-300">
            <ApertureIcon size={20} />
          </span>
          Akademi Kamera
        </Link>

        <ul className="hidden h-full items-center gap-8 md:flex">
          {SECTIONS.map(({ id, label }) => (
            <li key={id} className="h-full">
              <a
                href={`#${id}`}
                aria-current={active === id ? "location" : undefined}
                className={`flex h-full items-center border-b-2 text-sm font-semibold transition-colors duration-[120ms] ${
                  active === id ? "border-sprout-300 text-tinta-900" : "border-transparent text-tinta-500 hover:text-tinta-900"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <Link href="/dasbor" className={primary}>
              Buka dasbor
            </Link>
          ) : (
            <>
              <Link href="/masuk" className={ghost}>
                Masuk
              </Link>
              <Link href="/daftar" className={primary}>
                Daftar
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-landing"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="grid size-11 place-items-center rounded-xl text-tinta-900 hover:bg-tinta-50 md:hidden"
        >
          {open ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </nav>

      {open && (
        <div id="menu-landing" className="border-t border-tinta-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <ul>
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center rounded-xl px-3 text-base font-semibold text-tinta-700 hover:bg-tinta-50"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-tinta-100 pt-4">
            {signedIn ? (
              <Link href="/dasbor" className={`${primary} col-span-2 justify-center`}>
                Buka dasbor
              </Link>
            ) : (
              <>
                <Link href="/masuk" className="flex h-11 items-center justify-center rounded-xl border border-tinta-200 text-sm font-semibold hover:bg-tinta-50">
                  Masuk
                </Link>
                <Link href="/daftar" className={`${primary} h-11 justify-center`}>
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

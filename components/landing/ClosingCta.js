"use client";
// components/landing/ClosingCta.js — closing call to action on the landing page (Ink highlight card).
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function ClosingCta() {
  const { loading, user } = useAuth();
  const signedIn = !loading && Boolean(user);

  return (
    <div
      data-surface="dark"
      className="flex flex-col gap-6 rounded-3xl bg-tinta-900 p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="max-w-xl">
        <h2 id="judul-ajakan" className="text-2xl font-bold leading-8">
          {signedIn ? "Lanjutkan belajarmu" : "Daftar gratis untuk menyimpan progresmu"}
        </h2>
        <p className="mt-2 text-base leading-[26px] text-tinta-300">
          {signedIn
            ? "Progres materi, nilai kuis, dan hasil latihanmu menunggu di dasbor."
            : "Tanpa akun, hasil latihan hanya tersimpan di browser ini. Dengan akun, progres materi, nilai kuis, dan latihan tersimpan di dasbormu."}
        </p>
      </div>
      <Link
        href={signedIn ? "/dasbor" : "/daftar"}
        className="inline-flex h-12 shrink-0 items-center justify-center self-start rounded-xl bg-sprout-300 px-6 text-base font-semibold text-tinta-900 transition-colors duration-[120ms] hover:bg-sprout-400 active:translate-y-px active:bg-sprout-500 lg:self-center"
      >
        {signedIn ? "Buka dasbor" : "Buat akun"}
      </Link>
    </div>
  );
}

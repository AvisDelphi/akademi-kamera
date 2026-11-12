"use client";
// app/error.js — batas error untuk seluruh halaman: tidak boleh kosong polos, selalu ada "Coba lagi" (§17).
import { useEffect } from "react";
import Link from "next/link";
import { AlertIcon } from "@/components/icons";
import { btn } from "@/components/lms/ui";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section role="alert" className="mx-auto flex max-w-xl flex-col items-center py-16 text-center sm:py-24">
      <span className="grid size-20 place-items-center rounded-3xl bg-warn-bg text-warn-fg">
        <AlertIcon size={40} />
      </span>
      <h1 className="mt-8 text-[32px] font-bold leading-10">Ada yang tidak berjalan semestinya</h1>
      <p className="mt-3 max-w-md text-base leading-[26px] text-tinta-500">
        Halaman ini gagal ditampilkan. Coba muat ulang; jika masih terjadi, kembali ke beranda lalu buka lagi.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className={btn("primary", "l")}>
          Coba lagi
        </button>
        <Link href="/" className={btn("secondary", "l")}>
          Kembali ke beranda
        </Link>
      </div>
    </section>
  );
}

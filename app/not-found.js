// app/not-found.js — halaman 404 (UIUX_GUIDELINE §17): jelaskan apa yang terjadi dan beri jalan keluar.
import Link from "next/link";
import { ApertureIcon } from "@/components/icons";
import { btn } from "@/components/lms/ui";

export const metadata = { title: "Halaman tidak ditemukan | Akademi Kamera" };

export default function NotFound() {
  return (
    <section aria-labelledby="judul-404" className="mx-auto flex max-w-xl flex-col items-center py-16 text-center sm:py-24">
      <div className="relative grid size-40 place-items-center rounded-[40px] bg-sprout-100">
        <span className="grid size-20 place-items-center rounded-3xl bg-tinta-900 text-sprout-300">
          <ApertureIcon size={44} />
        </span>
        <span className="absolute -right-3 -top-3 rounded-xl bg-sprout-300 px-3 py-1 text-sm font-bold tabular text-tinta-900">
          404
        </span>
      </div>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.06em] text-sprout-700">Tidak ditemukan</p>
      <h1 id="judul-404" className="mt-2 text-[32px] font-bold leading-10">
        Halaman ini di luar bingkai
      </h1>
      <p className="mt-3 max-w-md text-base leading-[26px] text-tinta-500">
        Alamat yang kamu buka tidak ada atau sudah dipindahkan. Periksa lagi alamatnya, atau kembali ke tempat yang
        biasa kamu tuju.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={btn("primary", "l")}>
          Kembali ke beranda
        </Link>
        <Link href="/kursus" className={btn("secondary", "l")}>
          Lihat kursus
        </Link>
      </div>
      <p className="mt-6 text-sm font-medium text-tinta-500">
        Atau langsung coba{" "}
        <Link href="/simulator" className="font-semibold text-sprout-700 hover:underline">
          simulator kamera
        </Link>
        .
      </p>
    </section>
  );
}

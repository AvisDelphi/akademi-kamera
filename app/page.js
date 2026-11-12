// app/page.js — landing page (UIUX_GUIDELINE §14.1, Ink & Sprout theme)
import Link from "next/link";
import ClosingCta from "@/components/landing/ClosingCta";
import HeroIllustration from "@/components/landing/HeroIllustration";
import { ArrowRightIcon, BookIcon, CameraIcon, ChartIcon, PhotoSearchIcon } from "@/components/icons";

export const viewport = { themeColor: "#F6F8F3" };

const FEATURES = [
  {
    href: "/kursus",
    Icon: BookIcon,
    title: "Kursus",
    text: "Materi singkat tentang aperture, shutter speed, dan ISO yang menjelaskan mengapa, bukan hanya apa. Tiap modul ditutup dengan kuis.",
    link: "Lihat kursus",
  },
  {
    href: "/simulator",
    Icon: CameraIcon,
    title: "Simulator kamera",
    text: "Putar dial dan lihat akibatnya langsung pada exposure, blur, dan noise. Lima latihan terpandu dengan kriteria lulus otomatis.",
    link: "Buka simulator",
  },
  {
    href: "/analisis",
    Icon: PhotoSearchIcon,
    title: "Analisis foto",
    text: "Unggah fotomu, baca data EXIF dan histogramnya, lalu dapatkan saran setelan yang konkret. Foto tidak dikirim ke server.",
    link: "Analisis foto",
  },
];

const STEPS = [
  {
    Icon: BookIcon,
    title: "Pahami",
    text: "Baca materi singkat yang menjelaskan sebab di balik setiap setelan.",
  },
  {
    Icon: CameraIcon,
    title: "Coba",
    text: "Praktikkan konsepnya di simulator dan lihat umpan balik seketika.",
  },
  {
    Icon: PhotoSearchIcon,
    title: "Terapkan",
    text: "Analisis foto milikmu sendiri dan coba setelan yang disarankan.",
  },
  {
    Icon: ChartIcon,
    title: "Ukur",
    text: "Kerjakan kuis dan latihan, lalu pantau progresmu di dasbor.",
  },
];

const btnBase =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold transition-colors duration-[120ms] active:translate-y-px";

export default function Home() {
  return (
    <div className="theme-sprout font-instrument text-tinta-900">
      {/* Hero */}
      <section aria-labelledby="judul-beranda" className="grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-sprout-700">
            LMS fotografi · segitiga exposure
          </p>
          <h1
            id="judul-beranda"
            className="mt-4 max-w-2xl text-4xl font-bold leading-[44px] sm:text-5xl sm:leading-[56px]"
          >
            Pahami exposure dengan memotret, bukan menghafal
          </h1>
          <p className="mt-5 max-w-xl text-base leading-[26px] text-tinta-500">
            Pelajari aperture, shutter speed, dan ISO lewat materi singkat, praktikkan di kamera virtual, lalu
            minta saran setelan untuk foto milikmu sendiri.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/simulator"
              className={`${btnBase} bg-sprout-300 text-tinta-900 hover:bg-sprout-400 active:bg-sprout-500`}
            >
              Coba simulator
            </Link>
            <Link
              href="/kursus"
              className={`${btnBase} border border-tinta-200 bg-white text-tinta-900 hover:bg-tinta-50`}
            >
              Lihat kursus
            </Link>
          </div>
          <p className="mt-4 text-xs font-medium text-tinta-500">
            Simulator dan analisis foto bisa dipakai tanpa akun.
          </p>
        </div>
        <div className="lg:col-span-5">
          <HeroIllustration />
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="judul-fitur" className="py-12 sm:py-16">
        <h2 id="judul-fitur" className="text-2xl font-bold leading-8">
          Satu tempat untuk belajar dan berlatih
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-[26px] text-tinta-500">
          Tiga alat yang saling terhubung: dari materi bisa langsung ke latihan simulator, dari hasil analisis bisa
          langsung mencoba setelannya.
        </p>
        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ href, Icon, title, text, link }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-3xl border border-tinta-100 bg-white p-6 shadow-e1 transition duration-200 hover:-translate-y-0.5 hover:border-sprout-200 hover:shadow-e2"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-sprout-100 text-sprout-800">
                  <Icon size={24} />
                </span>
                <h3 className="mt-5 text-xl font-semibold leading-7">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-[22px] text-tinta-500">{text}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sprout-700 group-hover:underline">
                  {link}
                  <ArrowRightIcon size={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="judul-cara-kerja" className="py-12 sm:py-16">
        <h2 id="judul-cara-kerja" className="text-2xl font-bold leading-8">
          Cara kerja
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-[26px] text-tinta-500">
          Setiap konsep melewati empat langkah yang sama, dari teori sampai foto milikmu.
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map(({ Icon, title, text }, index) => (
            <li key={title} className="relative">
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-[21px] left-[52px] hidden h-0.5 w-[calc(100%-36px)] rounded-full bg-sprout-200 lg:block"
                />
              )}
              <span className="relative grid size-11 place-items-center rounded-full border-2 border-sprout-300 bg-white text-sprout-700">
                <Icon size={20} />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500 tabular">
                Langkah {index + 1}
              </p>
              <h3 className="mt-1 text-base font-semibold leading-6">{title}</h3>
              <p className="mt-1 max-w-xs text-sm leading-[22px] text-tinta-500">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA */}
      <section aria-labelledby="judul-ajakan" className="py-12 sm:py-16">
        <ClosingCta />
      </section>

      <footer className="flex flex-col gap-2 border-t border-tinta-100 pt-8 text-xs font-medium text-tinta-500 sm:flex-row sm:justify-between">
        <p>
          <span className="font-semibold text-tinta-900">Akademi Kamera</span> · Tugas akhir S1 Sistem Informasi,
          UPN &quot;Veteran&quot; Jakarta
        </p>
        <p>Foto yang kamu analisis diproses di browser dan tidak dikirim ke server.</p>
      </footer>
    </div>
  );
}

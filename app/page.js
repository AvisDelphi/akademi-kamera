// app/page.js — landing page (UIUX_GUIDELINE §14.1). Sengaja tanpa navbar aplikasi:
// halaman ini hanya memperkenalkan produk. Alur: hero → mengapa → fitur → FAQ → CTA → footer.
import Link from "next/link";
import ClosingCta from "@/components/landing/ClosingCta";
import FaqList from "@/components/landing/FaqList";
import HeroIllustration from "@/components/landing/HeroIllustration";
import {
  ApertureIcon,
  ArrowRightIcon,
  BookIcon,
  CameraIcon,
  ChartIcon,
  InfoIcon,
  LockIcon,
  PhotoSearchIcon,
} from "@/components/icons";

export const viewport = { themeColor: "#F6F8F3" };

const STATS = [
  { value: "5", label: "latihan terpandu" },
  { value: "14", label: "aturan sistem pakar" },
  { value: "4", label: "kondisi cahaya" },
  { value: "0", label: "foto dikirim ke server" },
];

const WHY = [
  {
    Icon: CameraIcon,
    title: "Belajar dengan mencoba",
    text: "Putar aperture, shutter speed, dan ISO lalu lihat akibatnya seketika pada kecerahan, blur, dan noise. Sebab dan akibat terasa jelas.",
  },
  {
    Icon: InfoIcon,
    title: "Saran yang bisa dijelaskan",
    text: "Setiap saran punya alasan. Tabel \"mengapa saran ini muncul\" menunjukkan aturan mana yang terpicu, jadi kamu belajar, bukan sekadar menurut.",
  },
  {
    Icon: LockIcon,
    title: "Fotomu tetap di perangkatmu",
    text: "EXIF dan piksel foto dibaca langsung di browser. Foto tidak diunggah dan data lokasi GPS tidak dibaca.",
  },
  {
    Icon: ChartIcon,
    title: "Kemajuan yang terukur",
    text: "Kuis dengan ambang lulus, kriteria otomatis pada tiap latihan, dan progres kursus di dasbor menunjukkan sejauh mana kamu paham.",
  },
];

const FEATURES = [
  {
    Icon: BookIcon,
    title: "Kursus",
    text: "Materi singkat tentang segitiga exposure yang menjelaskan mengapa, bukan hanya apa. Tiap modul ditutup dengan kuis dan bisa langsung ke latihan simulator.",
    points: ["Modul dan materi berurutan", "Kuis dengan riwayat nilai", "Progres tersimpan di akun"],
    href: "/kursus",
    link: "Lihat kursus",
  },
  {
    Icon: CameraIcon,
    title: "Simulator kamera",
    text: "Kamera virtual mode manual dengan exposure meter dan empat kondisi cahaya. Lima latihan terpandu memberi kriteria lulus otomatis.",
    points: ["Dial per 1/3 stop", "Efek blur, noise, dan goyangan tangan", "Bisa dipakai tanpa akun"],
    href: "/simulator",
    link: "Buka simulator",
  },
  {
    Icon: PhotoSearchIcon,
    title: "Analisis foto",
    text: "Unggah fotomu, baca data EXIF dan histogramnya, lalu dapatkan saran setelan yang konkret, termasuk saat EXIF tidak ada.",
    points: ["Histogram dan deteksi clipping", "Saran setelan yang baru", "Diproses di browser"],
    href: "/analisis",
    link: "Analisis foto",
  },
];

const FAQ = [
  {
    q: "Apakah saya perlu punya kamera?",
    a: "Tidak. Simulator memakai kamera virtual, jadi kamu bisa belajar aperture, shutter speed, dan ISO tanpa alat apa pun. Kamera atau ponsel hanya diperlukan jika kamu ingin menganalisis foto sendiri.",
  },
  {
    q: "Apakah saya harus membuat akun?",
    a: "Simulator dan analisis foto bisa dipakai tanpa akun. Akun dibutuhkan untuk mengikuti kursus, menyimpan progres materi, nilai kuis, dan riwayat latihan.",
  },
  {
    q: "Apakah foto saya diunggah ke server?",
    a: "Tidak. Foto dibaca dan dianalisis di browsermu. Yang tersimpan, jika kamu masuk, hanya angka setelan dan ringkasan hasil, bukan file fotonya. Data lokasi GPS tidak dibaca.",
  },
  {
    q: "Cocok untuk pemula?",
    a: "Ya. Kursus dimulai dari konsep exposure dan istilah dijelaskan saat pertama kali muncul. Kamu bisa memakai simulator berdampingan dengan materi.",
  },
  {
    q: "Bagaimana jika foto saya tidak punya data EXIF?",
    a: "Foto dari WhatsApp atau screenshot biasanya tanpa EXIF. Saran berbasis histogram tetap ditampilkan, dan kamu bisa mengisi setelan yang kamu ingat agar saran lebih lengkap.",
  },
  {
    q: "Seberapa akurat simulatornya?",
    a: "Rumus exposure dihitung tepat dari aperture, shutter speed, dan ISO. Efek visual seperti bokeh dan noise sengaja disederhanakan; daftar penyederhanaannya ada di halaman simulator.",
  },
];

const btnBase =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold transition-colors duration-[120ms] active:translate-y-px";

const container = "mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8";

export default function Home() {
  return (
    <div className="font-instrument text-tinta-900">
      {/* Hero */}
      <section aria-labelledby="judul-beranda" className={`${container} grid items-center gap-12 py-12 sm:py-20 lg:grid-cols-12`}>
        <div className="lg:col-span-7">
          <p className="flex items-center gap-3 text-sm font-semibold">
            <span className="grid size-9 place-items-center rounded-xl bg-tinta-900 text-sprout-300">
              <ApertureIcon size={20} />
            </span>
            Akademi Kamera
          </p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.06em] text-sprout-700">
            LMS fotografi · segitiga exposure
          </p>
          <h1
            id="judul-beranda"
            className="mt-4 max-w-2xl text-4xl font-bold leading-[44px] sm:text-5xl sm:leading-[56px]"
          >
            Pahami exposure dengan memotret, bukan menghafal
          </h1>
          <p className="mt-5 max-w-xl text-base leading-[26px] text-tinta-500">
            Pelajari aperture, shutter speed, dan ISO lewat materi singkat, praktikkan di kamera virtual, lalu minta
            saran setelan untuk foto milikmu sendiri.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/simulator"
              className={`${btnBase} bg-sprout-300 text-tinta-900 hover:bg-sprout-400 active:bg-sprout-500`}
            >
              Coba simulator
            </Link>
            <Link href="/daftar" className={`${btnBase} border border-tinta-200 bg-white text-tinta-900 hover:bg-tinta-50`}>
              Buat akun
            </Link>
          </div>
          <p className="mt-4 text-xs font-medium text-tinta-500">
            Simulator dan analisis foto bisa dipakai tanpa akun.{" "}
            <Link href="/masuk" className="font-semibold text-sprout-700 hover:underline">
              Sudah punya akun? Masuk
            </Link>
          </p>
        </div>
        <div className="lg:col-span-5">
          <HeroIllustration />
        </div>
      </section>

      {/* Angka singkat */}
      <section aria-label="Sekilas Akademi Kamera" className={container}>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-tinta-100 bg-tinta-100 lg:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-white px-6 py-6 text-center">
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="block text-[28px] font-bold leading-8 tabular">{value}</span>
                <span className="mt-1 block text-sm font-medium text-tinta-500">{label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Mengapa Akademi Kamera */}
      <section aria-labelledby="judul-mengapa" className={`${container} py-16 sm:py-24`}>
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-sprout-700">Mengapa Akademi Kamera</p>
        <h2 id="judul-mengapa" className="mt-2 max-w-2xl text-2xl font-bold leading-8 sm:text-[32px] sm:leading-10">
          Dirancang agar kamu paham alasannya, bukan hanya angkanya
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {WHY.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-5 rounded-3xl border border-tinta-100 bg-white p-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sprout-100 text-sprout-800">
                <Icon size={24} />
              </span>
              <div>
                <h3 className="text-xl font-semibold leading-7">{title}</h3>
                <p className="mt-2 text-sm leading-[22px] text-tinta-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Fitur unggulan */}
      <section aria-labelledby="judul-fitur" className="bg-sprout-50 py-16 sm:py-24">
        <div className={container}>
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-sprout-700">Fitur unggulan</p>
          <h2 id="judul-fitur" className="mt-2 max-w-2xl text-2xl font-bold leading-8 sm:text-[32px] sm:leading-10">
            Tiga alat yang saling terhubung
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-[26px] text-tinta-500">
            Dari materi bisa langsung ke latihan simulator, dari hasil analisis bisa langsung mencoba setelannya.
          </p>
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, text, points, href, link }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-3xl border border-tinta-100 bg-white p-6 shadow-e1 transition duration-200 hover:-translate-y-0.5 hover:border-sprout-200 hover:shadow-e2"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-sprout-100 text-sprout-800">
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold leading-7">{title}</h3>
                  <p className="mt-2 text-sm leading-[22px] text-tinta-500">{text}</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm font-medium text-tinta-600">
                    {points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-sprout-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sprout-700 group-hover:underline">
                    {link}
                    <ArrowRightIcon size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="judul-faq" className={`${container} grid gap-10 py-16 sm:py-24 lg:grid-cols-12`}>
        <div className="lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-sprout-700">FAQ</p>
          <h2 id="judul-faq" className="mt-2 text-2xl font-bold leading-8 sm:text-[32px] sm:leading-10">
            Pertanyaan yang sering muncul
          </h2>
          <p className="mt-3 text-base leading-[26px] text-tinta-500">
            Belum menemukan jawabannya? Coba simulatornya langsung, tanpa perlu akun.
          </p>
        </div>
        <div className="lg:col-span-8">
          <FaqList items={FAQ} />
        </div>
      </section>

      {/* CTA penutup */}
      <section aria-labelledby="judul-ajakan" className={`${container} pb-16 sm:pb-24`}>
        <ClosingCta />
      </section>

      {/* Footer */}
      <footer className="border-t border-tinta-100 bg-white">
        <div className={`${container} grid gap-10 py-12 md:grid-cols-12`}>
          <div className="md:col-span-5">
            <p className="flex items-center gap-3 text-base font-semibold">
              <span className="grid size-9 place-items-center rounded-xl bg-tinta-900 text-sprout-300">
                <ApertureIcon size={20} />
              </span>
              Akademi Kamera
            </p>
            <p className="mt-4 max-w-sm text-sm leading-[22px] text-tinta-500">
              LMS fotografi untuk mempelajari segitiga exposure: aperture, shutter speed, dan ISO.
            </p>
          </div>
          <nav aria-label="Produk" className="md:col-span-3 md:col-start-7">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">Produk</p>
            <ul className="mt-4 space-y-3 text-sm font-semibold">
              <li><Link href="/kursus" className="hover:text-sprout-700 hover:underline">Kursus</Link></li>
              <li><Link href="/simulator" className="hover:text-sprout-700 hover:underline">Simulator kamera</Link></li>
              <li><Link href="/analisis" className="hover:text-sprout-700 hover:underline">Analisis foto</Link></li>
            </ul>
          </nav>
          <nav aria-label="Akun" className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-tinta-500">Akun</p>
            <ul className="mt-4 space-y-3 text-sm font-semibold">
              <li><Link href="/masuk" className="hover:text-sprout-700 hover:underline">Masuk</Link></li>
              <li><Link href="/daftar" className="hover:text-sprout-700 hover:underline">Daftar</Link></li>
              <li><Link href="/dasbor" className="hover:text-sprout-700 hover:underline">Dasbor</Link></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-tinta-100">
          <div className={`${container} flex flex-col gap-2 py-6 text-xs font-medium text-tinta-500 sm:flex-row sm:justify-between`}>
            <p>Tugas akhir S1 Sistem Informasi, UPN &quot;Veteran&quot; Jakarta</p>
            <p>Foto yang kamu analisis diproses di browser dan tidak dikirim ke server.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

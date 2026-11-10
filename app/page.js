// app/page.js — landing page
import Link from "next/link";

const SETTINGS = [
  {
    value: "f/2.8",
    name: "Aperture",
    text: "Lebar bukaan lensa. Bukaan lebar memasukkan lebih banyak cahaya dan mempersempit ruang tajam.",
  },
  {
    value: "1/250",
    name: "Shutter speed",
    text: "Lama sensor terkena cahaya. Cepat membekukan gerakan, lambat merekam jejaknya.",
  },
  {
    value: "ISO 400",
    name: "ISO",
    text: "Penguatan sinyal sensor. Tiap kali dinaikkan dua kali lipat, foto satu stop lebih terang dan noise bertambah.",
  },
];

export default function Home() {
  return (
    <>
      <section className="py-16 sm:py-24">
        <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.05] sm:text-6xl">
          Pahami cahaya sebelum menekan tombol rana.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Akademi Kamera mengajarkan segitiga exposure lewat kamera virtual yang bisa kamu putar-putar sendiri, lalu
          menilai foto aslimu berdasarkan data EXIF-nya.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/simulator" className="rounded-full bg-amber px-6 py-3 font-display text-lg font-semibold text-surround">
            Buka simulator
          </Link>
          <Link href="/analisis" className="rounded-full border border-rule px-6 py-3 font-display text-lg font-semibold">
            Analisis fotoku
          </Link>
        </div>
      </section>

      <section aria-labelledby="kursus" className="border-t border-rule py-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 id="kursus" className="font-display text-3xl font-semibold">
              Belajar dengan alur yang jelas
            </h2>
            <p className="mt-3 text-muted">
              Kursus singkat berisi materi, latihan simulator yang terhubung, dan kuis. Daftar sekali, lalu progres
              materi dan nilaimu tersimpan di dasbor.
            </p>
          </div>
          <Link href="/kursus" className="rounded-full bg-amber px-6 py-3 font-display text-lg font-semibold text-surround">
            Jelajahi kursus
          </Link>
        </div>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          <li>
            <h3 className="font-display text-lg font-semibold">Materi bertahap</h3>
            <p className="mt-1 text-sm text-muted">Dari exposure dan aperture sampai aturan praktis di lapangan.</p>
          </li>
          <li>
            <h3 className="font-display text-lg font-semibold">Latihan terhubung</h3>
            <p className="mt-1 text-sm text-muted">Setiap materi dapat membuka latihan simulator yang relevan.</p>
          </li>
          <li>
            <h3 className="font-display text-lg font-semibold">Kuis dan progres</h3>
            <p className="mt-1 text-sm text-muted">Nilai kuis dan materi selesai tercatat di dasbor siswa.</p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="segitiga" className="border-t border-rule py-12">
        <h2 id="segitiga" className="font-display text-3xl font-semibold">
          Tiga pengaturan, satu exposure
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {SETTINGS.map((s) => (
            <div key={s.name}>
              <p className="font-display text-5xl font-semibold tabular text-amber">{s.value}</p>
              <h3 className="mt-3 font-display text-xl font-semibold">{s.name}</h3>
              <p className="mt-1 max-w-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-muted">
          Ketiganya saling menukar: f/8 pada 1/250 menghasilkan kecerahan yang sama dengan f/5.6 pada 1/500. Rumusnya
          EV = log₂(N²/t). Yang berubah hanya karakter fotonya, yaitu ruang tajam, gerakan, dan noise.
        </p>
      </section>
    </>
  );
}

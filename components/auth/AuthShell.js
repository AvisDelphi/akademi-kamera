// components/auth/AuthShell.js — kerangka halaman Masuk/Daftar (UIUX_GUIDELINE §14.2):
// kiri panel Ink dengan satu kalimat manfaat, kanan form 440px. Mobile: form saja.
import { ApertureIcon, CameraIcon, ChartIcon, PhotoSearchIcon } from "@/components/icons";

const PERKS = [
  { Icon: CameraIcon, text: "Latihan simulator tersimpan di akunmu" },
  { Icon: ChartIcon, text: "Progres materi dan nilai kuis terpantau di dasbor" },
  { Icon: PhotoSearchIcon, text: "Riwayat analisis foto ikut tersimpan" },
];

export default function AuthShell({ title, description, children }) {
  return (
    <div className="grid overflow-hidden rounded-3xl border border-tinta-100 bg-white my-8 lg:my-12 lg:grid-cols-2">
      <aside
        data-surface="dark"
        className="relative hidden flex-col justify-between bg-tinta-900 p-10 text-white lg:flex"
      >
        <span className="grid size-12 place-items-center rounded-xl bg-tinta-800 text-sprout-300">
          <ApertureIcon size={28} />
        </span>
        <div>
          <h2 className="max-w-sm text-2xl font-bold leading-8">
            Belajar exposure paling cepat dengan mencoba langsung.
          </h2>
          <ul className="mt-8 space-y-4">
            {PERKS.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-tinta-300">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-tinta-800 text-sprout-300">
                  <Icon size={20} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs font-medium text-tinta-300">Akademi Kamera · LMS fotografi</p>
      </aside>

      <section className="flex justify-center px-6 py-10 sm:px-10 lg:py-14">
        <div className="w-full max-w-[440px]">
          <h1 className="text-[32px] font-bold leading-10">{title}</h1>
          <p className="mt-2 text-sm leading-[22px] text-tinta-500">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </div>
  );
}

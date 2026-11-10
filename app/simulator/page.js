// app/simulator/page.js
import { Suspense } from "react";
import CameraSimulator from "@/components/simulator/CameraSimulator";

export const metadata = { title: "Simulator kamera | Akademi Kamera" };

export default function SimulatorPage() {
  return (
    <>
      <div className="py-8">
        <h1 className="font-display text-4xl font-semibold">Simulator kamera</h1>
        <p className="mt-2 max-w-prose text-muted">
          Atur aperture, shutter speed, dan ISO dalam mode manual. Perhatikan bagaimana latar, mobil, noise, dan kecerahan
          berubah, lalu uji pemahamanmu lewat latihan terpandu.
        </p>
      </div>
      <Suspense fallback={<p className="py-8 text-muted">Memuat simulator…</p>}>
        <CameraSimulator />
      </Suspense>
    </>
  );
}

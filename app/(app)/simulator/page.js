// app/simulator/page.js
import { Suspense } from "react";
import CameraSimulator from "@/components/simulator/CameraSimulator";
import { Loading, PageHeader } from "@/components/lms/ui";

export const metadata = { title: "Simulator kamera | Akademi Kamera" };

export default function SimulatorPage() {
  return (
    <>
      <PageHeader
        title="Simulator kamera"
        description="Atur aperture, shutter speed, dan ISO dalam mode manual. Perhatikan bagaimana latar, mobil, noise, dan kecerahan berubah, lalu uji pemahamanmu lewat latihan terpandu."
      />
      <Suspense fallback={<Loading label="Memuat simulator…" />}>
        <CameraSimulator />
      </Suspense>
    </>
  );
}

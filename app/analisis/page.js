// app/analisis/page.js
import PhotoAnalyzer from "@/components/analyzer/PhotoAnalyzer";
import { PageHeader } from "@/components/lms/ui";

export const metadata = { title: "Analisis foto | Akademi Kamera" };

export default function AnalisisPage() {
  return (
    <>
      <PageHeader
        title="Analisis foto"
        description="Unggah fotomu sendiri. Sistem membaca setelan kamera dari EXIF, mengukur histogram dan ketajaman, lalu memberi saran untuk menyeimbangkan aperture, shutter speed, dan ISO."
      />
      <PhotoAnalyzer />
    </>
  );
}

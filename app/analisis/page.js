// app/analisis/page.js
import PhotoAnalyzer from "@/components/analyzer/PhotoAnalyzer";

export const metadata = { title: "Analisis foto | Akademi Kamera" };

export default function AnalisisPage() {
  return (
    <>
      <div className="py-8">
        <h1 className="font-display text-4xl font-semibold">Analisis foto</h1>
        <p className="mt-2 max-w-prose text-muted">
          Unggah fotomu sendiri. Sistem membaca setelan kamera dari EXIF, mengukur histogram dan ketajaman, lalu memberi
          saran untuk menyeimbangkan aperture, shutter speed, dan ISO.
        </p>
      </div>
      <PhotoAnalyzer />
    </>
  );
}

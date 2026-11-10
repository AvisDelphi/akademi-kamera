// app/kursus/page.js
import CourseCatalog from "@/components/lms/CourseCatalog";

export const metadata = { title: "Kursus | Akademi Kamera" };

export default function KursusPage() {
  return (
    <div className="py-8">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl font-semibold">Kursus</h1>
        <p className="mt-2 text-muted">
          Materi singkat tentang segitiga exposure, latihan simulator yang terhubung, dan kuis untuk menguji pemahaman.
          Daftar kursus agar progresmu tersimpan.
        </p>
      </header>
      <div className="mt-8">
        <CourseCatalog />
      </div>
    </div>
  );
}

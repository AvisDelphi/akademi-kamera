// app/kursus/page.js
import CourseCatalog from "@/components/lms/CourseCatalog";
import { PageHeader } from "@/components/lms/ui";

export const metadata = { title: "Kursus | Akademi Kamera" };

export default function KursusPage() {
  return (
    <>
      <PageHeader
        title="Kursus"
        description="Materi singkat tentang segitiga exposure, latihan simulator yang terhubung, dan kuis untuk menguji pemahaman. Daftar kursus agar progresmu tersimpan."
      />
      <CourseCatalog />
    </>
  );
}

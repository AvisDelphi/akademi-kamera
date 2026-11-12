// app/(staff)/instruktur/siswa/page.js — siswa dan nilai per kursus
import StudentTable from "@/components/instructor/StudentTable";

export const metadata = { title: "Siswa & nilai | Area Instruktur | Akademi Kamera" };

export default function SiswaPage() {
  return <StudentTable />;
}

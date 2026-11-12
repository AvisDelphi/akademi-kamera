// app/(staff)/instruktur/kursus/page.js — daftar kursus milik instruktur
import { Suspense } from "react";
import CourseList from "@/components/instructor/CourseList";
import { Loading } from "@/components/lms/ui";

export const metadata = { title: "Kursus saya | Area Instruktur | Akademi Kamera" };

export default function KursusSayaPage() {
  return (
    <Suspense fallback={<Loading label="Memuat kursus…" />}>
      <CourseList />
    </Suspense>
  );
}

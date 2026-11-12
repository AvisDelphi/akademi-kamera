// app/(staff)/instruktur/kursus/[courseId]/page.js — editor kursus
import CourseEditor from "@/components/instructor/CourseEditor";

export const metadata = { title: "Editor kursus | Area Instruktur | Akademi Kamera" };

export default async function EditorKursusPage({ params }) {
  const { courseId } = await params;
  return <CourseEditor courseId={courseId} />;
}

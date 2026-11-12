// app/(staff)/instruktur/kursus/[courseId]/materi/[lessonId]/page.js — editor materi dan kuis
import LessonEditor from "@/components/instructor/LessonEditor";

export const metadata = { title: "Editor materi | Area Instruktur | Akademi Kamera" };

export default async function EditorMateriPage({ params }) {
  const { courseId, lessonId } = await params;
  return <LessonEditor courseId={courseId} lessonId={lessonId} />;
}

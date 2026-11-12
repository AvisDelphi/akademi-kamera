// app/kursus/[courseId]/lesson/[lessonId]/page.js
import LessonView from "@/components/lms/LessonView";

export const metadata = { title: "Materi | Akademi Kamera" };

export default async function LessonPage({ params }) {
  const { courseId, lessonId } = await params;
  return <LessonView courseId={courseId} lessonId={lessonId} />;
}

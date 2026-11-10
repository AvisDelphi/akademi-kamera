// app/kursus/[courseId]/page.js
import CourseDetail from "@/components/lms/CourseDetail";

export const metadata = { title: "Detail kursus | Akademi Kamera" };

export default async function CoursePage({ params }) {
  const { courseId } = await params;
  return <CourseDetail courseId={courseId} />;
}

// app/kursus/[courseId]/kuis/[quizId]/page.js
import QuizRunner from "@/components/lms/QuizRunner";

export const metadata = { title: "Kuis | Akademi Kamera" };

export default async function QuizPage({ params }) {
  const { courseId, quizId } = await params;
  return <QuizRunner courseId={courseId} quizId={quizId} />;
}

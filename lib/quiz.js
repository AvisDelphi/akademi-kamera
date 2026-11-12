// lib/quiz.js
// Reference implementation of quiz grading, kept free of React and Supabase so it can be unit-tested.
// The real grading runs in the database (public.submit_quiz_attempt, see supabase/schema.sql), because
// students must not be able to read the answer key; the two implementations follow the same rules:
// an answer is correct when the chosen option belongs to the question and is marked correct, the score
// is round(100 * correct / total), and a quiz with no questions scores 0.
// `questions`: each has an options array of { id, is_correct }. `answers` maps question id to option id.

export function gradeQuiz(questions, answers = {}) {
  const perQuestion = questions.map((question) => {
    const correctOption = (question.options ?? []).find((option) => option.is_correct) ?? null;
    const chosen = answers[question.id] ?? null;
    const chosenOption =
      chosen === null ? null : (question.options ?? []).find((option) => String(option.id) === String(chosen));
    const isCorrect = Boolean(chosenOption?.is_correct);
    return {
      questionId: question.id,
      chosenOptionId: chosen === null ? null : Number(chosen),
      correctOptionId: correctOption ? correctOption.id : null,
      isCorrect,
    };
  });

  const total = questions.length;
  const correct = perQuestion.filter((row) => row.isCorrect).length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { score, correct, total, perQuestion };
}

/** A quiz passes when the score reaches its pass_score (default 70). */
export function isQuizPassed(score, passScore = 70) {
  return score >= passScore;
}

/** Convert { [questionId]: optionId } to a JSON-safe object with string keys. */
export function serializeAnswers(answers) {
  return Object.fromEntries(Object.entries(answers).map(([questionId, optionId]) => [String(questionId), Number(optionId)]));
}

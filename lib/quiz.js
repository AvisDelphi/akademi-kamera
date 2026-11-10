// lib/quiz.js
// Pure quiz grading. Kept free of React and Supabase so it can be unit-tested.
// `questions` is the shape returned by lib/lms.js: each question has an options
// array whose entries include { id, is_correct }.
// `answers` maps question id (string or number) to the chosen option id.

export function gradeQuiz(questions, answers = {}) {
  const perQuestion = questions.map((question) => {
    const correctOption = (question.options ?? []).find((option) => option.is_correct) ?? null;
    const chosen = answers[question.id] ?? null;
    const isCorrect = Boolean(
      correctOption && chosen !== null && String(chosen) === String(correctOption.id),
    );
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

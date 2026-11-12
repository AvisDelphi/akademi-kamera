// tests/quiz.test.js — LMS quiz grading (pure function, no Supabase needed).
import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeQuiz, isQuizPassed, serializeAnswers } from "../lib/quiz.js";

const questions = [
  { id: 10, options: [{ id: 1, is_correct: false }, { id: 2, is_correct: true }] },
  { id: 11, options: [{ id: 3, is_correct: true }, { id: 4, is_correct: false }] },
];

test("All answers correct → score 100", () => {
  const result = gradeQuiz(questions, { 10: 2, 11: 3 });
  assert.equal(result.score, 100);
  assert.equal(result.correct, 2);
  assert.equal(result.total, 2);
});

test("One of two correct → score 50 and does not pass", () => {
  const result = gradeQuiz(questions, { 10: 2, 11: 4 });
  assert.equal(result.score, 50);
  assert.equal(result.correct, 1);
  assert.equal(isQuizPassed(result.score, 70), false);
});

test("Unanswered and unknown options count as wrong", () => {
  const result = gradeQuiz(questions, { 10: 999 });
  assert.equal(result.score, 0);
  assert.deepEqual(
    result.perQuestion.map((row) => row.isCorrect),
    [false, false],
  );
});

test("Pass threshold is inclusive", () => {
  assert.equal(isQuizPassed(70, 70), true);
  assert.equal(isQuizPassed(69, 70), false);
});

test("serializeAnswers produces string keys and numeric values", () => {
  assert.deepEqual(serializeAnswers({ 10: "2" }), { "10": 2 });
});

test("An option of another question never counts, even if it is the correct one there", () => {
  const result = gradeQuiz(questions, { 10: 3, 11: 2 });
  assert.equal(result.score, 0);
});

test("With several correct options, choosing any of them is correct (same rule as the SQL function)", () => {
  const multi = [{ id: 20, options: [{ id: 5, is_correct: true }, { id: 6, is_correct: true }, { id: 7, is_correct: false }] }];
  assert.equal(gradeQuiz(multi, { 20: 6 }).score, 100);
  assert.equal(gradeQuiz(multi, { 20: 7 }).score, 0);
});

test("Score rounds half up like round(100 * correct / total) in the database", () => {
  const three = [1, 2, 3].map((id) => ({ id, options: [{ id: id * 10, is_correct: true }] }));
  assert.equal(gradeQuiz(three, { 1: 10 }).score, 33);
  assert.equal(gradeQuiz(three, { 1: 10, 2: 20 }).score, 67);
  const eight = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, options: [{ id: (i + 1) * 10, is_correct: true }] }));
  assert.equal(gradeQuiz(eight, { 1: 10 }).score, 13); // 12.5 rounds up
});

test("A quiz without questions scores 0", () => {
  assert.equal(gradeQuiz([], {}).score, 0);
});

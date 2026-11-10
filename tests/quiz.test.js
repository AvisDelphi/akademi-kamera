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

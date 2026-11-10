// tests/exposure.test.js — run with `npm test` (Node built-in test runner).
// These are white-box tests of the formulas; cite them in BAB IV as unit testing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { exposureValue, exposureOffset, ev100FromSettings, computeMetrics, correctShutterFor, formatShutter } from "../lib/exposure.js";
import { getScene } from "../lib/scenes.js";
import { EXERCISES, evaluateExercise } from "../lib/exercises.js";

const near = (a, b, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

test("EV = log2(N²/t): f/1, 1 s is EV 0", () => near(exposureValue(1, 1), 0));
test("EV: f/16 at 1/125 ≈ EV 15 (sunny 16)", () => near(exposureValue(16, 1 / 125), 15, 0.05));
test("Reciprocity: f/8 1/250 equals f/5.6 1/500 (within nominal rounding)", () =>
  near(exposureValue(8, 1 / 250), exposureValue(5.6, 1 / 500), 0.06));
test("Doubling ISO adds one stop of exposure", () => {
  const a = exposureOffset({ aperture: 8, shutter: 1 / 250, iso: 100 }, 15);
  const b = exposureOffset({ aperture: 8, shutter: 1 / 250, iso: 200 }, 15);
  near(b - a, 1, 1e-9);
});
test("EV100 from settings: f/2.8 1/60 ISO 1600 ≈ EV 5", () => near(ev100FromSettings(2.8, 1 / 60, 1600), 4.9, 0.1));
test("Correct shutter for sunny 16 at ISO 100 is 1/125", () =>
  assert.equal(formatShutter(correctShutterFor(16, 100, 15)), "1/125"));

test("Every exercise has at least one passing combination", () => {
  const solutions = {
    "bekukan-mobil": { aperture: 5.6, shutter: 1 / 1000, iso: 100, focalMm: 50, onTripod: false },
    "latar-blur": { aperture: 2.8, shutter: 1 / 500, iso: 100, focalMm: 85, onTripod: false },
    "jejak-gerak": { aperture: 5.6, shutter: 1 / 15, iso: 100, focalMm: 50, onTripod: true },
    "malam-handheld": { aperture: 1.8, shutter: 1 / 40, iso: 400, focalMm: 50, onTripod: false },
    "sunny-16": { aperture: 16, shutter: 1 / 125, iso: 100, focalMm: 50, onTripod: false },
  };
  for (const ex of EXERCISES) {
    const s = solutions[ex.id];
    const result = evaluateExercise(ex, s, computeMetrics(s, getScene(ex.scene)));
    assert.ok(result.passed, `${ex.id}: ${JSON.stringify(result.criteria)}`);
  }
});

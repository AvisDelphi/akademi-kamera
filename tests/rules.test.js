// tests/rules.test.js — knowledge-base tests (one case per important rule).
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateRules } from "../lib/rules.js";

const base = {
  aperture: null, shutter: null, iso: null, focalMm: null, focal35: null, isPhone: false,
  flashFired: null, whiteBalance: null, exposureBias: null,
  meanLuma: null, clipHighPct: null, clipLowPct: null, sharpness: null, redBlueRatio: null,
};
const fired = (facts) => evaluateRules({ ...base, ...facts }).trace.filter((t) => t.status === "fired").map((t) => t.id);

test("R01: 1/30 at 85 mm → shake warning, suggests 1/100 and higher ISO", () => {
  const { suggestions } = evaluateRules({ ...base, aperture: 2.8, shutter: 1 / 30, iso: 200, focal35: 85, focalMm: 85 });
  const r01 = suggestions.find((s) => s.id === "R01");
  assert.ok(r01);
  assert.deepEqual(r01.changes.map((c) => c.to), ["1/100", "640"]);
});
test("R01 does not fire at 1/125 on 85 mm", () =>
  assert.ok(!fired({ aperture: 2.8, shutter: 1 / 125, iso: 200, focal35: 85 }).includes("R01")));
test("No EXIF: setting rules are skipped, pixel rules still run", () => {
  const { trace } = evaluateRules({ ...base, meanLuma: 0.1, clipHighPct: 0, clipLowPct: 20, sharpness: 300, redBlueRatio: 1 });
  assert.equal(trace.find((t) => t.id === "R01").status, "skipped");
  assert.equal(trace.find((t) => t.id === "R02").status, "fired");
});
test("R05: ISO 3200 at 1/4000 on 24 mm suggests lowering ISO", () =>
  assert.ok(fired({ aperture: 4, shutter: 1 / 4000, iso: 3200, focal35: 24 }).includes("R05")));
test("Phone: aperture rules (R07, R09) never fire", () => {
  const ids = fired({ aperture: 16, shutter: 1 / 250, iso: 100, focal35: 77, focalMm: 9, isPhone: true });
  assert.ok(!ids.includes("R07") && !ids.includes("R09"));
});
test("Balanced exposure yields the R14 'ok' message", () => {
  const { suggestions } = evaluateRules({ ...base, aperture: 8, shutter: 1 / 250, iso: 100, focal35: 50, meanLuma: 0.45, clipHighPct: 0.5, clipLowPct: 1, sharpness: 400, redBlueRatio: 1 });
  assert.equal(suggestions[0].id, "R14");
});

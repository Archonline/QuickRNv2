import test from "node:test";
import assert from "node:assert/strict";
import { buildPassProbabilitySeries } from "../src/passProbability.js";

const attempt = (mode, scorePercent, completedAtMs, questionCount = 85) => ({
  mode, scorePercent, completedAtMs, questionCount
});

test("probability trend includes CAT and readiness completions only", () => {
  const points = buildPassProbabilitySeries([
    attempt("self-study", 100, 1000),
    attempt("cat", 78, 3000),
    attempt("readiness", 84, 2000),
    attempt("readiness", 95, 4000, 0),
    attempt("cat", 70, 0)
  ]);
  assert.equal(points.length, 2);
  assert.deepEqual(points.map(point => point.mode), ["readiness", "cat"]);
  assert.deepEqual(points.map(point => point.attempt), [1, 2]);
});

test("higher sustained assessment scores improve the estimated trend", () => {
  const points = buildPassProbabilitySeries([
    attempt("readiness", 55, 1000),
    attempt("cat", 62, 2000),
    attempt("readiness", 82, 3000),
    attempt("cat", 90, 4000)
  ]);
  assert.ok(points.every(point => point.probability >= 5 && point.probability <= 95));
  assert.ok(points[3].probability > points[0].probability);
});

test("low-confidence first attempts are moderated toward the neutral prior", () => {
  const first = buildPassProbabilitySeries([attempt("cat", 100, 1000)])[0];
  const repeated = buildPassProbabilitySeries([
    attempt("cat", 100, 1000),
    attempt("readiness", 100, 2000),
    attempt("cat", 100, 3000),
    attempt("readiness", 100, 4000)
  ]);
  assert.ok(first.probability < repeated[3].probability);
  assert.ok(first.probability < 95);
});

test("empty and invalid assessment history produces no graph points", () => {
  assert.deepEqual(buildPassProbabilitySeries([]), []);
  assert.deepEqual(buildPassProbabilitySeries([
    attempt("cat", Number.NaN, 1000),
    attempt("readiness", 90, 2000, -1),
    attempt("readiness", 90, Number.NaN)
  ]), []);
});

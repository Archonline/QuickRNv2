import test from "node:test";
import assert from "node:assert/strict";
import { estimateCatAbility } from "../src/examScoring.js";

test("CAT ability estimate increases with earned response credit", () => {
  const difficulty = Array.from({ length: 20 }, () => ({ difficulty: "Intermediate" }));
  const low = estimateCatAbility(difficulty.map(item => ({ ...item, earned: 0 })));
  const high = estimateCatAbility(difficulty.map(item => ({ ...item, earned: 1 })));
  assert.ok(Number.isFinite(low));
  assert.ok(Number.isFinite(high));
  assert.ok(high > low);
});

test("CAT ability estimate accounts for provisional item difficulty", () => {
  const foundational = estimateCatAbility(Array.from({ length: 12 }, () => ({ earned: 0.8, difficulty: "Foundational" })));
  const advanced = estimateCatAbility(Array.from({ length: 12 }, () => ({ earned: 0.8, difficulty: "Advanced" })));
  assert.ok(advanced > foundational);
});

test("CAT ability estimate accepts partial credit and empty sessions", () => {
  assert.equal(estimateCatAbility([]), 0);
  const partial = estimateCatAbility([{ earned: 0.5, difficulty: "Intermediate" }]);
  assert.ok(Number.isFinite(partial));
});

import { evaluateReadiness, READINESS_RULES } from "../src/examScoring.js";

test("readiness requires minimum length, score, ability, and category floor", () => {
  const strong = Array.from({ length: 90 }, (_, index) => ({
    earned: 1,
    difficulty: "Advanced",
    category: index % 2 ? "Pharmacology" : "Prioritization"
  }));
  const result = evaluateReadiness(strong);
  assert.equal(result.passed, true);
  assert.equal(result.scorePercent, 100);
  assert.equal(result.weakCategories.length, 0);
});

test("readiness fails a high score when the provisional ability threshold is not met", () => {
  const responses = Array.from({ length: 90 }, (_, index) => ({
    earned: index % 5 === 0 ? 0 : 1,
    difficulty: "Advanced",
    category: "Adult Health"
  }));
  const result = evaluateReadiness(responses);
  assert.equal(result.passed, false);
  assert.ok(result.reasons.some(reason => reason.includes("ability threshold")));
});

test("readiness enforces category floor when a category has enough sampled items", () => {
  const responses = [
    ...Array.from({ length: 80 }, () => ({ earned: 1, difficulty: "Advanced", category: "Adult Health" })),
    ...Array.from({ length: 10 }, () => ({ earned: 0, difficulty: "Advanced", category: "Pharmacology" }))
  ];
  const result = evaluateReadiness(responses);
  assert.equal(result.passed, false);
  assert.deepEqual(result.weakCategories, ["Pharmacology"]);
});

test("readiness does not pass before 85 completed items", () => {
  const result = evaluateReadiness(Array.from({ length: 84 }, () => ({
    earned: 1, difficulty: "Advanced", category: "Adult Health"
  })));
  assert.equal(result.passed, false);
  assert.equal(READINESS_RULES.maximumQuestions, 150);
});

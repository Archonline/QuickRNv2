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
  const foundational = estimateCatAbility(Array.from({ length: 12 }, () => ({ earned: 1, difficulty: "Foundational" })));
  const advanced = estimateCatAbility(Array.from({ length: 12 }, () => ({ earned: 1, difficulty: "Advanced" })));
  assert.ok(advanced > foundational);
});

test("CAT ability estimate accepts partial credit and empty sessions", () => {
  assert.equal(estimateCatAbility([]), 0);
  const partial = estimateCatAbility([{ earned: 0.5, difficulty: "Intermediate" }]);
  assert.ok(Number.isFinite(partial));
});

import test from "node:test";
import assert from "node:assert/strict";
import { estimateCatMeasurement, selectNextCatQuestion, buildRemediationTargets, readinessBand } from "../src/catEngine.js";

const item = (id, difficulty, category = "A", extra = {}) => ({
  id, difficulty, category, status: "published", ...extra
});

test("CAT measurement responds monotonically to performance", () => {
  const easy = Array.from({ length: 20 }, (_, i) => ({ question: item(String(i), "Foundational"), earned: 1 }));
  const hard = Array.from({ length: 20 }, (_, i) => ({ question: item(String(i), "Advanced"), earned: 0 }));
  assert.ok(estimateCatMeasurement(easy).theta > estimateCatMeasurement(hard).theta);
});

test("CAT measurement exposes uncertainty and uses fractional item credit", () => {
  const allCorrect = Array.from({ length: 30 }, (_, i) => ({ question: item(String(i), "Intermediate", "A", { catDiscrimination: 1.8 }), earned: 1 }));
  const partial = allCorrect.map(response => ({ ...response, earned: 0.5 }));
  const strong = estimateCatMeasurement(allCorrect);
  const partialScore = estimateCatMeasurement(partial);
  assert.ok(strong.theta > partialScore.theta);
  assert.ok(strong.standardError < 1);
  assert.equal(strong.responseCount, 30);
});

test("CAT selector chooses an unused published standalone item and avoids splitting case groups", () => {
  const pool = [
    item("used", "Intermediate"),
    item("case-a", "Intermediate", "A", { caseStudyId: "case-1", clinicalScenario: "scenario" }),
    item("draft", "Intermediate", "A", { status: "development" }),
    item("candidate", "Intermediate", "B")
  ];
  const selected = selectNextCatQuestion(pool, ["used"], [], {}, 7);
  assert.equal(selected.id, "candidate");
});

test("CAT selector is deterministic for a stable seed", () => {
  const pool = Array.from({ length: 10 }, (_, i) => item(String(i), i % 2 ? "Advanced" : "Foundational", i % 2 ? "A" : "B"));
  assert.equal(selectNextCatQuestion(pool, [], [], {}, 42).id, selectNextCatQuestion(pool, [], [], {}, 42).id);
});

test("readiness bands require enough evidence and do not claim a pass probability", () => {
  assert.equal(readinessBand(95, 5, 85), "Insufficient evidence");
  assert.equal(readinessBand(60, 85, 85), "Needs focused review");
  assert.equal(readinessBand(72, 85, 85), "Developing consistency");
  assert.equal(readinessBand(86, 85, 85), "Strong practice performance");
});

test("remediation targets prioritize low-scoring categories with enough observations", () => {
  const results = [
    ...Array.from({ length: 4 }, () => ({ category: "Pharmacology", earnedPoints: 0.25 })),
    ...Array.from({ length: 4 }, () => ({ category: "Fundamentals", earnedPoints: 1 })),
    { category: "One-off", earnedPoints: 0 }
  ];
  const targets = buildRemediationTargets(results);
  assert.equal(targets.length, 1);
  assert.equal(targets[0].category, "Pharmacology");
  assert.equal(targets[0].priority, "high");
});

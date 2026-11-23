import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const planner = readFileSync(new URL("../src/StudyPlannerPage.tsx", import.meta.url), "utf8");
const plannerStyles = readFileSync(new URL("../src/dashboard-pages.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");

test("study planner is reachable from learner navigation", () => {
  assert.match(app, /"study-plan"/);
  assert.match(app, /Study planner/);
  assert.match(app, /<StudyPlannerPage user=\{user\}/);
});

test("study plan is account-scoped and supports editing and saving seven days", () => {
  assert.match(planner, /users", user\.uid, "studyPlans", "current"/);
  assert.match(planner, /DAYS = \["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"\]/);
  assert.match(planner, /setDoc\(/);
  assert.match(planner, /updateDay\(/);
  assert.match(planner, /Regenerate plan/);
});

test("planner recommendations use assessment category accuracy without touching exam rendering", () => {
  assert.match(planner, /sort\(\(a, b\) => a\.accuracy - b\.accuracy\)/);
  assert.match(planner, /Rebuild core concepts/);
  assert.match(main, /dashboard-pages\.css/);
  assert.match(main, /dashboard-pages\.css";\s*import "\.\/exam-overrides\.css"/);
  assert.doesNotMatch(plannerStyles.replace(/\/\*[\\s\\S]*?\\*\//g, ""), /\\.exam-(?:screen|layout|main|question-card|stem|controls)|\\.ngn-/);
});

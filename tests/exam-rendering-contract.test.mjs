import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read = (path) => fs.readFileSync(path, "utf8");

test("all canonical NCLEX item types have an exam interaction renderer", () => {
  const exam = read("src/ExamPage.tsx");
  const types = ["single-response","multiple-response","select-n","drop-down-cloze","drop-down-rationale","highlight-text","matrix-multiple","matrix-single","numeric-entry","ordered-response","bow-tie","drag-drop","trend","graphics-based"];
  for (const type of types) assert.ok(exam.includes(`case"${type}"`), `missing renderer dispatch for ${type}`);
});

test("dashboard stylesheet is loaded and isolated from live exam components", () => {
  const main = read("src/main.tsx");
  const dashboardCss = read("src/dashboard-pages.css").split("\n").slice(3).join("\n");
  assert.ok(main.includes('import "./dashboard-pages.css";'));
  for (const selector of [".exam-screen",".exam-header",".exam-question-card",".exam-controls",".exam-record-panel",".ngn-"]) assert.ok(!dashboardCss.includes(selector), `dashboard stylesheet contains ${selector}`);
});

test("exam uses a report modal and a single review flag action", () => {
  const exam = read("src/ExamPage.tsx");
  assert.ok(exam.includes("Report to Webmaster"));
  assert.ok(exam.includes("Submit report"));
  assert.ok(exam.includes("QUESTION {current+1} OF {exam.length}"));
  assert.doesNotMatch(exam, /exam-item-feedback|quickrn-ngn-item-feedback|Export feedback|Save for later/);
});

test("exam layout retains responsive rendering and sticky-header separation", () => {
  const css = read("src/exam-overrides.css");
  for (const selector of [".exam-screen",".exam-header",".exam-question-card",".exam-controls",".exam-record-panel",".ngn-matrix",".ngn-bowtie",".ngn-dropdown",".ngn-highlight",".ngn-graphic"]) assert.ok(css.includes(selector), `missing ${selector}`);
  assert.ok(css.includes("top:64px"));
  assert.ok(css.includes("z-index:60"));
});

test("readiness is an adaptive hard-item CAT with a stricter pass gate", () => {
  const exam = read("src/ExamPage.tsx");
  const scoring = read("src/examScoring.js");
  assert.ok(exam.includes('mode==="readiness"'));
  assert.ok(exam.includes('q.difficulty==="Advanced"'));
  assert.ok(exam.includes('q.difficulty==="Intermediate"'));
  assert.ok(exam.includes("evaluateReadiness"));
  assert.ok(scoring.includes("minimumQuestions: 85"));
  assert.ok(scoring.includes("maximumQuestions: 150"));
  assert.ok(scoring.includes("minimumScorePercent: 85"));
  assert.ok(scoring.includes("minimumAbility: 2.25"));
  assert.ok(scoring.includes("minimumCategoryPercent: 75"));
  const controls = exam.slice(exam.indexOf('<div className="exam-controls">'), exam.indexOf("</div>", exam.indexOf('<div className="exam-controls">')));
  assert.doesNotMatch(controls, /exam-prev|Previous/);
});

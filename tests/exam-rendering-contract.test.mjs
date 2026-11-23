import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("all canonical NCLEX item types have an exam interaction renderer", () => {
  const bank = read("src/ngnQuestionBank.ts");
  const exam = read("src/ExamPage.tsx");
  const canonical = bank.match(/export const NCLEX_ITEM_TYPES:[^=]*=\\s*\\[([\\s\\S]*?)\\];/)?.[1] ?? "";
  const types = [...canonical.matchAll(/"([a-z-]+)"/g)].map((match) => match[1]);
  assert.equal(types.length, 14, "expected the 14 supported canonical NCLEX item types");
  const dispatch = exam.match(/const renderInteraction=\\(\\)=>\\{switch\\(type\\)\\{([\\s\\S]*?)default:/)?.[1] ?? "";
  assert.ok(dispatch, "exam interaction dispatch must be present");
  for (const type of types) assert.ok(dispatch.includes(`case"${type}"`), `missing renderer dispatch for ${type}`);
});

test("dashboard polish remains isolated from exam and NGN rendering", () => {
  const main = read("src/main.tsx");
  const dashboardCss = read("src/dashboard-pages.css").replace(/\\/\\*[\\s\\S]*?\\*\\//g, "");
  assert.ok(main.includes('import "./dashboard-pages.css";'), "dashboard stylesheet must be loaded");
  assert.doesNotMatch(dashboardCss, /(^|[,\\s])\\.exam-(screen|header|question-card|controls|record-panel)|(^|[,\\s])\\.ngn-/m);
});

test("exam replaces inline item feedback with a report-to-webmaster modal", () => {
  const exam = read("src/ExamPage.tsx");
  assert.ok(exam.includes("Report to Webmaster"));
  assert.ok(exam.includes("Submit report"));
  assert.doesNotMatch(exam, /exam-item-feedback|quickrn-ngn-item-feedback|Export feedback/);
  assert.ok(exam.includes("QUESTION {current+1} OF {exam.length}"));
  assert.doesNotMatch(exam, /Save for later/);
});

test("exam layout retains responsive and interaction presentation hooks", () => {
  const css = read("src/exam-overrides.css");
  for (const selector of [".exam-screen", ".exam-header", ".exam-question-card", ".exam-controls", ".exam-record-panel", ".ngn-matrix", ".ngn-bowtie", ".ngn-dropdown", ".ngn-highlight", ".ngn-graphic"]) {
    assert.ok(css.includes(selector), `missing exam presentation selector ${selector}`);
  }
  assert.match(css, /@media\\s*\\(max-width:\\s*650px\\)/);
  assert.match(css, /top:64px/);
  assert.match(css, /z-index:60/);
});

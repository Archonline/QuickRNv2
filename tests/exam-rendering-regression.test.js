import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("exam renderer keeps its dedicated workspace and question structure", async () => {
  const [component, examCss] = await Promise.all([
    readFile(new URL("../src/ExamPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/exam-overrides.css", import.meta.url), "utf8"),
  ]);

  for (const className of [
    "exam-screen",
    "exam-layout",
    "exam-main",
    "exam-question-card",
    "exam-stem",
    "exam-record-panel",
    "exam-controls",
  ]) {
    assert.match(component, new RegExp(`className=[^\\n]*\\b${className}\\b`), `ExamPage must retain .${className}`);
    assert.match(examCss, new RegExp(`\\.${className}\\b`), `Exam stylesheet must define .${className}`);
  }
});

test("NGN interaction renderer retains every supported item type", async () => {
  const component = await readFile(new URL("../src/ExamPage.tsx", import.meta.url), "utf8");
  const expectedTypes = [
    "single-response",
    "multiple-response",
    "select-n",
    "drop-down-cloze",
    "drop-down-rationale",
    "highlight-text",
    "matrix-multiple",
    "matrix-single",
    "numeric-entry",
    "ordered-response",
    "bow-tie",
    "drag-drop",
    "trend",
    "graphics-based",
  ];

  for (const type of expectedTypes) {
    assert.ok(component.includes(`"${type}"`), `ExamPage must retain support for ${type}`);
  }
  assert.match(component, /renderInteraction\s*\(/, "ExamPage must keep its shared interaction renderer");
});

test("shared non-exam styles do not target active exam or NGN components", async () => {
  const files = ["../src/design-system.css", "../src/dashboard-pages.css"];
  const styles = await Promise.all(files.map(file => readFile(new URL(file, import.meta.url), "utf8")));
  const protectedPattern = /[^{}]*\\.(?:exam-(?:screen|layout|main|question-card|stem|record-panel|controls|record-tabs|record-content|inline-scenario|case|trend-left|review-[a-zA-Z0-9_-]+|modal[a-zA-Z0-9_-]*|nav[a-zA-Z0-9_-]*|header[a-zA-Z0-9_-]*|timer|session-bar|progress-track|item-[a-zA-Z0-9_-]+)|ngn-[a-zA-Z0-9_-]+)[^{}]*\\{/g;

  for (const css of styles) {
    const protectedSelectors = css.replace(/\\/\\*[\\s\\S]*?\\*\\//g, "").match(protectedPattern) ?? [];
    assert.deepEqual(protectedSelectors, [], "Keep active exam and NGN presentation rules in exam-overrides.css.");
  }
});

test("exam stylesheet remains loaded after the shared dashboard design layer", async () => {
  const entry = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
  const designIndex = entry.indexOf('import "./design-system.css";');
  const pageIndex = entry.indexOf('import "./dashboard-pages.css";');
  const examIndex = entry.indexOf('import "./exam-overrides.css";');

  assert.notEqual(designIndex, -1, "Shared design system must be imported.");
  assert.notEqual(pageIndex, -1, "Non-exam page polish must be imported.");
  assert.notEqual(examIndex, -1, "Original exam stylesheet must remain imported.");
  assert.ok(pageIndex > designIndex, "Non-exam page polish must load after the shared design layer.");
  assert.ok(examIndex > pageIndex, "Exam stylesheet must load last to preserve the exam renderer boundary.");
});

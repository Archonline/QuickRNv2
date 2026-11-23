import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("dashboard design layer does not style active NCLEX/NGN question components", async () => {
  const css = (await readFile(new URL("../src/design-system.css", import.meta.url), "utf8"))
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const protectedExamSelectors = css.match(
    /[^{}]*\.(?:exam-(?:screen|layout|question|option|stem|item|record|case|controls|options|main|nav|header)|ngn)-[a-zA-Z0-9_-]*[^{}]*\{/g
  ) ?? [];
  assert.deepEqual(
    protectedExamSelectors,
    [],
    "Keep active exam question and NGN rendering styles in exam-overrides.css, not the dashboard design layer."
  );
});

test("exam stylesheet remains loaded after the shared dashboard design layer", async () => {
  const entry = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
  const designIndex = entry.indexOf('import "./design-system.css";');
  const examIndex = entry.indexOf('import "./exam-overrides.css";');
  assert.notEqual(designIndex, -1, "Shared design system must be imported.");
  assert.notEqual(examIndex, -1, "Original exam stylesheet must remain imported.");
  assert.ok(examIndex > designIndex, "Original exam stylesheet must load after the shared design layer.");
});

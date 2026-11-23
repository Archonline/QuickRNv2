import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const activity = readFileSync(new URL("../src/studyActivity.ts", import.meta.url), "utf8");
const page = readFileSync(new URL("../src/DailyGoalsPage.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/dashboard-pages.css", import.meta.url), "utf8");

test("daily goals page is reachable and practice completions are logged once", () => {
  assert.match(app, /"daily-goals"/);
  assert.match(app, /<DailyGoalsPage user=\{user\}/);
  assert.match(app, /if\(!completed\.includes\(question\.id\)\)/);
  assert.match(app, /recordPracticeCompletion\(user,question\.id\)/);
});

test("submitted exams add answered questions to the dated activity log", () => {
  assert.match(app, /recordExamCompletionActivity\(user,result\.answeredCount\)/);
  assert.match(activity, /examQuestionCount: increment\(answeredCount\)/);
});

test("daily activity is account-scoped, date-keyed and bounded to recent history", () => {
  assert.match(activity, /users", user\.uid, "dailyActivity"/);
  assert.match(activity, /localDateKey/);
  assert.match(activity, /limit\(90\)/);
  assert.match(activity, /arrayUnion\(questionId\)/);
});

test("streaks and daily targets use real dated activity and saved daily goal preferences", () => {
  assert.match(page, /streakLength\(activity,today\)/);
  assert.match(page, /dailyActivity/);
  assert.match(page, /dailyGoal/);
  assert.match(page, /Last 7 days/);
  assert.match(styles, /\.daily-goals-page/);
  assert.doesNotMatch(styles.replace(/\/\*[\s\S]*?\*\//g, ""), /\.exam-(?:screen|layout|main|question-card|stem|controls)|\.ngn-/);
});

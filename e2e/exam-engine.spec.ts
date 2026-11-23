import { test, expect } from "@playwright/test";

test("CAT appends and navigates to the next adaptive question", async ({ page }) => {
  await page.goto("/e2e/exam-harness.html?mode=cat");
  await page.getByRole("button", { name: /Begin examination/ }).click();
  await expect(page.locator(".exam-question-counter")).toContainText("QUESTION 1 OF 1");
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: /Next adaptive question/ }).click();
  await expect(page.locator(".exam-question-counter")).toContainText("QUESTION 2 OF 2");
});

test("navigation preserves active-session answers but refresh starts a clean session", async ({ page }) => {
  await page.goto("/e2e/exam-harness.html?mode=self-study");
  await page.getByRole("button", { name: /Begin examination/ }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /Previous/ }).click();
  await expect(page.getByRole("radio").first()).toBeChecked();
  await page.reload();
  await page.getByRole("button", { name: /Begin examination/ }).click();
  await expect(page.getByRole("radio").first()).not.toBeChecked();
});

test("manual submission records one completed result", async ({ page }) => {
  await page.goto("/e2e/exam-harness.html?mode=readiness");
  await page.getByRole("button", { name: /Begin examination/ }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: /Navigation/ }).click();
  await page.getByRole("button", { name: /End and submit/ }).click();
  await page.getByRole("button", { name: /Submit examination/ }).click();
  await expect(page.getByTestId("completion")).toContainText('"mode":"readiness"');
  await expect(page.getByTestId("completion")).toContainText('"questionCount":85');
});

test("timer expires against an absolute deadline even after a background-style clock jump", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-23T00:00:00Z") });
  await page.goto("/e2e/exam-harness.html?mode=readiness");
  await page.getByRole("button", { name: /Begin examination/ }).click();
  await page.clock.fastForward(5 * 60 * 60 * 1000);
  await expect(page.getByTestId("completion")).toContainText('"mode":"readiness"', { timeout: 10_000 });
});

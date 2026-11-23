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

test("actual published 600-item bank passes structural and keyed-scoring audit", async ({ page }) => {
  await page.goto("/e2e/bank-audit.html");
  const output = await page.locator("#bank-audit").textContent();
  expect(output).not.toContain("Auditing");
  const report = JSON.parse(output ?? "{}");
  expect(report.publishedCount, JSON.stringify(report)).toBe(600);
  expect(report.duplicateIds, JSON.stringify(report.duplicateIds)).toEqual([]);
  expect(report.orphanedCaseGroups, JSON.stringify(report.orphanedCaseGroups)).toEqual([]);
  expect(report.invalid, JSON.stringify(report.results?.filter((item: any) => !item.valid))).toBe(0);
  expect(report.scoringFailures, JSON.stringify(report.scoringFailures)).toEqual([]);
  expect(Object.keys(report.formatCounts).length).toBeGreaterThan(1);
});

test("all response formats represented in the published bank render in the shared player", async ({ page }) => {
  await page.goto("/e2e/bank-player.html");
  await page.getByRole("button", { name: /All-format NGN sampler/ }).click();
  await page.getByRole("button", { name: /Begin examination/ }).click();
  const expected = Number(await page.getByTestId("expected-format-count").textContent());
  const counter = await page.locator(".exam-question-counter").textContent();
  const total = Number(counter?.match(/OF (\d+)/)?.[1] ?? 0);
  expect(total, "The sampler should include every available type and preserve full case-study groups").toBeGreaterThanOrEqual(expected);
  for (let index = 0; index < total; index += 1) {
    await expect(page.locator(".exam-question-card")).toBeVisible();
    const previousCounter = await page.locator(".exam-question-counter").textContent();
    await expect(page.locator(".exam-stem")).not.toBeEmpty();
    await expect(page.locator(".exam-question-card input, .exam-question-card select, .exam-question-card textarea, .exam-question-card button, .exam-question-card [draggable=true]").first()).toBeVisible();
    if (index < total - 1) {
      await page.locator(".exam-controls .exam-next").click();
      await expect.poll(() => page.locator(".exam-question-counter").textContent()).not.toBe(previousCounter);
    }
  }
});

test("practice launches an unfolding case in authored screen order", async ({ page }) => {
  await page.goto("/e2e/bank-player.html?case=1");
  const expectedScreens = Number(await page.getByTestId("expected-case-screens").textContent());
  expect(expectedScreens).toBeGreaterThan(1);
  await page.getByRole("button", { name: /Begin practice/ }).click();
  await expect(page.locator(".exam-question-counter")).toContainText(`SCREEN 1 OF ${expectedScreens}`);
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.locator(".exam-question-counter")).toContainText(`SCREEN 2 OF ${expectedScreens}`);
});

test("CAT is forward-only and cannot skip an unanswered adaptive item", async ({ page }) => {
  await page.goto("/e2e/exam-harness.html?mode=cat");
  await page.getByRole("button", { name: /Begin examination/ }).click();
  await expect(page.getByRole("button", { name: /Previous/ })).toBeHidden();
  await expect(page.getByRole("button", { name: /Navigation/ })).toBeHidden();
  await page.getByRole("button", { name: /End exam/ }).click();
  await expect(page.getByRole("button", { name: /Submit examination/ })).toBeDisabled();
  await page.getByRole("button", { name: /Continue exam/ }).click();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: /Next adaptive question/ }).click();
  await expect(page.locator(".exam-question-counter")).toContainText("QUESTION 1 OF 1");
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: /Next adaptive question/ }).click();
  await expect(page.locator(".exam-question-counter")).toContainText("QUESTION 2 OF 2");
});

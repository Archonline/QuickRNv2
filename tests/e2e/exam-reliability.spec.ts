import {test,expect} from "@playwright/test";

test.beforeEach(async({page})=>{await page.goto("/tests/e2e/exam-harness.html");});

test("answers persist when navigating away and back; review flag is retained",async({page})=>{
 await page.getByRole("button",{name:/Begin examination/}).click();
 await expect(page.getByText("QUESTION 1 OF 20")).toBeVisible();
 await page.locator(".exam-options input").first().check();
 await page.getByRole("button",{name:"Flag for review"}).click();
 await page.getByRole("button",{name:/Next/}).click();
 await expect(page.getByText("QUESTION 2 OF 20")).toBeVisible();
 await page.getByRole("button",{name:/Previous/}).click();
 await expect(page.locator(".exam-options input").first()).toBeChecked();
 await expect(page.getByRole("button",{name:"Remove flag"})).toBeVisible();
 await page.getByRole("button",{name:/Navigation/}).click();
 await expect(page.getByRole("button",{name:"Flagged"})).toBeVisible();
});

test("review and submit records a single completion with answer totals",async({page})=>{
 await page.getByRole("button",{name:/Begin examination/}).click();
 await page.locator(".exam-options input").first().check();
 await page.getByRole("button",{name:/Navigation/}).click();
 await page.getByRole("button",{name:/Question 20/}).click();
 await page.getByRole("button",{name:/Review and submit/}).click();
 await page.getByRole("button",{name:/End and submit/}).click();
 await page.getByRole("button",{name:/Submit examination/}).click();
 await expect(page.getByText("Examination Review")).toBeVisible();
 await expect(page.getByTestId("completion")).toContainText('"questionCount":20');
 await expect(page.getByTestId("completion")).toContainText('"answeredCount":1');
 await expect(page.getByTestId("completion")).toContainText('"unansweredCount":19');
});

test("timed readiness exam starts at five hours and countdown advances",async({page})=>{
 await page.clock.install({time:new Date("2026-11-23T00:00:00Z")});
 await page.goto("/tests/e2e/exam-harness.html?mode=readiness");
 await page.getByRole("button",{name:/Begin examination/}).click();
 await expect(page.getByText("05:00:00")).toBeVisible();
 await page.clock.runFor(1100);
 await expect(page.getByText("04:59:59")).toBeVisible();
});

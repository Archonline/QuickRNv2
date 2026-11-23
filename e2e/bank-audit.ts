import { questionBank600 } from "../src/ngnQuestionBank";
import { validateQuestionBank } from "../src/questionValidation.js";
import { responseScore } from "../src/examScoring.js";

const report = validateQuestionBank(questionBank600.filter(question => question.status === "published"));
const scoringFailures = questionBank600.filter(question => question.status === "published").flatMap(question => {
  const type = question.itemType ?? (question.format === "multiple" ? "multiple-response" : "single-response");
  const expected = question.interaction?.correctResponse ?? [String(question.answer)];
  const tolerance = question.interaction?.numericTolerance ?? 0;
  const fullCredit = responseScore(type, expected, expected, tolerance);
  const noCredit = responseScore(type, [], expected, tolerance);
  return fullCredit === 1 && noCredit === 0 ? [] : [{ id: question.id, type, fullCredit, noCredit, expected }];
});
const output = {
  ...report,
  scoringFailures,
  publishedCount: questionBank600.filter(question => question.status === "published").length
};
document.getElementById("bank-audit")!.textContent = JSON.stringify(output);

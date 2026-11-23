import { createRoot } from "react-dom/client";
import ExamPage from "../src/ExamPage";
import { questionBank600 } from "../src/ngnQuestionBank";
import { validateQuestionBank } from "../src/questionValidation.js";

const report = validateQuestionBank(questionBank600.filter(question => question.status === "published"));
const expectedFormats = Object.keys(report.formatCounts).length;
const caseQuestion = questionBank600.find(question => question.caseStudyId || (question.format === "case-study" && question.caseStudy)) ?? null;
const caseKey = caseQuestion?.caseStudyId ?? (caseQuestion?.format === "case-study" && caseQuestion.caseStudy ? "case:" + caseQuestion.caseStudy : undefined);
const caseScreens = caseKey ? questionBank600.filter(question => (question.caseStudyId ?? (question.format === "case-study" && question.caseStudy ? "case:" + question.caseStudy : undefined)) === caseKey).length : 0;
function Harness() {
  return <>
    <span data-testid="expected-format-count">{expectedFormats}</span>
    <span data-testid="expected-case-screens">{caseScreens}</span>
    <ExamPage questions={questionBank600} practiceQuestion={new URLSearchParams(window.location.search).has("case") ? caseQuestion : null} mode="self-study" defaultQuestionCount={85} onExit={() => {}} />
  </>;
}
createRoot(document.getElementById("root")!).render(<Harness />);

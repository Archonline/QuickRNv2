import { createRoot } from "react-dom/client";
import ExamPage from "../src/ExamPage";
import { questionBank600 } from "../src/ngnQuestionBank";
import { validateQuestionBank } from "../src/questionValidation.js";

const report = validateQuestionBank(questionBank600.filter(question => question.status === "published"));
const expectedFormats = Object.keys(report.formatCounts).length;
function Harness() {
  return <>
    <span data-testid="expected-format-count">{expectedFormats}</span>
    <ExamPage questions={questionBank600} mode="self-study" defaultQuestionCount={85} onExit={() => {}} />
  </>;
}
createRoot(document.getElementById("root")!).render(<Harness />);

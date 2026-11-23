import { useState } from "react";
import { createRoot } from "react-dom/client";
import ExamPage, { type ExamCompletion } from "../src/ExamPage";
import type { Question } from "../src/questions";

const params = new URLSearchParams(window.location.search);
const mode = (params.get("mode") ?? "self-study") as "self-study" | "cat" | "readiness";
const questions: Question[] = Array.from({ length: 180 }, (_, index) => ({
  id: "e2e-question-" + index,
  category: ["Fundamentals", "Pharmacology", "Safety", "Medical-Surgical"][index % 4],
  topic: "Automated test topic " + (index % 12),
  difficulty: (["Foundational", "Intermediate", "Advanced"] as const)[index % 3],
  prompt: "Automated test question " + (index + 1),
  options: ["Option A", "Option B"],
  answer: 0,
  rationale: "Test rationale.",
  status: "published",
  itemType: "single-response",
  interaction: { instruction: "Select the best response.", choices: ["Option A", "Option B"], correctResponse: ["0"] }
}));

function Harness() {
  const [completion, setCompletion] = useState<ExamCompletion | null>(null);
  return <>
    <div data-testid="harness-mode">{mode}</div>
    <ExamPage questions={questions} mode={mode} defaultQuestionCount={20} onExit={() => {}} onComplete={setCompletion} />
    {completion && <pre data-testid="completion">{JSON.stringify(completion)}</pre>}
  </>;
}
createRoot(document.getElementById("root")!).render(<Harness />);

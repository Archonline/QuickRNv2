import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const SCRIPT = fileURLToPath(new URL("./validate-question-batches.mjs", import.meta.url));

function makeQuestion(index) {
  return {
    id: `qrn-b001-${String(index + 1).padStart(3, "0")}`,
    category: "Adult health",
    topic: `Distinct competency ${index + 1}`,
    difficulty: "Advanced",
    prompt: `A unique clinical decision prompt number ${index + 1}: which nursing action is most appropriate now?`,
    options: [
      `Initiate the first clinically relevant response for case number ${index + 1}`,
      `Reassess the patient after an unrelated routine intervention number ${index + 1}`,
      `Delay escalation until another scheduled observation number ${index + 1}`,
      `Implement a different intervention without checking the current findings number ${index + 1}`,
    ],
    answer: 0,
    rationale: "The keyed action addresses the immediate clinical risk and is supported by the findings in this specific case.",
    status: "development",
    reviewStatus: "generated",
    reviewMetadata: {
      status: "not-clinically-verified",
      references: [],
      publicationStatus: "draft",
    },
    clinicalScenario: `Case ${index + 1}: A patient with a distinct acute presentation has a changing assessment, relevant observations, and a specific timeline that determine the nursing decision. Additional case-specific details ${index + 1}.`,
    clinicalJudgmentStep: "take-action",
    interaction: {
      correctResponse: ["0"],
      optionRationales: [
        "Correct: this response addresses the immediate case-specific clinical priority.",
        "This is not the priority because the patient's current findings require a different response.",
        "This delays a time-sensitive response and does not address the current risk.",
        "This action is unsupported by the supplied assessment findings.",
      ],
    },
    authoring: {
      blueprint: {
        clientNeedsArea: "Physiological integrity",
        competency: `Distinct competency ${index + 1}`,
        cognitiveDemand: "Prioritization",
        setting: "Acute care",
        acuity: "Time-sensitive",
        keyEvidence: `The patient-specific finding ${index + 1} establishes the priority.`,
        targetedNoviceError: "Delaying the response despite deterioration.",
      },
      clinicalEvidence: [{
        organization: "Example professional source",
        title: "Clinical reference title",
        publishedOrUpdated: "2026",
        locator: "Section 1",
        claimSupported: "The cited recommendation supports the clinical decision.",
      }],
      adversarialReview: {
        disposition: "pass_for_clinical_review",
        closestCompetingOption: "Option 2; less appropriate because it does not address the immediate risk.",
        ambiguityAssessment: "The case supplies the timeline and findings needed to distinguish the best response.",
        cueingAssessment: "Options are parallel and the keyed response is not disclosed by wording or length.",
      },
    },
  };
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "quickrn-batch-gate-"));
  fs.mkdirSync(path.join(root, "src", "question-batches"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "curatedQuestionBatch100.json"), JSON.stringify({ questions: [] }));
  fs.writeFileSync(path.join(root, "src", "curatedQuestionBatch2_100.json"), JSON.stringify({ questions: [] }));
  const batch = {
    batch_metadata: {
      batch_id: "core-batch-001",
      bank: "core",
      clinical_review_status: "pending",
    },
    questions: Array.from({ length: 100 }, (_, index) => makeQuestion(index)),
  };
  const batchPath = path.join(root, "src", "question-batches", "core-batch-001.json");
  fs.writeFileSync(batchPath, JSON.stringify(batch));
  return { root, batchPath, batch };
}

test("batch intake accepts a structurally complete batch with item-level authoring evidence", () => {
  const fixture = createFixture();
  try {
    const result = spawnSync(process.execPath, [SCRIPT], { cwd: fixture.root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.match(result.stdout, /Batch gate: 0 error\(s\)/);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("batch intake rejects an item missing its clinical evidence record", () => {
  const fixture = createFixture();
  try {
    fixture.batch.questions[0].authoring.clinicalEvidence = [];
    fs.writeFileSync(fixture.batchPath, JSON.stringify(fixture.batch));
    const result = spawnSync(process.execPath, [SCRIPT], { cwd: fixture.root, encoding: "utf8" });
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /requires at least one traceable clinicalEvidence record/);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("batch intake rejects an item missing its independent adversarial challenge", () => {
  const fixture = createFixture();
  try {
    delete fixture.batch.questions[0].authoring.adversarialReview;
    fs.writeFileSync(fixture.batchPath, JSON.stringify(fixture.batch));
    const result = spawnSync(process.execPath, [SCRIPT], { cwd: fixture.root, encoding: "utf8" });
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /requires a documented adversarialReview disposition/);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

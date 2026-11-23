import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RULES_PATH = path.join(ROOT, "docs/question-bank/quickrn-validation-rules.json");
const REWRITE_BATCH_PATH = path.join(ROOT, "src/authoredCoreRewriteBatch.ts");
const QUESTION_BANK_PATH = path.join(ROOT, "src/questionBank.ts");
const NGN_BATCH_PATH = path.join(ROOT, "src/curatedQuestionBatch100.json");
const STRICT = process.env.QUESTION_BANK_AUDIT_MODE === "strict";

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
}
function loadJson(filePath) {
  const text = readText(filePath);
  if (!text) throw new Error(`Required file not found: ${path.relative(ROOT, filePath)}`);
  return JSON.parse(text);
}
function finding(findings, level, file, message) {
  findings.push({ level, file: path.relative(ROOT, file), message });
}
function auditAuthoredCoreRewriteBatch(source, rules, findings) {
  if (!source) {
    finding(findings, "error", REWRITE_BATCH_PATH, "Required authored rewrite batch is missing.");
    return;
  }
  const calls = [...source.matchAll(/\bsingle\(\s*"([^"]+)"/g)];
  const ids = calls.map((match) => match[1]);
  const expected = rules.sprint3_authoring_quality?.legacy_invariants?.authored_replacement_count ?? 20;
  if (ids.length !== expected) {
    finding(findings, "error", REWRITE_BATCH_PATH, `Expected exactly ${expected} authored replacement records; detected ${ids.length}.`);
  }
  if (new Set(ids).size !== ids.length) finding(findings, "error", REWRITE_BATCH_PATH, "Duplicate authored replacement IDs detected.");
  for (const id of ids) {
    if (!/^qrn-[a-z0-9-]+$/.test(id)) finding(findings, "error", REWRITE_BATCH_PATH, `Invalid authored question ID: ${id}`);
  }
  for (const field of ["optionRationales", "clinicalJudgmentStep", "contentVersion", "reviewStatus: \"generated\"", "not-clinically-verified"]) {
    if (!source.includes(field)) finding(findings, "error", REWRITE_BATCH_PATH, `Missing required authoring metadata: ${field}`);
  }
  const bank = readText(QUESTION_BANK_PATH);
  if (!bank?.includes("authoredCoreRewriteBatch")) finding(findings, "error", QUESTION_BANK_PATH, "Authored batch is not integrated into the runtime question bank.");
  if (!bank?.includes("questionBank500.length!==500")) finding(findings, "error", QUESTION_BANK_PATH, "Existing 500-item core bank invariant is missing.");
  if (!bank?.includes("new Set(questionBank500.map(q=>q.id)).size!==500")) finding(findings, "error", QUESTION_BANK_PATH, "Existing unique core question ID invariant is missing.");
  if (!bank?.includes("questionBank600")) finding(findings, "error", QUESTION_BANK_PATH, "Combined 600-item export is missing.");
}
function valueAt(object, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => value == null ? undefined : value[key], object);
}
function validateRawQuestion(item, rules, findings, index) {
  const config = rules.sprint3_authoring_quality ?? {};
  const label = item?.id ?? `row-${index + 1}`;
  const strict = STRICT;
  const add = (severity, message) => {
    const level = severity === "error" && !strict ? "warning" : severity;
    finding(findings, level, NGN_BATCH_PATH, `[${label}] ${message}`);
  };
  const rationale = item?.rationales?.correct;
  if (config.rationale?.required && (typeof rationale !== "string" || rationale.trim().length < (config.rationale.min_length ?? 1))) {
    add(config.rationale.severity ?? "error", `Missing or short correct rationale (minimum ${config.rationale.min_length} characters).`);
  }
  const incorrect = item?.rationales?.incorrect;
  if (config.option_rationales?.required_for_option_based_items && Array.isArray(item?.interaction?.options)) {
    const options = item.interaction.options;
    if (!Array.isArray(incorrect) || incorrect.length < options.length - 1 ||
        incorrect.some((entry) => typeof entry?.rationale !== "string" || entry.rationale.trim().length < (config.option_rationales.min_length_per_rationale ?? 1))) {
      add(config.option_rationales.severity ?? "warning", "Missing or incomplete incorrect-option rationales.");
    }
  }
  const skill = item?.clinical_judgment?.skill;
  const allowed = config.clinical_judgment?.allowed_values ?? [];
  if (skill != null && !allowed.includes(skill)) add(config.clinical_judgment.severity ?? "error", `Invalid clinical judgment skill "${skill}".`);
  if (config.clinical_judgment?.required && !skill) add(config.clinical_judgment.severity ?? "error", "Missing clinical judgment skill.");
  const requirements = config.ngn_item_requirements?.by_question_type?.[item?.question_type] ?? [];
  for (const field of requirements) {
    const value = valueAt(item?.interaction, field);
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      add(config.ngn_item_requirements.severity ?? "error", `Question type "${item.question_type}" is missing interaction field "${field}".`);
    }
  }
  if (item?.question_type === "case_study" || item?.case_study_id) {
    if (!item.case_study_id) add(config.ngn_item_requirements.severity ?? "error", "Case-study item is missing case_study_id.");
    if (!item.clinical_scenario) add(config.ngn_item_requirements.severity ?? "error", "Case-study item is missing clinical_scenario.");
    if (!item.interaction?.patient_record) add(config.ngn_item_requirements.severity ?? "error", "Case-study item is missing interaction.patient_record.");
    if (!item.interaction?.follow_up) add(config.ngn_item_requirements.severity ?? "error", "Case-study item is missing interaction.follow_up.");
  }
}
function auditNgnBatch(rules, findings) {
  let batch;
  try { batch = loadJson(NGN_BATCH_PATH); }
  catch (error) { finding(findings, "error", NGN_BATCH_PATH, error.message); return; }
  const questions = batch.questions;
  if (!Array.isArray(questions)) {
    finding(findings, "error", NGN_BATCH_PATH, "NGN batch must contain a questions array.");
    return;
  }
  if (batch.batch?.generated_count !== questions.length) finding(findings, "error", NGN_BATCH_PATH, "Batch generated_count does not match questions.length.");
  const ids = questions.map((item) => item?.id).filter(Boolean);
  if (new Set(ids).size !== ids.length) finding(findings, "error", NGN_BATCH_PATH, "Duplicate NGN question IDs detected.");
  questions.forEach((item, index) => validateRawQuestion(item, rules, findings, index));
}
function runAudit() {
  const rules = loadJson(RULES_PATH);
  const findings = [];
  auditAuthoredCoreRewriteBatch(readText(REWRITE_BATCH_PATH), rules, findings);
  auditNgnBatch(rules, findings);
  const errors = findings.filter((item) => item.level === "error");
  const warnings = findings.filter((item) => item.level === "warning");
  for (const item of warnings) console.warn(`[WARN] ${item.file}: ${item.message}`);
  for (const item of errors) console.error(`[ERROR] ${item.file}: ${item.message}`);
  console.log(`Question-bank authoring audit (${STRICT ? "strict" : "grandfathered"}): ${errors.length} error(s), ${warnings.length} warning(s).`);
  if (errors.length || (STRICT && warnings.length)) process.exitCode = 1;
}
runAudit();

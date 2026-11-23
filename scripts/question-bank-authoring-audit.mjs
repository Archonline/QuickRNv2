import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RULES_PATH = path.join(ROOT, "docs/question-bank/quickrn-validation-rules.json");
const REWRITE_BATCH_PATH = path.join(ROOT, "src/authoredCoreRewriteBatch.ts");
const QUESTION_BANK_PATH = path.join(ROOT, "src/questionBank.ts");
const NGN_BATCH_PATH = path.join(ROOT, "src/curatedQuestionBatch100.json");
const NGN_BANK_PATH = path.join(ROOT, "src/ngnQuestionBank.ts");
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
  const ngnBank = readText(NGN_BANK_PATH);
  if (!ngnBank?.includes("questionBank100.length!==100")) finding(findings, "error", NGN_BANK_PATH, "Existing 100-item NGN extension invariant is missing.");
  if (!ngnBank?.includes("new Set(questionBank600.map(q=>q.id)).size!==600")) finding(findings, "error", NGN_BANK_PATH, "Existing combined 600-item unique-ID invariant is missing.");
}
function valueAt(object, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => value == null ? undefined : value[key], object);
}
function normalizeText(value) {
  return typeof value === "string" ? value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\\s+/g, " ") : "";
}
function auditBatchDistribution(questions, rules, findings) {
  const config = rules.batch_distribution ?? {};
  const targets = config.difficulty_targets_per_100 ?? {};
  const difficultyCounts = Object.fromEntries(Object.keys(targets).map((key) => [key, 0]));
  const typeCounts = {};
  for (const item of questions) {
    if (item?.difficulty in difficultyCounts) difficultyCounts[item.difficulty] += 1;
    typeCounts[item?.question_type ?? "unknown"] = (typeCounts[item?.question_type ?? "unknown"] ?? 0) + 1;
  }
  for (const [difficulty, target] of Object.entries(targets)) {
    if (difficultyCounts[difficulty] !== target) {
      finding(findings, "warning", NGN_BATCH_PATH,
        `Difficulty distribution differs from target: ${difficulty} ${difficultyCounts[difficulty] ?? 0}/${target}.`);
    }
  }
  const minimum = config.minimum_target_per_question_format_per_100 ?? 0;
  for (const [type, count] of Object.entries(typeCounts)) {
    if (count < minimum) finding(findings, "warning", NGN_BATCH_PATH,
      `Question format ${type} has ${count} item(s), below the per-100 minimum of ${minimum}.`);
  }
  return { difficultyCounts, typeCounts };
}
function auditCaseStudyGroups(questions, findings) {
  const groups = new Map();
  const ids = new Set(questions.map((item) => item?.id).filter(Boolean));
  for (const item of questions) {
    if (!item?.case_study_id) continue;
    const group = groups.get(item.case_study_id) ?? [];
    group.push(item);
    groups.set(item.case_study_id, group);
  }
  const config = [];
  for (const [caseId, group] of groups) {
    const rawDeclared = group[0]?.interaction?.linked_question_ids;
    const declared = Array.isArray(rawDeclared) ? rawDeclared : [];
    const declaredSet = new Set(declared);
    if (declared.some((id) => !ids.has(id))) finding(findings, "error", NGN_BATCH_PATH,
      `[${caseId}] linked_question_ids references an ID outside this batch.`);
    if (group.some((item) => {
      const rawLinked = item?.interaction?.linked_question_ids;
      const linked = Array.isArray(rawLinked) ? rawLinked : [];
      return linked.length !== declared.length || linked.some((id, index) => id !== declared[index]);
    })) finding(findings, "error", NGN_BATCH_PATH,
      `[${caseId}] linked question lists are inconsistent across case stages.`);
    if (declaredSet.size !== group.length || [...declaredSet].some((id) => !group.some((item) => item.id === id))) {
      finding(findings, "warning", NGN_BATCH_PATH,
        `[${caseId}] declared linked-question count does not match the case-study records in this batch.`);
    }
    if (declared.length !== 6) finding(findings, "warning", NGN_BATCH_PATH,
      `[${caseId}] has ${declared.length} linked screen questions; the authoring rule expects exactly 6.`);
    for (const item of group) {
      const stage = item?.interaction?.stage;
      const total = item?.interaction?.total_stages;
      if (!Number.isInteger(stage) || !Number.isInteger(total) || stage < 1 || stage > total) {
        finding(findings, "error", NGN_BATCH_PATH, `[${item?.id ?? caseId}] has an invalid case-study stage number.`);
      }
    }
    config.push({ caseId, questions: group.length, linkedQuestions: declared.length });
  }
  return config;
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
  const stems = new Map();
  for (const item of questions) {
    const normalized = normalizeText(item?.stem);
    if (!normalized) continue;
    if (stems.has(normalized)) finding(findings, "error", NGN_BATCH_PATH,
      `Duplicate normalized question stem shared by ${stems.get(normalized)} and ${item.id}.`);
    else stems.set(normalized, item.id);
  }
  const distribution = auditBatchDistribution(questions, rules, findings);
  const caseGroups = auditCaseStudyGroups(questions, findings);
  questions.forEach((item, index) => validateRawQuestion(item, rules, findings, index));
  console.log("NGN batch distribution:", JSON.stringify(distribution));
  console.log("NGN case-study groups:", JSON.stringify(caseGroups));
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

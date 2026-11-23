import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RULES_PATH = path.join(ROOT, "docs/question-bank/quickrn-validation-rules.json");
const REWRITE_BATCH_PATH = path.join(ROOT, "src/authoredCoreRewriteBatch.ts");
const REWRITE_BATCH_2_PATH = path.join(ROOT, "src/authoredCoreRewriteBatch2.ts");
const REWRITE_BATCH_3_PATH = path.join(ROOT, "src/authoredCoreRewriteBatch3.ts");
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
  const expected = rules.sprint3_authoring_quality?.legacy_invariants?.authored_replacement_count ?? 40;
  if (ids.length !== expected) {
    finding(findings, "error", REWRITE_BATCH_PATH, `Expected exactly ${expected} authored replacement records; detected ${ids.length}.`);
  }
  if (new Set(ids).size !== ids.length) finding(findings, "error", REWRITE_BATCH_PATH, "Duplicate authored replacement IDs detected.");
  // The first six literal arguments are stable item metadata; compare authored prompts
  // so generic repeated stems cannot pass merely because the clinical scenarios differ.
  const promptRows = [...source.matchAll(/\bsingle\(\s*"([^"]+)"\s*,\s*"[^"]*"\s*,\s*"[^"]*"\s*,\s*"[^"]*"\s*,\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"/g)];
  const promptOwners = new Map();
  for (const match of promptRows) {
    const id = match[1];
    const prompt = normalizeText(match[3]);
    if (!prompt) {
      finding(findings, "error", REWRITE_BATCH_PATH, `[${id}] authored prompt is empty.`);
      continue;
    }
    if (promptOwners.has(prompt)) {
      finding(findings, "error", REWRITE_BATCH_PATH, `[${id}] repeats the generic prompt used by ${promptOwners.get(prompt)}; author a distinct clinical decision task.`);
    } else {
      promptOwners.set(prompt, id);
    }
  }
  if (promptRows.length !== expected) {
    finding(findings, "error", REWRITE_BATCH_PATH, `Expected to parse ${expected} authored prompt records; detected ${promptRows.length}.`);
  }
  for (const id of ids) {
    if (!/^qrn-[a-z0-9-]+$/.test(id)) finding(findings, "error", REWRITE_BATCH_PATH, `Invalid authored question ID: ${id}`);
  }
  if (!source.includes('status: "development"') || !source.includes('publicationStatus: "draft"')) {
    finding(findings, "error", REWRITE_BATCH_PATH, "Unverified authored replacement items must remain development/draft until authorized clinical approval.");
  }
  for (const field of ["optionRationales", "clinicalJudgmentStep", "contentVersion", "reviewStatus: \"generated\"", "not-clinically-verified"]) {
    if (!source.includes(field)) finding(findings, "error", REWRITE_BATCH_PATH, `Missing required authoring metadata: ${field}`);
  }
  const bank = readText(QUESTION_BANK_PATH);
  if (!bank?.includes("authoredCoreRewriteBatch") || !bank?.includes("authoredCoreRewriteBatch2") || !bank?.includes("authoredCoreRewriteBatch3")) finding(findings, "error", QUESTION_BANK_PATH, "All authored replacement batches must be integrated into the runtime question bank.");
  if (!/questionBank500\s*:\s*Question\[\]\s*=\s*all\.slice\(0,\s*500\)/.test(bank ?? "")) finding(findings, "error", QUESTION_BANK_PATH, "Existing 500-item core bank invariant is missing.");
  if (!/new Set\(questionBank500\.map\(\(question\)\s*=>\s*question\.id\)\)\.size\s*!==\s*500/.test(bank ?? "")) finding(findings, "error", QUESTION_BANK_PATH, "Existing unique core question ID invariant is missing.");
  const ngnBank = readText(NGN_BANK_PATH);
  if (!ngnBank?.includes("questionBank100.length!==100")) finding(findings, "error", NGN_BANK_PATH, "Existing 100-item NGN extension invariant is missing.");
  if (!ngnBank?.includes("new Set(questionBank600.map(q=>q.id)).size!==600")) finding(findings, "error", NGN_BANK_PATH, "Existing combined 600-item unique-ID invariant is missing.");
}
function valueAt(object, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => value == null ? undefined : value[key], object);
}
function normalizeText(value) {
  return typeof value === "string" ? value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ") : "";
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
    const actualOrder = group.map(item => item?.id);
    if (actualOrder.some((id, index) => id !== declared[index])) finding(findings, "error", NGN_BATCH_PATH,
      `[${caseId}] case records are not stored in their declared clinical timeline order.`);
    const orderedStages = group.map(item => item?.interaction?.stage);
    if (orderedStages.some((stage, index) => !Number.isInteger(stage) || (index > 0 && stage < orderedStages[index - 1]))) finding(findings, "error", NGN_BATCH_PATH,
      `[${caseId}] case stages must remain in nondecreasing timeline order and must not be randomized.`);
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
    const expectedScreens = caseId === "QRN-CASE-0003" ? 3 : 6;
    if (declared.length !== expectedScreens) finding(findings, "warning", NGN_BATCH_PATH,
      `[${caseId}] has ${declared.length} linked screen questions; this case requires ${expectedScreens}.`);
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
  const optionRows = Array.isArray(item?.interaction?.options) ? item.interaction.options : [];
  if (optionRows.length) {
    const optionIds = optionRows.map(option => String(option?.id ?? ""));
    if (optionIds.some(id => !id) || new Set(optionIds).size !== optionIds.length) {
      add("error", "Option IDs must be present and unique.");
    }
    const keyed = item?.correct_response?.selected_option
      ? [String(item.correct_response.selected_option)]
      : Array.isArray(item?.correct_response?.selected_options)
        ? item.correct_response.selected_options.map(String) : [];
    if (keyed.some(id => !optionIds.includes(id))) add("error", "Correct response references an option ID that does not exist.");
    const normalizedOptions = optionRows.map(option => normalizeText(option?.text));
    if (new Set(normalizedOptions).size !== normalizedOptions.length) add("warning", "Option text contains duplicates; distractors must be distinct.");
    if (optionRows.some(option => normalizeText(option?.text).length < 12)) add("warning", "At least one option is extremely short; manually verify it is a clinically plausible near-miss rather than an obvious throwaway.");
    const wrongIds = optionIds.filter(id => !keyed.includes(id));
    const explainedIds = Array.isArray(incorrect) ? incorrect.map(entry => String(entry?.option ?? "")) : [];
    if (wrongIds.length && (wrongIds.some(id => !explainedIds.includes(id)) || explainedIds.some(id => !wrongIds.includes(id)))) {
      add(config.option_rationales?.severity ?? "warning", "Incorrect-option rationales must map one-to-one to every distractor ID.");
    }
  }
  if (config.option_rationales?.required_for_option_based_items && Array.isArray(item?.interaction?.options)) {
    const options = item.interaction.options;
    const correctIds = item?.correct_response?.selected_option
      ? [String(item.correct_response.selected_option)]
      : Array.isArray(item?.correct_response?.selected_options)
        ? item.correct_response.selected_options.map(String) : [];
    const requiredIncorrectCount = correctIds.length
      ? options.filter(option => !correctIds.includes(String(option?.id ?? ""))).length
      : options.length - 1;
    if (!Array.isArray(incorrect) || incorrect.length < requiredIncorrectCount ||
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
  const unverifiedCount = questions.filter(item => item?.review_metadata?.status !== "clinically_verified").length;
  if (unverifiedCount) finding(findings, "warning", NGN_BATCH_PATH, `${unverifiedCount} NGN items are not clinically verified; schema and automated audit success do not make them release-ready.`);
  const caseGroups = auditCaseStudyGroups(questions, findings);
  questions.forEach((item, index) => validateRawQuestion(item, rules, findings, index));
  console.log("NGN batch distribution:", JSON.stringify(distribution));
  console.log("NGN case-study groups:", JSON.stringify(caseGroups));
}
function auditCoreGenerator(rules, findings) {
  const source = readText(QUESTION_BANK_PATH) ?? "";
  if (!source.includes("allGeneratedTopics") || !source.includes("Refusing to generate a category-level fallback question") || !source.includes("Refusing to publish a generic or incomplete generated item")) {
    finding(findings, "error", QUESTION_BANK_PATH, "Core generator must fail closed when a topic-specific clinical profile is missing or incomplete.");
  }
  if (source.includes("source.scenario ??") && source.includes("A client is receiving care for")) {
    finding(findings, "error", QUESTION_BANK_PATH, "Generic category-lens scenario fallback is still present.");
  }
  const categoryBlock = source.slice(source.indexOf("const B:B[]="), source.indexOf("const cases="));
  const topicCategories = new Map();
  for (const match of categoryBlock.matchAll(/\{category:"([^"]+)",count:\d+,topics:\[([\s\S]*?)\],scenario:/g)) {
    const category = match[1];
    for (const topicMatch of match[2].matchAll(/"([^"]+)"/g)) {
      const topic = topicMatch[1];
      const categories = topicCategories.get(topic) ?? [];
      categories.push(category);
      topicCategories.set(topic, categories);
    }
  }
  const repeatedTopics = [...topicCategories.entries()].filter(([, categories]) => categories.length > 1);
  const categoryVariants = source.slice(source.indexOf("const categoryTopicOverrides"), source.indexOf("const allGeneratedTopics"));
  const repeatedTopicsMissingVariants = repeatedTopics.filter(([topic, categories]) =>
    !categories.some((category) => categoryVariants.includes('"' + category + '::' + topic + '"'))
  );
  if (repeatedTopicsMissingVariants.length) {
    finding(findings, "warning", QUESTION_BANK_PATH,
      `Topics reused across category profiles still need distinct category-specific scenarios: ${repeatedTopicsMissingVariants.map(([topic, categories]) => `${topic} (${categories.join(" / ")})`).join("; ")}.`);
  }
  const candidateCount = [...categoryBlock.matchAll(/count:(\d+)/g)].reduce((total, match) => total + Number(match[1]), 0);
  const rewriteSource = (readText(REWRITE_BATCH_PATH) ?? "") + "\n" + (readText(REWRITE_BATCH_2_PATH) ?? "") + "\n" + (readText(REWRITE_BATCH_3_PATH) ?? "");
  const authoredCount = [...rewriteSource.matchAll(/\bsingle\(\s*"([^"]+)"/g)].length;
  const caseScreens = 36;
  const curatedTraditional = 100;
  const generatedCount = candidateCount - caseScreens - curatedTraditional - authoredCount;
  if (candidateCount !== 500 || authoredCount !== 364 || generatedCount !== 0) {
    finding(findings, "error", QUESTION_BANK_PATH, `Core inventory mismatch: candidates=${candidateCount}, unfolding=${caseScreens}, curated=${curatedTraditional}, authored=${authoredCount}, topic-profile generated=${generatedCount}. Expected 364 authored replacements and zero remaining profile-generated questions.`);
  }
  console.log("Core inventory:", JSON.stringify({ total: candidateCount, unfoldingCaseScreens: caseScreens, curatedTraditional, authoredReplacements: authoredCount, topicProfileGenerated: generatedCount }));
  if (source.includes("not-clinically-verified")) finding(findings, "warning", QUESTION_BANK_PATH, "Generated core items remain tagged not-clinically-verified; human clinical and distractor review is required before final release.");
  if (rules.publication_gate?.human_approval_required !== true || rules.publication_gate?.publish_after_automated_checks !== false) {
    finding(findings, "error", RULES_PATH, "Final release must require human clinical approval; automated checks alone cannot approve publication.");
  }
}
function runAudit() {
  const rules = loadJson(RULES_PATH);
  const findings = [];
  auditAuthoredCoreRewriteBatch((readText(REWRITE_BATCH_PATH) ?? "") + "\n" + (readText(REWRITE_BATCH_2_PATH) ?? ""), rules, findings);
  auditCoreGenerator(rules, findings);
  auditNgnBatch(rules, findings);
  const errors = findings.filter((item) => item.level === "error");
  const warnings = findings.filter((item) => item.level === "warning");
  for (const item of warnings) console.warn(`[WARN] ${item.file}: ${item.message}`);
  for (const item of errors) console.error(`[ERROR] ${item.file}: ${item.message}`);
  console.log(`Question-bank authoring audit (${STRICT ? "strict" : "grandfathered"}; automated checks only, not clinical approval): ${errors.length} error(s), ${warnings.length} warning(s).`);
  if (errors.length || (STRICT && warnings.length)) process.exitCode = 1;
}
runAudit();

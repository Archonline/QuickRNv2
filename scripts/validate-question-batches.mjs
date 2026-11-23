import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "src/question-batches");
const EXISTING_JSON = [
  path.join(ROOT, "src/curatedQuestionBatch100.json"),
  path.join(ROOT, "src/curatedQuestionBatch2_100.json"),
];
const errors = [];
const warnings = [];
const norm = value => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\\s+/g, " ");
const fail = (file, message) => errors.push(`[${path.relative(ROOT,file)}] ${message}`);
const warn = (file, message) => warnings.push(`[${path.relative(ROOT,file)}] ${message}`);
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(name => /^core-batch-\\d{3}\\.json$/.test(name)).sort() : [];
const usedIds = new Set();
const usedStems = new Map();
const scenarioInventory = [];
const STOP_WORDS = new Set("a an and are as at be been being by for from had has have he her hers him his i in into is it its of on or our she that the their them then there these they this to was were what when where which who will with would you your client patient nurse reports states noted found presents admitted history assessment".split(" "));
const tokens = value => new Set(norm(value).split(" ").filter(word => word.length > 2 && !STOP_WORDS.has(word)));
const jaccard = (left, right) => {
  const a = tokens(left), b = tokens(right);
  if (a.size < 8 || b.size < 8) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection++;
  return intersection / (a.size + b.size - intersection);
};
const flattenScenario = value => typeof value === "string" ? value : value && typeof value === "object" ? JSON.stringify(value) : "";

for (const file of EXISTING_JSON) {
  if (!fs.existsSync(file)) continue;
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const q of parsed.questions ?? []) {
    if (q.id) usedIds.add(String(q.id));
    const stem = norm(q.stem ?? q.prompt);
    if (stem) usedStems.set(stem, q.id ?? path.basename(file));
    const scenario = flattenScenario(q.clinicalScenario ?? q.clinical_scenario);
    if (scenario) scenarioInventory.push({ id: q.id ?? path.basename(file), scenario });
  }
}

let total = 0;
for (const name of files) {
  const file = path.join(DIR, name);
  let batch;
  try { batch = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { fail(file, `Invalid JSON: ${e.message}`); continue; }
  const questions = batch.questions;
  if (!Array.isArray(questions) || questions.length !== 100) {
    fail(file, `Each batch must contain exactly 100 questions; found ${questions?.length ?? 0}.`);
    continue;
  }
  if (batch.batch_metadata?.batch_id !== name.replace(".json","")) fail(file, "batch_metadata.batch_id must match the filename.");
  if (batch.batch_metadata?.bank !== "core") fail(file, "This pipeline accepts core batches only.");
  if (batch.batch_metadata?.clinical_review_status !== "pending") warn(file, "Clinical review status should remain pending until an authorized reviewer signs off.");
  const localIds = new Set();
  const localStems = new Set();
  const localScenarios = [];

  questions.forEach((q, index) => {
    const tag = q.id ?? `row-${index+1}`;
    if (!/^qrn-b\\d{3}-\\d{3}$/.test(String(q.id ?? ""))) fail(file, `[${tag}] ID must use qrn-bNNN-NNN.`);
    if (usedIds.has(q.id) || localIds.has(q.id)) fail(file, `[${tag}] duplicate ID found in existing or staged inventory.`);
    localIds.add(q.id);
    if (q.status !== "development") fail(file, `[${tag}] staged items must remain development until approved.`);
    if (q.reviewStatus !== "generated" || q.reviewMetadata?.status !== "not-clinically-verified" || q.reviewMetadata?.publicationStatus !== "draft") fail(file, `[${tag}] review metadata must explicitly mark this item unverified and draft.`);
    for (const field of ["category","topic","prompt","rationale"]) if (typeof q[field] !== "string" || q[field].trim().length < (field === "rationale" ? 30 : 8)) fail(file, `[${tag}] missing or too-short ${field}.`);
    if (!["Foundational","Intermediate","Advanced"].includes(q.difficulty)) fail(file, `[${tag}] invalid difficulty.`);
    if (!Array.isArray(q.options) || q.options.length !== 4) fail(file, `[${tag}] exactly four options are required for this single-response batch.`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length ?? 0)) fail(file, `[${tag}] answer key is not a valid option index.`);
    const opts = (q.options ?? []).map(norm);
    if (opts.some(x => x.length < 18) || new Set(opts).size !== opts.length) fail(file, `[${tag}] options must be distinct, substantive clinical responses.`);
    const rationales = q.interaction?.optionRationales;
    if (!Array.isArray(rationales) || rationales.length !== 4 || rationales.some(x => typeof x !== "string" || x.trim().length < 15)) fail(file, `[${tag}] requires four per-option rationales of at least 15 characters.`);
    if (q.interaction?.correctResponse?.length !== 1 || q.interaction.correctResponse[0] !== String(q.answer)) fail(file, `[${tag}] interaction answer key must match answer index.`);
    const stem = norm(q.prompt);
    if (!stem || usedStems.has(stem) || localStems.has(stem)) fail(file, `[${tag}] duplicate or empty normalized prompt.`);
    localStems.add(stem);
    if (!q.clinicalScenario || q.clinicalScenario.trim().length < 80) fail(file, `[${tag}] requires a sufficiently specific clinical scenario.`);
    if (!q.clinicalJudgmentStep) warn(file, `[${tag}] clinical judgment mapping is absent.`);

    // Mandatory authoring record: these are evidence/provenance fields, not claims of clinical approval.
    const authoring = q.authoring;
    const blueprint = authoring?.blueprint;
    const blueprintFields = ["clientNeedsArea","competency","cognitiveDemand","setting","acuity","keyEvidence","targetedNoviceError"];
    if (!blueprint || blueprintFields.some(field => typeof blueprint[field] !== "string" || !blueprint[field].trim())) {
      fail(file, `[${tag}] requires authoring.blueprint with ${blueprintFields.join(", ")}.`);
    }
    const evidence = authoring?.clinicalEvidence;
    if (!Array.isArray(evidence) || evidence.length === 0 || evidence.some(source =>
      !["organization","title","publishedOrUpdated","locator","claimSupported"].every(field =>
        typeof source?.[field] === "string" && source[field].trim().length > 0))) {
      fail(file, `[${tag}] requires at least one traceable clinicalEvidence record (organization, title, publishedOrUpdated, locator, claimSupported).`);
    }
    const challenge = authoring?.adversarialReview;
    if (challenge?.disposition !== "pass_for_clinical_review" ||
        typeof challenge?.closestCompetingOption !== "string" || !challenge.closestCompetingOption.trim() ||
        typeof challenge?.ambiguityAssessment !== "string" || challenge.ambiguityAssessment.trim().length < 20 ||
        typeof challenge?.cueingAssessment !== "string" || challenge.cueingAssessment.trim().length < 20) {
      fail(file, `[${tag}] requires a documented adversarialReview disposition, closestCompetingOption, ambiguityAssessment, and cueingAssessment. This is not clinical sign-off.`);
    }

    const scenario = flattenScenario(q.clinicalScenario);
    if (scenario) {
      for (const prior of [...scenarioInventory, ...localScenarios]) {
        const score = jaccard(scenario, prior.scenario);
        if (score >= 0.78) warn(file, `[${tag}] clinical scenario is highly similar to ${prior.id} (token-overlap ${score.toFixed(2)}); human review must determine whether the underlying clinical decision is genuinely distinct.`);
      }
      localScenarios.push({ id: tag, scenario });
    }
  });
  for (const id of localIds) usedIds.add(id);
  for (const stem of localStems) usedStems.set(stem, name);
  scenarioInventory.push(...localScenarios);
  total += questions.length;
}
console.log(`Staged core batches: ${files.length}; staged items: ${total}; required size: 100 per batch.`);
for (const w of warnings) console.warn("WARN " + w);
for (const e of errors) console.error("ERROR " + e);
console.log(`Batch gate: ${errors.length} error(s), ${warnings.length} warning(s). Similarity flags require human adjudication; clinical approval and browser rendering remain separate mandatory release gates.`);
if (errors.length) process.exitCode = 1;

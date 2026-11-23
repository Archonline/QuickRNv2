import fs from "node:fs";

const source = fs.readFileSync("src/questionBank.ts", "utf8");
const rewriteSource = fs.readFileSync("src/authoredCoreRewriteBatch.ts", "utf8");
const categoryBlock = source.slice(source.indexOf("const B:B[]="), source.indexOf("const cases="));
const categories = [];
for (const match of categoryBlock.matchAll(/\{category:"([^"]+)",count:(\d+),topics:\[([\s\S]*?)\],scenario:/g)) {
  categories.push({
    category: match[1],
    count: Number(match[2]),
    topics: [...match[3].matchAll(/"([^"]+)"/g)].map((topic) => topic[1]),
  });
}
if (categories.length !== 14) throw new Error(`Expected 14 generated category profiles; parsed ${categories.length}.`);

const authoredIds = new Set([...rewriteSource.matchAll(/\bsingle\(\s*"([^"]+)"/g)].map((match) => match[1]));
const generated = [];
let index = 0;
for (const profile of categories) {
  for (let i = 0; i < profile.count; i += 1) {
    const id = "qrn-" + String(index + 1).padStart(4, "0");
    if (index >= 136 && !authoredIds.has(id)) {
      generated.push({ id, category: profile.category, topic: profile.topics[i % profile.topics.length] });
    }
    index += 1;
  }
}
if (generated.length !== 264) throw new Error(`Expected 264 remaining generated core questions after 100 authored replacements; reconstructed ${generated.length}.`);

const byCategoryTopic = new Map();
for (const item of generated) {
  const key = item.category + "::" + item.topic;
  const group = byCategoryTopic.get(key) ?? [];
  group.push(item.id);
  byCategoryTopic.set(key, group);
}
const repeatedGroups = [...byCategoryTopic.entries()]
  .filter(([, ids]) => ids.length > 1)
  .map(([key, ids]) => ({ key, count: ids.length, ids }));
const repeatedItems = repeatedGroups.reduce((sum, group) => sum + group.count, 0);
const singletonGroups = [...byCategoryTopic.entries()].filter(([, ids]) => ids.length === 1).length;

const crossCategoryTopics = new Map();
for (const item of generated) {
  const set = crossCategoryTopics.get(item.topic) ?? new Set();
  set.add(item.category);
  crossCategoryTopics.set(item.topic, set);
}
const repeatedAcrossCategories = [...crossCategoryTopics.entries()]
  .filter(([, set]) => set.size > 1)
  .map(([topic, set]) => ({ topic, categories: [...set] }));

const categoryOverrides = [
  "Pediatrics / Growth and Development::Newborn thermoregulation",
  "Respiratory / Airway::Pulmonary embolism",
  "Infection Control / Infectious Disease::Meningitis",
  "Pediatrics / Growth and Development::Pertussis",
  "Pediatrics / Growth and Development::RSV",
  "Pediatrics / Growth and Development::Autism spectrum disorder",
];
const overrideBlock = source.slice(source.indexOf("const categoryTopicOverrides"), source.indexOf("const allGeneratedTopics"));
const missingVariantKeys = categoryOverrides.filter((key) => !overrideBlock.includes('"' + key + '"'));
const hasCategorySpecificResolution = source.includes('categoryTopicOverrides[b.category + "::" + topic]');
const makeBlock = source.slice(source.indexOf("function make("), source.indexOf("const all:Question[]"));
const keyIsDerivedFromAnswerText = makeBlock.includes("opts.indexOf(answerText)");
const hasPerOptionRationales = /optionRationales\s*:/.test(makeBlock);
const hasEvidenceMetadata = /clinicalEvidence|references\s*:\s*\[[^\]]+\]/.test(makeBlock);
const cyclicDistractorSelection = makeBlock.includes("distractorStart") && makeBlock.includes("distractors[(distractorStart + offset) % distractors.length]");
const generatedItemsAreQuarantined = makeBlock.includes('status: "development"') &&
  makeBlock.includes('publicationStatus: "draft"') &&
  makeBlock.includes('status: "not-clinically-verified"');

if (!generatedItemsAreQuarantined) {
  throw new Error("Unverified topic-profile-generated questions must remain development/draft until item-level remediation and clinical review are complete.");
}

if (!hasCategorySpecificResolution || missingVariantKeys.length) {
  throw new Error("Missing category-specific clinical variants: " + missingVariantKeys.join("; "));
}
if (!keyIsDerivedFromAnswerText) {
  throw new Error("Generated answer key is no longer structurally derived from the designated answer text.");
}
const report = {
  scope: "Topic-profile-generated core items only; excludes 36 unfolding-case screens, 100 curated traditional items, and 100 authored replacement drafts (40 initial replacements plus 60 replacements from the current tranche).",
  reconstructedCount: generated.length,
  categoryTopicCombinations: byCategoryTopic.size,
  repeatedScenarioGroups: repeatedGroups.length,
  itemsInRepeatedGroups: repeatedItems,
  singletonScenarioGroups: singletonGroups,
  extraCopiesBeyondOnePerGroup: repeatedItems - repeatedGroups.length,
  repeatedAcrossCategories,
  structuralAnswerKey: keyIsDerivedFromAnswerText ? "PASS: option index is calculated from the exact keyed answer text after option shuffling." : "FAIL: answer-key derivation pattern not found.",
  publicationSafeguard: generatedItemsAreQuarantined ? "PASS: topic-profile-generated items are development/draft and not represented as clinically approved." : "FAIL: unverified generated items must remain draft.",
  clinicalAnswerDefensibility: "NOT VERIFIED: generated items contain no item-level clinical source/evidence record and the answer text is inherited from a topic profile.",
  distractorConstruction: cyclicDistractorSelection
    ? "RISK: three options are selected by cyclic rotation from a shared topic-level pool; the algorithm does not establish that each distractor is a competitive, stem-specific near miss."
    : "Review selection logic manually.",
  rationaleCompleteness: hasPerOptionRationales
    ? "Option-level rationale field detected; inspect each mapping."
    : "FAIL: generated items receive one shared topic-level rationale and no rationale for each individual distractor.",
  evidenceMetadata: hasEvidenceMetadata
    ? "Evidence-like metadata detected in generator; source support still requires verification."
    : "FAIL: no clinical evidence/reference metadata is attached to generated items.",
  repeatedGroups,
  categoryOverridesPresent: hasCategorySpecificResolution && !missingVariantKeys.length,
  missingVariantKeys,
};
fs.writeFileSync("docs/question-bank/GENERATED-CORE-324-AUDIT.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));

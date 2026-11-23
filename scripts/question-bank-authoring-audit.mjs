import fs from "node:fs";

const source = fs.readFileSync("src/authoredCoreRewriteBatch.ts", "utf8");
const calls = [...source.matchAll(/single\(\s*"([^"]+)"[\s\S]*?\n\s*\),/g)];
const ids = calls.map((match) => match[1]);
const failures = [];
if (ids.length !== 20 && ids.length < 1) failures.push("No authored question records were detected.");
if (new Set(ids).size !== ids.length) failures.push("Duplicate authored question IDs detected.");
for (const id of ids) {
  if (!/^qrn-[a-z0-9-]+$/.test(id)) failures.push(`Invalid question ID: ${id}`);
}
if (!source.includes('status: "not-clinically-verified"') && !source.includes('status: "generated"')) {
  failures.push("Authored draft module must retain explicit unverified review metadata.");
}
const required = [
  "optionRationales", "clinicalJudgmentStep", "contentVersion",
  "reviewStatus: \"generated\"", "not-clinically-verified",
];
for (const field of required) {
  if (!source.includes(field)) failures.push(`Missing required authoring metadata: ${field}`);
}
const bank = fs.readFileSync("src/questionBank.ts", "utf8");
if (!bank.includes("authoredCoreRewriteBatch")) failures.push("Authored batch is not integrated into the runtime question bank.");
if (!bank.includes("questionBank500.length!==500")) failures.push("Expected 500-item core bank invariant is missing.");
if (!bank.includes("new Set(questionBank500.map(q=>q.id)).size!==500")) failures.push("Expected unique core question ID invariant is missing.");
if (failures.length) {
  console.error("Question-bank authoring audit FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Question-bank authoring audit passed: ${ids.length} authored replacements, unique IDs, metadata present, runtime integration and 500-item invariants detected.`);

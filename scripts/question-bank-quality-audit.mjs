import fs from "node:fs";

const files = [
  "src/curatedQuestionBatch100.json",
  "src/curatedQuestionBatch2_100.json",
];
const findings = [];
const totals = { items: 0, optionItems: 0, invalidKeys: 0, missingRationales: 0, duplicateOptions: 0, lengthImbalance: 0, giveawayPhrases: 0 };
const norm = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function correctIds(item) {
  const response = item.correct_response;
  if (Array.isArray(response)) return response.map(String);
  if (response && typeof response === "object") {
    if (response.selected_option) return [String(response.selected_option)];
    if (Array.isArray(response.selected_options)) return response.selected_options.map(String);
  }
  return [];
}

function rationaleIds(item) {
  const rationale = item.rationales ?? {};
  const ids = new Set();
  if (Array.isArray(rationale.incorrect)) {
    for (const entry of rationale.incorrect) if (entry?.option) ids.add(String(entry.option));
  }
  if (rationale.correct) for (const key of correctIds(item)) ids.add(key);
  for (const key of Object.keys(rationale)) {
    if (/^[A-Z]$/.test(key) || /^[A-Z0-9_-]+$/.test(key)) ids.add(key);
  }
  return ids;
}

for (const file of files) {
  const bank = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const item of bank.questions ?? []) {
    totals.items++;
    const options = item.interaction?.options;
    if (!Array.isArray(options) || !options.length) continue;
    totals.optionItems++;
    const labels = options.map((option) => String(option?.id ?? ""));
    const texts = options.map((option) => String(option?.text ?? "").trim());
    const id = item.id ?? "unknown";
    const keys = correctIds(item);
    const validLabels = new Set(labels);
    if (!keys.length || keys.some((key) => !validLabels.has(key))) {
      totals.invalidKeys++;
      findings.push({ id, file, type: "invalid-or-missing-key", detail: keys.join(",") || "No keyed response found" });
    }
    const rationaleLabels = rationaleIds(item);
    const missing = labels.filter((label) => label && !rationaleLabels.has(label));
    if (missing.length) {
      totals.missingRationales++;
      findings.push({ id, file, type: "missing-option-rationale", detail: missing.join(",") });
    }
    const normalized = texts.map(norm);
    if (new Set(normalized).size !== normalized.length) {
      totals.duplicateOptions++;
      findings.push({ id, file, type: "duplicate-options", detail: "Two or more options normalize to identical text" });
    }
    const lengths = texts.map((text) => text.length).filter(Boolean);
    if (lengths.length >= 3) {
      const max = Math.max(...lengths);
      const min = Math.min(...lengths);
      if (max - min >= 65 || max / Math.max(min, 1) >= 2.1) {
        totals.lengthImbalance++;
        findings.push({ id, file, type: "option-length-imbalance", detail: `min=${min}, max=${max}` });
      }
    }
    const giveaway = texts.filter((text) => /\b(always|never|only|all of the above|none of the above|every time|under no circumstances)\b/i.test(text));
    if (giveaway.length) {
      totals.giveawayPhrases++;
      findings.push({ id, file, type: "possible-giveaway-wording", detail: giveaway.join(" | ") });
    }
  }
}

const output = {
  audit: "QuickRN question-bank option quality scan",
  note: "Heuristic flags require human clinical review. This scan does not rewrite items or certify clinical accuracy.",
  totals,
  findings,
};
fs.writeFileSync("question-bank-quality-audit.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify({ ...output, findings: findings.slice(0, 40), findings_truncated: findings.length > 40 }, null, 2));

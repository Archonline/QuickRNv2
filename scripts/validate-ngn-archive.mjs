import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "src/question-batches/ngn");
const manifestPath = path.join(dir, "manifest.json");
const errors = [];
const fail = message => errors.push(message);
if (!fs.existsSync(manifestPath)) throw new Error("Missing NGN manifest: " + path.relative(root, manifestPath));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.project !== "quickrn-ngn-300" || manifest.target !== 300 || manifest.batchSize !== 25) fail("Manifest project, target, or batch size is invalid.");
if (!Array.isArray(manifest.questions)) fail("Manifest questions must be an array.");
const ids = new Set();
const batchFiles = fs.existsSync(dir) ? fs.readdirSync(dir).filter(name => /^ngn-batch-\d{3}\.json$/.test(name)).sort() : [];
const archived = [];
for (const name of batchFiles) {
  const file = path.join(dir, name);
  let batch;
  try { batch = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { fail(name + ": invalid JSON: " + e.message); continue; }
  if (!Array.isArray(batch.questions) || batch.questions.length > 25) { fail(name + ": questions must be an array of at most 25 items."); continue; }
  const batchId = name.replace(/\.json$/, "");
  for (const q of batch.questions) {
    if (!q || typeof q !== "object" || !/^QR-NGN-\d{3}$/.test(q.id ?? "")) { fail(name + ": every question needs a QR-NGN-NNN ID."); continue; }
    if (ids.has(q.id)) fail("Duplicate question ID: " + q.id);
    ids.add(q.id);
    if (q.batchId !== batchId) fail(q.id + ": batchId must match " + batchId + ".");
    if (!["FINALIZED-DRAFT","BLOCKED","REJECTED"].includes(q.status)) fail(q.id + ": invalid workflow status.");
    if (!q.itemType || !q.topic || !q.prompt || !q.rationale) fail(q.id + ": itemType, topic, prompt, and rationale are required.");
    archived.push(q);
  }
}
const manifestIds = new Set();
for (const q of manifest.questions ?? []) {
  if (!q?.id || manifestIds.has(q.id)) fail("Manifest contains a missing or duplicate question ID: " + (q?.id ?? "(missing)"));
  manifestIds.add(q?.id);
}
const fileIds = new Set(archived.map(q => q.id));
for (const id of fileIds) if (!manifestIds.has(id)) fail("Archived batch question missing from manifest: " + id);
for (const id of manifestIds) if (!fileIds.has(id)) fail("Manifest question missing from batch archive: " + id);
const finalized = archived.filter(q => q.status === "FINALIZED-DRAFT").length;
console.log("NGN archive: " + archived.length + " records; " + finalized + " finalized drafts; " + batchFiles.length + " batch files.");
console.log("ID registry: " + manifest.idRegistryStatus + "; next ID: " + (manifest.nextQuestionId ?? "BLOCKED"));
if (errors.length) { for (const error of errors) console.error("ERROR " + error); process.exitCode = 1; }
else console.log("NGN GitHub archive validation: PASS");

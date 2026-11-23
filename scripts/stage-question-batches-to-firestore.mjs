import fs from "node:fs";
import path from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
const inputDir = path.join(process.cwd(), "src", "question-batches");
const files = fs.existsSync(inputDir) ? fs.readdirSync(inputDir).filter(name => /^core-batch-\d{3}\.json$/.test(name)).sort() : [];
const serviceAccountText = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
if (!serviceAccountText) throw new Error("Missing GitHub Actions secret FIREBASE_SERVICE_ACCOUNT_JSON.");
if (!projectId) throw new Error("Missing FIREBASE_PROJECT_ID repository variable or secret.");
const app = initializeApp({ credential: cert(JSON.parse(serviceAccountText)), projectId });
const db = getFirestore(app);
const commit = process.env.GITHUB_SHA || "unknown";
const collectionRef = db.collection("questionDrafts");
let staged = 0, alreadyStaged = 0;
for (const filename of files) {
  const batch = JSON.parse(fs.readFileSync(path.join(inputDir, filename), "utf8"));
  const batchId = batch.batch_metadata?.batch_id;
  if (!Array.isArray(batch.questions) || batch.questions.length !== 100) throw new Error(filename + ": expected exactly 100 questions.");
  if (batchId !== filename.replace(/\.json$/, "") || batch.batch_metadata?.bank !== "core") throw new Error(filename + ": invalid core batch metadata.");
  for (let start = 0; start < batch.questions.length; start += 400) {
    const segment = batch.questions.slice(start, start + 400);
    const refs = segment.map(q => {
      if (!q?.id || typeof q.prompt !== "string") throw new Error(filename + ": each question requires id and prompt.");
      return collectionRef.doc(String(q.id));
    });
    const existing = await db.getAll(...refs);
    const writes = db.batch();
    for (let i = 0; i < segment.length; i++) {
      const question = segment[i], prior = existing[i], ref = refs[i];
      if (prior.exists) {
        if (prior.get("batchId") === batchId && prior.get("sourceFile") === filename) { alreadyStaged++; continue; }
        throw new Error("Question ID collision: " + question.id + " already exists in questionDrafts.");
      }
      const stagedQuestion = { ...question, status: "development", reviewStatus: "generated",
        reviewMetadata: { ...(question.reviewMetadata ?? {}), status: "not-clinically-verified", publicationStatus: "draft", references: Array.isArray(question.reviewMetadata?.references) ? question.reviewMetadata.references : [] } };
      writes.create(ref, { question: stagedQuestion, status: "pending-review", batchId, sourceFile: filename, sourceCommit: commit, createdAt: FieldValue.serverTimestamp(), createdBy: "github-question-batch-pipeline" });
      staged++;
    }
    await writes.commit();
  }
  console.log(filename + ": processed " + batch.questions.length + " questions.");
}
console.log("Newly staged: " + staged + "; already staged on retry: " + alreadyStaged + ".");

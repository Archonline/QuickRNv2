import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createServer } from "vite";
import fs from "node:fs/promises";
import path from "node:path";

const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;
if (!projectId) {
  throw new Error("Set GOOGLE_CLOUD_PROJECT (or FIREBASE_PROJECT_ID) to the Firebase project ID.");
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn("GOOGLE_APPLICATION_CREDENTIALS is not set; Application Default Credentials will be used.");
}

const app = initializeApp({ credential: applicationDefault(), projectId }, "question-archive-export");
const db = getFirestore(app);
const vite = await createServer({ configFile: "./vite.config.ts", server: { middlewareMode: true }, appType: "custom" });

function clean(value) {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(clean);
  if (typeof value === "object") {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      if (/email|createdBy|reviewedBy|reporter/i.test(key)) continue;
      out[key] = clean(child);
    }
    return out;
  }
  return value;
}

try {
  const { questionBank600 } = await vite.ssrLoadModule("/src/ngnQuestionBank.ts");
  const sourceQuestions = questionBank600 ?? [];
  if (sourceQuestions.length !== 600) {
    throw new Error(`Expected 600 source questions, found ${sourceQuestions.length}. Stop: do not create an incomplete reconciliation.`);
  }

  const [questionSnapshot, draftSnapshot] = await Promise.all([
    db.collection("questions").get(),
    db.collection("questionDrafts").get()
  ]);
  const questions = questionSnapshot.docs.map(doc => ({ firestoreId: doc.id, ...clean(doc.data()) }));
  const drafts = draftSnapshot.docs.map(doc => ({ firestoreId: doc.id, ...clean(doc.data()) }));

  const sourceById = new Map();
  for (const q of sourceQuestions) {
    if (!q?.id) continue;
    const list = sourceById.get(q.id) ?? [];
    list.push(q);
    sourceById.set(q.id, list);
  }
  const remoteById = new Map();
  const addRemote = (id, entry) => {
    if (!id) return;
    const list = remoteById.get(id) ?? [];
    list.push(entry);
    remoteById.set(id, list);
  };
  for (const q of questions) addRemote(q.id || q.firestoreId, { collection: "questions", firestoreId: q.firestoreId, status: q.status ?? "unspecified" });
  for (const d of drafts) {
    const q = d.question && typeof d.question === "object" ? d.question : d;
    addRemote(q.id || d.publishedQuestionId || d.firestoreId, { collection: "questionDrafts", firestoreId: d.firestoreId, status: d.status ?? "unspecified" });
  }

  const sourceIds = new Set(sourceById.keys());
  const remoteIds = new Set(remoteById.keys());
  const matchingIds = [...sourceIds].filter(id => remoteIds.has(id)).sort();
  const firestoreOnlyIds = [...remoteIds].filter(id => !sourceIds.has(id)).sort();
  const sourceOnlyIds = [...sourceIds].filter(id => !remoteIds.has(id)).sort();
  const duplicateSourceIds = [...sourceById].filter(([, rows]) => rows.length > 1).map(([id]) => id).sort();
  const duplicateRemoteIds = [...remoteById].filter(([, rows]) => rows.length > 1).map(([id]) => id).sort();

  const report = {
    generatedAt: new Date().toISOString(),
    projectId,
    sourceBank: { count: sourceQuestions.length, uniqueIds: sourceIds.size, duplicateIds: duplicateSourceIds },
    firestore: { questionsCollectionCount: questions.length, questionDraftsCollectionCount: drafts.length, uniqueQuestionIds: remoteIds.size, duplicateIds: duplicateRemoteIds },
    reconciliation: {
      matchingIds: matchingIds.length,
      firestoreOnlyIds: firestoreOnlyIds.length,
      sourceOnlyIds: sourceOnlyIds.length,
      firestoreOnly: firestoreOnlyIds.map(id => ({ id, records: remoteById.get(id) })),
      sourceOnly: sourceOnlyIds,
      duplicateFirestore: duplicateRemoteIds.map(id => ({ id, records: remoteById.get(id) }))
    },
    firestoreCollections: { questions, questionDrafts: drafts },
    sourceBankIds: [...sourceIds].sort()
  };

  const outputPath = path.resolve(process.argv[2] || "question-bank/archive/firestore-question-archive.json");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({
    outputPath,
    sourceQuestions: sourceQuestions.length,
    firestoreQuestions: questions.length,
    firestoreDrafts: drafts.length,
    matchingIds: matchingIds.length,
    firestoreOnlyIds: firestoreOnlyIds.length,
    sourceOnlyIds: sourceOnlyIds.length,
    duplicateSourceIds: duplicateSourceIds.length,
    duplicateFirestoreIds: duplicateRemoteIds.length
  }, null, 2));
} finally {
  await vite.close();
  await app.delete();
}

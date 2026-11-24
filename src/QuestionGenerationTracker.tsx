import { useMemo } from "react";
import type { CSSProperties } from "react";
import manifest from "./question-batches/ngn/manifest.json";

type Item = {
  id: string;
  batchId: string;
  status: "FINALIZED-DRAFT" | "BLOCKED" | "REJECTED" | string;
  itemType?: string;
  topic?: string;
  prompt?: string;
  reviewNote?: string;
};
type Manifest = {
  project: string;
  target: number;
  batchSize: number;
  sourceOfTruth: string;
  idRegistryStatus: string;
  nextQuestionId: string | null;
  reportedLegacyCandidates: { count: number; firstId: string; lastId: string; status: string; note: string };
  questions: Item[];
  updatedAt: string;
  notes: string[];
};
const data = manifest as Manifest;
const panel: CSSProperties = { background: "var(--surface, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: 14, padding: 18, marginBottom: 16 };
const metric: React.CSSProperties = { border: "1px solid var(--border, #e5e7eb)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 5 };
const small: React.CSSProperties = { color: "var(--muted, #6b7280)", fontSize: 12 };

export default function QuestionGenerationTracker() {
  const stats = useMemo(() => {
    const questions = data.questions ?? [];
    const finalized = questions.filter(q => q.status === "FINALIZED-DRAFT");
    const blocked = questions.filter(q => q.status === "BLOCKED");
    const rejected = questions.filter(q => q.status === "REJECTED");
    const pending = questions.filter(q => !["FINALIZED-DRAFT", "BLOCKED", "REJECTED"].includes(q.status));
    const batches = new Set(questions.map(q => q.batchId).filter(Boolean));
    const types = new Map<string, number>();
    for (const q of finalized) { const key = q.itemType || "Unspecified"; types.set(key, (types.get(key) ?? 0) + 1); }
    return { total: questions.length, finalized: finalized.length, blocked: blocked.length, rejected: rejected.length, pending: pending.length, batches: batches.size, remaining: Math.max(0, data.target - finalized.length), percent: Math.min(100, Math.round(finalized.length / data.target * 100)), types: [...types.entries()].sort((a,b) => b[1]-a[1]) };
  }, []);

  return <section className="wm-panel" style={{ marginTop: 18 }}>
    <div className="wm-list-row" style={{ alignItems: "center", flexWrap: "wrap" }}>
      <div><div className="eyebrow">QUESTION BANK · GITHUB ARCHIVE</div><h2 style={{ margin: "4px 0" }}>NGN Generation Tracker</h2><p style={small}>Target: {data.target} finalized drafts · {data.batchSize} questions per planned batch · {Math.ceil(data.target / data.batchSize)} batches</p></div>
      <span className="wm-issue-label">GitHub manifest · {data.updatedAt}</span>
    </div>
    <div className="wm-disclaimer" role="status">Source of truth: committed GitHub question files and <code>src/question-batches/ngn/manifest.json</code>. This tracker does not read or write Firestore.</div>
    <div style={{ ...panel, marginTop: 14 }}>
      <div className="wm-list-row"><b>Finalized-draft progress</b><strong>{stats.finalized} / {data.target}</strong></div>
      <div style={{ height: 12, background: "var(--border, #e5e7eb)", borderRadius: 99, overflow: "hidden", margin: "12px 0 8px" }}><div style={{ width: stats.percent + "%", height: "100%", background: "var(--accent, #2563eb)", borderRadius: 99 }}/></div>
      <div className="wm-list-row"><span style={small}>{stats.percent}% complete</span><span style={small}>{stats.remaining} finalized drafts remaining</span></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
      <div style={metric}><strong style={{ fontSize: 25 }}>{stats.total}</strong><span style={small}>Archived records</span></div>
      <div style={metric}><strong style={{ fontSize: 25 }}>{stats.finalized}</strong><span style={small}>Finalized drafts</span></div>
      <div style={metric}><strong style={{ fontSize: 25 }}>{stats.blocked}</strong><span style={small}>Blocked</span></div>
      <div style={metric}><strong style={{ fontSize: 25 }}>{stats.rejected}</strong><span style={small}>Rejected</span></div>
      <div style={metric}><strong style={{ fontSize: 25 }}>{stats.batches}</strong><span style={small}>Identified batches</span></div>
    </div>
    <div style={{ ...panel, marginTop: 16 }}>
      <h3 style={{ marginTop: 0 }}>ID registry</h3>
      {data.idRegistryStatus === "reconciled" && data.nextQuestionId ? <p>Next unused ID: <b>{data.nextQuestionId}</b></p> : <p className="qb-feedback-error">ID assignment is blocked. The 30 historical candidates ({data.reportedLegacyCandidates.firstId}–{data.reportedLegacyCandidates.lastId}) are reported but not archived. Recover or explicitly adjudicate them before assigning IDs.</p>}
      <p style={small}>{data.reportedLegacyCandidates.note}</p>
    </div>
    <div style={panel}>
      <h3 style={{ marginTop: 0 }}>Format distribution · finalized drafts</h3>
      {stats.types.length ? stats.types.map(([type,count]) => <div className="wm-list-row" key={type}><span>{type}</span><b>{count}</b></div>) : <p style={small}>No finalized NGN questions are currently archived in this GitHub manifest.</p>}
    </div>
    <div style={panel}>
      <h3 style={{ marginTop: 0 }}>Production rules</h3>
      <ul><li>Only FINALIZED-DRAFT records count toward the target.</li><li>BLOCKED and REJECTED items remain visible but do not count.</li><li>Every item remains pending qualified independent clinical review.</li><li>Commit each batch JSON and update this manifest in the same pull request or commit sequence.</li></ul>
      <p style={small}>Reported historical candidates: {data.reportedLegacyCandidates.count} · Registry: {data.idRegistryStatus} · Source: {data.sourceOfTruth}</p>
    </div>
  </section>;
}

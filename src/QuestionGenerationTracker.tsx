import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { RefreshCw, RotateCcw, AlertTriangle } from "lucide-react";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";

type Row = { id: string; status?: string; question?: { id?: string; itemType?: string; topic?: string; generationProject?: string; batchId?: string; reviewStatus?: string; reviewMetadata?: any }; generationProject?: string; batchId?: string; createdAt?: any; [key: string]: any };

const PROJECT = "quickrn-ngn-300";
const TARGET = 300;
const panel: CSSProperties = { background: "var(--surface, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: 14, padding: 18, marginBottom: 16 };
const metric: React.CSSProperties = { border: "1px solid var(--border, #e5e7eb)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 5 };
const small: React.CSSProperties = { color: "var(--muted, #6b7280)", fontSize: 12 };

export default function QuestionGenerationTracker() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [published, setPublished] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [admin, setAdmin] = useState(false);
  const [control, setControl] = useState<any>(null);

  const refresh = useCallback(async () => {
    if (!db) { setError("Firebase is not configured."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const [draftSnap, questionSnap, controlSnap] = await Promise.all([
        getDocs(collection(db, "questionDrafts")),
        getDocs(collection(db, "questions")),
        getDocs(collection(db, "questionGenerationControl"))
      ]);
      const drafts = draftSnap.docs.map(d => ({ id: d.id, ...d.data() } as Row))
        .filter(d => d.generationProject === PROJECT || d.question?.generationProject === PROJECT);
      const approved = questionSnap.docs.map(d => ({ id: d.id, ...d.data() } as Row))
        .filter(d => d.generationProject === PROJECT || d.reviewMetadata?.generationProject === PROJECT);
      setRows(drafts); setPublished(approved);
      const state = controlSnap.docs.find(d => d.id === "state");
      setControl(state ? state.data() : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load generation records. Verify administrator access.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let live = true;
    void (async () => {
      try { const token = await user?.getIdTokenResult(); if (live) setAdmin(token?.claims.admin === true); }
      catch { if (live) setAdmin(false); }
    })();
    return () => { live = false; };
  }, [user]);
  useEffect(() => { void refresh(); }, [refresh]);

  const stats = useMemo(() => {
    const pending = rows.filter(r => !["rejected", "published", "approved"].includes(r.status ?? ""));
    const rejected = rows.filter(r => r.status === "rejected");
    const approvedCount = published.length + rows.filter(r => ["published", "approved"].includes(r.status ?? "")).length;
    const generated = rows.length + published.length;
    const batches = new Set([...rows, ...published].map(r => r.batchId ?? r.question?.batchId).filter(Boolean));
    return { generated, pending: pending.length, rejected: rejected.length, approved: approvedCount, batches: batches.size, remaining: Math.max(0, TARGET - generated), percent: Math.min(100, Math.round(generated / TARGET * 100)) };
  }, [rows, published]);

  const reinitialize = async () => {
    if (!db || !admin || !user || busy) return;
    const confirmed = window.confirm("Reinitialize the NGN generation tracker? This records a restart request and resets tracker-control metadata. It does not launch the ChatGPT automation or delete generated questions.");
    if (!confirmed) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await setDoc(doc(db, "questionGenerationControl", "state"), {
        project: PROJECT, target: TARGET, restartRequested: true,
        restartRequestedAt: serverTimestamp(), restartRequestedBy: user.email ?? user.uid,
        state: "restart-requested", updatedAt: serverTimestamp()
      }, { merge: true });
      setNotice("Restart request recorded. The saved ChatGPT task still needs to be started or rescheduled separately; this button does not execute it.");
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to record restart request."); }
    finally { setBusy(false); }
  };

  const batches = useMemo(() => {
    const grouped = new Map<string, Row[]>();
    [...rows, ...published].forEach(r => {
      const key = r.batchId ?? r.question?.batchId ?? "Unassigned batch";
      grouped.set(key, [...(grouped.get(key) ?? []), r]);
    });
    return [...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);
  }, [rows, published]);

  return <section className="wm-panel" style={{ marginTop: 18 }}>
    <div className="wm-list-row" style={{ alignItems: "center", flexWrap: "wrap" }}>
      <div><div className="eyebrow">QUESTION BANK · PRODUCTION</div><h2 style={{ margin: "4px 0" }}>NGN Generation Tracker</h2><p style={small}>Target: 300 new NGN items · 25 questions per planned batch · 12 batches</p></div>
      <div className="wm-action-row">
        <button className="button secondary" onClick={() => void refresh()} disabled={loading || busy}><RefreshCw size={14}/> Refresh</button>
        <button className="button secondary" onClick={() => void reinitialize()} disabled={!admin || busy}><RotateCcw size={14}/> Reinitialize tracker</button>
      </div>
    </div>
    {error && <div className="qb-feedback-error" role="alert">{error}</div>}
    {notice && <div className="wm-disclaimer" role="status">{notice}</div>}
    <div style={{ ...panel, marginTop: 14 }}>
      <div className="wm-list-row"><b>Overall generation progress</b><strong>{stats.generated} / {TARGET}</strong></div>
      <div style={{ height: 12, background: "var(--border, #e5e7eb)", borderRadius: 99, overflow: "hidden", margin: "12px 0 8px" }}><div style={{ width: stats.percent + "%", height: "100%", background: "var(--accent, #2563eb)", borderRadius: 99, transition: "width .25s" }}/></div>
      <div className="wm-list-row"><span style={small}>{stats.percent}% complete</span><span style={small}>{stats.remaining} remaining</span></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
      <div style={metric}><strong style={{ fontSize: 25 }}>{stats.generated}</strong><span style={small}>Generated and tracked</span></div>
      <div style={metric}><strong style={{ fontSize: 25 }}>{stats.pending}</strong><span style={small}>Pending review</span></div>
      <div style={metric}><strong style={{ fontSize: 25 }}>{stats.approved}</strong><span style={small}>Approved / published</span></div>
      <div style={metric}><strong style={{ fontSize: 25 }}>{stats.rejected}</strong><span style={small}>Rejected drafts</span></div>
      <div style={metric}><strong style={{ fontSize: 25 }}>{stats.batches}</strong><span style={small}>Identified batches</span></div>
    </div>
    <div style={{ ...panel, marginTop: 16 }}>
      <div className="wm-list-row"><h3 style={{ margin: 0 }}>Production schedule</h3><span style={small}>Planning estimate</span></div>
      <div className="wm-list-row"><span>Batch size</span><b>25 questions</b></div>
      <div className="wm-list-row"><span>Target batches</span><b>12</b></div>
      <div className="wm-list-row"><span>Estimated production time</span><b>12 hours of batch work</b></div>
      <p style={small}>The ChatGPT automation scheduler does not currently offer hourly recurrence. This is a production target, not a guaranteed completion time. Current tracker state: {control?.state ?? "not initialized"}.</p>
    </div>
    <div style={panel}>
      <div className="wm-list-row"><h3 style={{ margin: 0 }}>Recent batch records</h3><span style={small}>{batches.length} shown</span></div>
      {loading ? <p>Loading generation records…</p> : batches.length ? batches.map(([id, items]) => <div className="wm-list-row" key={id}><span><b>{id}</b><small style={{ display: "block", ...small }}>{items.filter(x => x.status === "rejected").length} rejected · {items.filter(x => ["published","approved"].includes(x.status ?? "")).length} approved</small></span><b>{items.length} items</b></div>) : <p style={small}>No questions tagged for this 300-item generation project have been imported yet. Existing chat drafts are not counted until they are recorded in the project tracker.</p>}
    </div>
    <p className="wm-disclaimer"><AlertTriangle size={14} style={{ display: "inline", verticalAlign: "middle" }}/> Generated count is not the same as clinically approved count. All items remain drafts until qualified independent review. The restart control logs a request only; it cannot invoke the separate ChatGPT automation from the browser.</p>
  </section>;
}

import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { BookmarkCheck, CalendarClock, CheckCircle2, NotebookPen, RotateCcw } from "lucide-react";
import { db } from "./firebase";
import type { Question } from "./questions";

type ReviewRecord = {
  questionId: string;
  note: string;
  confidence: number;
  intervalDays: number;
  dueAt: number;
  repetitions: number;
  updatedAt?: unknown;
};

type Props = {
  uid: string | null;
  questions: Question[];
  savedQuestionIds: string[];
  onPractice: (question: Question) => void;
  onRemove: (questionId: string) => void;
};

const intervals = [1, 3, 7, 14, 30, 60];
const confidenceLabels: Record<number, string> = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };

export default function StudyNotebook({ uid, questions, savedQuestionIds, onPractice, onRemove }: Props) {
  const [records, setRecords] = useState<Record<string, ReviewRecord>>({});
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<"all" | "due" | "notes">("all");
  const [saving, setSaving] = useState<string | null>(null);
  const questionMap = useMemo(() => new Map(questions.map(question => [question.id, question])), [questions]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoaded(false);
      if (!uid || !db) {
        setRecords({});
        setLoaded(true);
        return;
      }
      try {
        const snapshot = await getDocs(collection(db, "users", uid, "studyNotebook"));
        if (!active) return;
        const next: Record<string, ReviewRecord> = {};
        snapshot.docs.forEach(entry => {
          const data = entry.data();
          next[entry.id] = {
            questionId: entry.id,
            note: typeof data.note === "string" ? data.note : "",
            confidence: Number.isFinite(data.confidence) ? data.confidence : 0,
            intervalDays: Number.isFinite(data.intervalDays) ? data.intervalDays : 0,
            dueAt: Number.isFinite(data.dueAt) ? data.dueAt : 0,
            repetitions: Number.isFinite(data.repetitions) ? data.repetitions : 0,
          };
        });
        setRecords(next);
      } catch (error) {
        console.error("Study notebook failed to load", error);
      } finally {
        if (active) setLoaded(true);
      }
    }
    void load();
    return () => { active = false; };
  }, [uid]);

  const items = useMemo(() => savedQuestionIds
    .map(id => questionMap.get(id))
    .filter((question): question is Question => Boolean(question))
    .map(question => ({ question, record: records[question.id] ?? {
      questionId: question.id, note: "", confidence: 0, intervalDays: 0, dueAt: 0, repetitions: 0,
    } }))
    .filter(({ record }) => filter === "due" ? !record.dueAt || record.dueAt <= Date.now() : filter === "notes" ? Boolean(record.note.trim()) : true),
  [savedQuestionIds, questionMap, records, filter]);

  async function persist(questionId: string, patch: Partial<ReviewRecord>) {
    const current = records[questionId] ?? { questionId, note: "", confidence: 0, intervalDays: 0, dueAt: 0, repetitions: 0 };
    const next = { ...current, ...patch };
    setRecords(previous => ({ ...previous, [questionId]: next }));
    if (!uid || !db) return;
    setSaving(questionId);
    try {
      await setDoc(doc(db, "users", uid, "studyNotebook", questionId), { ...next, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error("Study notebook save failed", error);
    } finally {
      setSaving(currentId => currentId === questionId ? null : currentId);
    }
  }

  async function scheduleReview(questionId: string, confidence: number) {
    const current = records[questionId] ?? { questionId, note: "", confidence: 0, intervalDays: 0, dueAt: 0, repetitions: 0 };
    const nextRepetition = confidence === 1 ? 0 : Math.min(intervals.length - 1, current.repetitions);
    const days = confidence === 1 ? 1 : intervals[nextRepetition] * (confidence === 2 ? 0.7 : confidence === 4 ? 1.5 : 1);
    await persist(questionId, {
      confidence,
      intervalDays: Math.max(1, Math.round(days)),
      dueAt: Date.now() + Math.max(1, Math.round(days)) * 86400000,
      repetitions: confidence === 1 ? 0 : current.repetitions + 1,
    });
  }

  const dueCount = savedQuestionIds.filter(id => {
    const dueAt = records[id]?.dueAt ?? 0;
    return !dueAt || dueAt <= Date.now();
  }).length;

  return <section className="notebook-page">
    <div className="notebook-heading"><div><div className="eyebrow">YOUR PERSONAL STUDY SYSTEM</div><h1>My notebook</h1><p className="subheading">Keep important questions, add your own notes, and schedule active recall.</p></div><div className="notebook-summary"><strong>{savedQuestionIds.length}</strong><span>Saved questions</span><strong>{dueCount}</strong><span>Due to review</span></div></div>
    {!uid && <div className="notice"><NotebookPen size={18}/><div><strong>Sign in to sync your notebook</strong><span>You can review saved questions in this session. Notes and review schedules are saved to your account when signed in.</span></div></div>}
    <div className="notebook-toolbar" role="group" aria-label="Filter notebook questions">
      <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All saved ({savedQuestionIds.length})</button>
      <button type="button" className={filter === "due" ? "active" : ""} onClick={() => setFilter("due")}>Due now ({dueCount})</button>
      <button type="button" className={filter === "notes" ? "active" : ""} onClick={() => setFilter("notes")}>With notes</button>
    </div>
    {!loaded ? <div className="analytics-empty">Loading your notebook…</div> : items.length === 0 ? <div className="empty-state"><BookmarkCheck size={25}/><strong>{savedQuestionIds.length ? "Nothing in this view" : "Your notebook is empty"}</strong><span>{savedQuestionIds.length ? "Try another filter, or save more questions during practice." : "Save a question while practicing or taking an exam to add it here."}</span></div> : <div className="notebook-list">
      {items.map(({ question, record }) => <article className="notebook-card" key={question.id}>
        <div className="notebook-card-meta"><span className="tag">{question.category}</span><span className="tag muted">{question.difficulty}</span><span>{question.topic}</span><span className="notebook-save-state">{saving === question.id ? "Saving…" : "Saved"}</span></div>
        <h2>{question.prompt}</h2>
        {question.caseStudy && <details className="notebook-case-context"><summary>Review clinical scenario</summary><p>{question.caseStudy}</p>{question.exhibit && <p>{question.exhibit}</p>}</details>}
        <label className="notebook-note-label" htmlFor={"note-" + question.id}>My clinical notes</label>
        <textarea id={"note-" + question.id} value={record.note} onChange={event => setRecords(previous => ({ ...previous, [question.id]: { ...record, note: event.target.value } }))} onBlur={event => void persist(question.id, { note: event.target.value })} placeholder="What cue did you miss? What will you remember next time?" rows={3}/>
        <div className="notebook-review-row"><div><strong>How well do you know this?</strong><span>{record.dueAt ? "Next review: " + new Date(record.dueAt).toLocaleDateString() : "Choose a confidence level to schedule your first review."}</span></div><div className="notebook-confidence">{([1, 2, 3, 4] as const).map(level => <button type="button" key={level} className={record.confidence === level ? "selected" : ""} onClick={() => void scheduleReview(question.id, level)}>{confidenceLabels[level]}</button>)}</div></div>
        <div className="notebook-card-actions"><button type="button" className="button primary" onClick={() => onPractice(question)}>Review question</button><button type="button" className="button secondary" onClick={() => onRemove(question.id)}>Remove from notebook</button><span><CalendarClock size={13}/> {record.intervalDays ? "Repeat in " + record.intervalDays + " day(s)" : "Not scheduled"}</span></div>
      </article>)}
    </div>}
    <p className="notebook-footnote"><RotateCcw size={13}/> Spaced-repetition intervals are study reminders, not a validated prediction of retention or exam readiness.</p>
  </section>;
}

import { useMemo, useState } from "react";
import { ClipboardCopy, MessageSquareWarning, RefreshCw } from "lucide-react";

type FeedbackReport = {
  id: string;
  questionId: string;
  itemType: string;
  topic: string;
  prompt: string;
  feedback: string;
  mode: string;
  reporterEmail?: string;
  status?: string;
  createdAt?: { toDate?: () => Date };
};

type Props = {
  feedbackReports?: FeedbackReport[];
  loading?: boolean;
  loadError?: string;
  onRefresh?: () => void;
};

function reportDate(report: FeedbackReport) {
  try { return report.createdAt?.toDate?.().toLocaleString() ?? "Date unavailable"; }
  catch { return "Date unavailable"; }
}

export default function QuestionBankAutomationTracker({
  feedbackReports = [],
  loading = false,
  loadError = "",
  onRefresh,
}: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const reports = useMemo(
    () => [...feedbackReports].sort((a, b) => {
      const at = a.createdAt?.toDate?.().getTime?.() ?? 0;
      const bt = b.createdAt?.toDate?.().getTime?.() ?? 0;
      return bt - at;
    }),
    [feedbackReports],
  );

  async function copyReport(report: FeedbackReport) {
    const payload = [
      "QuickRNv2 question feedback",
      "Question ID: " + report.questionId,
      "Item type: " + report.itemType,
      "Topic: " + report.topic,
      "Exam: " + report.mode,
      "Reporter: " + (report.reporterEmail ?? "Learner"),
      "Submitted: " + reportDate(report),
      "",
      "Question:",
      report.prompt,
      "",
      "Suggested correction / issue:",
      report.feedback,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedId(report.id);
    } catch {
      setCopiedId(null);
    }
  }

  async function copyAll() {
    const payload = reports.map((report) => [
      "Question ID: " + report.questionId,
      "Item type: " + report.itemType + " | Topic: " + report.topic + " | Exam: " + report.mode,
      "Reporter: " + (report.reporterEmail ?? "Learner") + " | " + reportDate(report),
      "Question: " + report.prompt,
      "Feedback: " + report.feedback,
    ].join("\n")).join("\n\n------------------------------\n\n");
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedId("all");
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <section className="qb-feedback-page">
      <header className="qb-feedback-page-header">
        <div>
          <div className="eyebrow">WEBMASTER · QUESTION QUALITY</div>
          <h1>Question feedback reports</h1>
          <p className="subheading">Review learner-submitted issues and suggested corrections from Practice, Exam Simulator, CAT, and Readiness exams.</p>
        </div>
        <div className="qb-feedback-toolbar">
          <button type="button" className="button secondary" onClick={onRefresh} disabled={!onRefresh || loading}>
            <RefreshCw size={15}/> Refresh
          </button>
          <button type="button" className="button primary" onClick={() => void copyAll()} disabled={!reports.length}>
            <ClipboardCopy size={15}/> {copiedId === "all" ? "Copied all" : "Copy all reports"}
          </button>
        </div>
      </header>

      <div className="qb-feedback-summary">
        <strong>{reports.length}</strong>
        <span>submitted report{reports.length === 1 ? "" : "s"}</span>
        <span className="qb-feedback-summary-note">Reports are retained for webmaster review.</span>
      </div>

      {loadError && <div className="qb-feedback-error" role="alert">{loadError}</div>}
      {loading ? <div className="qb-feedback-empty">Loading submitted reports…</div>
        : reports.length === 0 ? (
          <div className="qb-feedback-empty">
            <MessageSquareWarning size={25}/>
            <strong>No question feedback reports yet</strong>
            <span>Use “Report question feedback” from a question in any exam or practice session.</span>
          </div>
        ) : (
          <div className="qb-feedback-list">
            {reports.map((report) => (
              <article className="qb-feedback-item" key={report.id}>
                <div className="qb-feedback-item-head">
                  <div>
                    <strong>{report.questionId}</strong>
                    <span>{report.itemType || "Question"} · {report.topic || "Uncategorized"} · {report.mode || "Practice"}</span>
                  </div>
                  <button type="button" className="button secondary" onClick={() => void copyReport(report)}>
                    <ClipboardCopy size={14}/>{copiedId === report.id ? "Copied" : "Copy report"}
                  </button>
                </div>
                <div className="qb-feedback-question">
                  <span>QUESTION</span>
                  <p>{report.prompt}</p>
                </div>
                <div className="qb-feedback-message">
                  <span>REPORTED ISSUE / SUGGESTED CORRECTION</span>
                  <p>{report.feedback}</p>
                </div>
                <footer>
                  <span>{report.reporterEmail || "Learner"}</span>
                  <span>{reportDate(report)}</span>
                  <b>{report.status || "new"}</b>
                </footer>
              </article>
            ))}
          </div>
        )}
    </section>
  );
}

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CalendarClock, CheckCircle2, Circle, Clock3, FileCheck2, Gauge, Layers3, ShieldCheck, Sparkles, Target } from "lucide-react";
import type { Question } from "./questions";

type Props = {
  questions: Question[];
  authoredReplacementCount: number;
  boosterCount?: number;
};

const CORE_TARGET = 3000;
const BOOSTER_TARGET = 600;
const TOTAL_TARGET = CORE_TARGET + BOOSTER_TARGET;

function addWeeks(date: Date, weeks: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + Math.ceil(weeks * 7));
  return next;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function QuestionBankAutomationTracker({
  questions,
  authoredReplacementCount,
  boosterCount = 0,
}: Props) {
  const [pace, setPace] = useState(100);
  const uniqueQuestions = useMemo(
    () => [...new Map(questions.map((question) => [question.id, question])).values()],
    [questions],
  );
  const coreCount = uniqueQuestions.length;
  const clinicalReviewed = uniqueQuestions.filter(
    (question) => question.reviewMetadata?.status === "clinically-verified",
  ).length;
  const remainingCore = Math.max(0, CORE_TARGET - coreCount);
  const remainingBooster = Math.max(0, BOOSTER_TARGET - boosterCount);
  const remainingTotal = remainingCore + remainingBooster;
  const overall = Math.min(TOTAL_TARGET, coreCount + boosterCount);
  const percentage = Math.min(100, (overall / TOTAL_TARGET) * 100);
  const weeks = remainingTotal / pace;
  const projectedDate = addWeeks(new Date(), weeks);
  const startDate = new Date();
  const coreWeeks = remainingCore / pace;
  const coreDate = addWeeks(startDate, coreWeeks);
  const boosterDate = addWeeks(startDate, weeks);
  const chartWidth = 720;
  const chartHeight = 190;
  const plotLeft = 42;
  const plotRight = 690;
  const plotTop = 18;
  const plotBottom = 150;
  const milestoneCoreX = plotLeft + (remainingCore / Math.max(1, remainingTotal)) * (plotRight - plotLeft);
  const targetX = plotRight;
  const projectedY = (value: number) => plotBottom - (value / TOTAL_TARGET) * (plotBottom - plotTop);
  const actualY = projectedY(overall);
  const coreProgress = Math.min(100, (coreCount / CORE_TARGET) * 100);
  const boosterProgress = Math.min(100, (boosterCount / BOOSTER_TARGET) * 100);
  const reviewedProgress = coreCount ? (clinicalReviewed / coreCount) * 100 : 0;

  return (
    <section className="qb-automation">
      <div className="qb-automation-heading">
        <div>
          <div className="eyebrow">WEBMASTER · CONTENT OPERATIONS</div>
          <h1>Question bank automation</h1>
          <p className="subheading">Runtime inventory snapshot, quality gates, and a transparent forecast toward 3,600 distinct questions.</p>
        </div>
        <span className="qb-live-pill"><span /> Runtime snapshot</span>
      </div>

      <div className="qb-kpi-grid">
        <article className="qb-kpi-card">
          <div className="qb-kpi-icon purple"><Layers3 size={18} /></div>
          <strong>{overall.toLocaleString()} <small>/ 3,600</small></strong>
          <span>Distinct questions in inventory</span>
          <div className="qb-mini-track"><i style={{ width: percentage + "%" }} /></div>
          <em>{percentage.toFixed(1)}% of target inventory</em>
        </article>
        <article className="qb-kpi-card">
          <div className="qb-kpi-icon blue"><Target size={18} /></div>
          <strong>{coreCount.toLocaleString()} <small>/ 3,000</small></strong>
          <span>Core bank items</span>
          <div className="qb-mini-track"><i style={{ width: coreProgress + "%" }} /></div>
          <em>{remainingCore.toLocaleString()} core items remaining</em>
        </article>
        <article className="qb-kpi-card">
          <div className="qb-kpi-icon orange"><Sparkles size={18} /></div>
          <strong>{boosterCount.toLocaleString()} <small>/ 600</small></strong>
          <span>Booster items</span>
          <div className="qb-mini-track"><i style={{ width: boosterProgress + "%" }} /></div>
          <em>{remainingBooster.toLocaleString()} Booster items remaining</em>
        </article>
        <article className="qb-kpi-card">
          <div className="qb-kpi-icon green"><ShieldCheck size={18} /></div>
          <strong>{clinicalReviewed.toLocaleString()}</strong>
          <span>Clinically verified items</span>
          <div className="qb-mini-track"><i style={{ width: reviewedProgress + "%" }} /></div>
          <em>{authoredReplacementCount} authored replacements are included in the inventory count</em>
        </article>
      </div>

      <article className="dashboard-card qb-forecast-card">
        <div className="qb-card-title-row">
          <div>
            <div className="eyebrow">PROJECTED DELIVERY</div>
            <h2>When can we reach 3,600?</h2>
            <p>Adjust the planned production rate to see a scenario forecast. This is a planning estimate, not a committed delivery date.</p>
          </div>
          <div className="qb-date-chip"><CalendarClock size={17} /><div><strong>{formatDate(projectedDate)}</strong><span>Projected completion</span></div></div>
        </div>
        <div className="qb-pace-control">
          <label htmlFor="qb-pace">Planned net-new items per week</label>
          <strong>{pace} <small>items / week</small></strong>
          <input id="qb-pace" type="range" min="25" max="250" step="25" value={pace} onChange={(event) => setPace(Number(event.target.value))} />
          <div className="qb-pace-scale"><span>25 / week</span><span>250 / week</span></div>
        </div>
        <div className="qb-chart-wrap">
          <div className="qb-chart-caption"><span>Inventory growth projection</span><span>{Math.ceil(weeks)} weeks at selected pace</span></div>
          <svg className="qb-projection-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`Projection from ${overall} current questions to 3600 questions in ${Math.ceil(weeks)} weeks`}>
            {[0, 1200, 2400, 3600].map((tick) => {
              const y = projectedY(tick);
              return <g key={tick}><line x1={plotLeft} x2={plotRight} y1={y} y2={y} className="qb-gridline" /><text x={plotLeft - 9} y={y + 4} textAnchor="end" className="qb-axis-label">{tick.toLocaleString()}</text></g>;
            })}
            <line x1={plotLeft} x2={plotRight} y1={plotBottom} y2={plotBottom} className="qb-axis-line" />
            <line x1={milestoneCoreX} x2={milestoneCoreX} y1={plotTop} y2={plotBottom} className="qb-milestone-line" />
            <path d={`M ${plotLeft} ${projectedY(overall)} L ${plotRight} ${projectedY(TOTAL_TARGET)}`} className="qb-projection-line" />
            
            <circle cx={plotLeft} cy={actualY} r="5" className="qb-current-dot" />
            <circle cx={milestoneCoreX} cy={projectedY(CORE_TARGET)} r="5" className="qb-core-dot" />
            <circle cx={targetX} cy={projectedY(TOTAL_TARGET)} r="6" className="qb-target-dot" />
            <text x={plotLeft} y={chartHeight - 13} className="qb-axis-label">Now</text>
            <text x={milestoneCoreX} y={chartHeight - 13} textAnchor="middle" className="qb-axis-label">3,000 core</text>
            <text x={plotRight} y={chartHeight - 13} textAnchor="end" className="qb-axis-label">3,600 total</text>
            <text x={plotLeft + 10} y={actualY - 12} className="qb-chart-note">Actual: {overall.toLocaleString()}</text>
          </svg>
          <div className="qb-chart-legend"><span><i className="actual" /> Current inventory</span><span><i className="forecast" /> Forecast path</span><span><i className="milestone" /> Core milestone</span></div>
        </div>
        <div className="qb-milestone-row">
          <div><span className="qb-milestone-icon"><CheckCircle2 size={16} /></span><div><strong>Core bank · 3,000 items</strong><span>{formatDate(coreDate)} · {remainingCore.toLocaleString()} items remaining</span></div></div>
          <div><span className="qb-milestone-icon"><Target size={16} /></span><div><strong>Full bank · 3,600 items</strong><span>{formatDate(boosterDate)} · Core plus 600 Booster items</span></div></div>
        </div>
      </article>

      <div className="qb-operations-grid">
        <article className="dashboard-card qb-ops-card">
          <div className="eyebrow">AUTOMATED WORKFLOW</div>
          <h2>How each batch moves</h2>
          <ol className="qb-pipeline-list">
            <li className="done"><span><CheckCircle2 size={16} /></span><div><strong>Generate original questions</strong><p>Daily scheduled authoring cycle: 20 new items per run, preserving the blueprint and item schema.</p></div></li>
            <li className="done"><span><CheckCircle2 size={16} /></span><div><strong>Run structural and duplicate checks</strong><p>Current CI audit checks IDs, metadata, and runtime integration; deeper clinical and semantic-duplicate audits remain on the roadmap.</p></div></li>
            <li className="active"><span><Activity size={16} /></span><div><strong>Run tests and production build</strong><p>Reject broken batches; retain logs and retry safe technical failures.</p></div></li>
            <li><span><Circle size={16} /></span><div><strong>Integrate and update inventory</strong><p>Commit a versioned batch, update the runtime bank, and refresh this tracker.</p></div></li>
            <li><span><Circle size={16} /></span><div><strong>Clinical review gate</strong><p>Keep generated items clearly labeled until qualified review is recorded.</p></div></li>
          </ol>
        </article>
        <article className="dashboard-card qb-ops-card">
          <div className="eyebrow">QUALITY & CONTROL</div>
          <h2>Release safeguards</h2>
          <div className="qb-quality-row"><FileCheck2 size={17} /><div><strong>Automated authoring audit</strong><span>Connected to the CI workflow</span></div><b className="qb-status-chip">Enabled</b></div>
          <div className="qb-quality-row"><Gauge size={17} /><div><strong>Test and build gate</strong><span>Every change must pass automated checks</span></div><b className="qb-status-chip">Required</b></div>
          <div className="qb-quality-row"><ShieldCheck size={17} /><div><strong>Clinical verification</strong><span>{clinicalReviewed} of {coreCount} inventory items recorded as verified</span></div><b className="qb-status-chip warning">Human gate</b></div>
          <div className="qb-quality-row"><Clock3 size={17} /><div><strong>Unattended execution</strong><span>Daily ChatGPT task scheduled for 08:00 Asia/Manila; GitHub access remains required</span></div><b className="qb-status-chip">Scheduled</b></div>
          <div className="qb-automation-note"><AlertTriangle size={16} /><p>Generated content is not clinically approved by passing CI. Clinical review remains a separate release-quality decision.</p></div>
        </article>
      </div>
      <p className="qb-tracker-footnote">Counts are deduplicated by question ID from the runtime inventory. Authored replacements do not increase the count. Booster count remains zero until a separate, non-overlapping Booster inventory is integrated.</p>
    </section>
  );
}

import type { CSSProperties } from "react";
import { ArrowRight, BookOpen, Brain, CheckCircle2, ClipboardCheck, Clock3, Flame, Play, Sparkles, Target } from "lucide-react";

type StudentHomeProps = {
  questionCount: number;
  completedCount: number;
  accuracy: number;
  savedCount: number;
  activeDays: number;
  studyMinutes: number;
  weakestCategory: string | null;
  assessmentTrend: { id: string; label: string; mode: string; score: number }[];
  onNavigate: (page: "progress" | "saved") => void;
  onPractice: () => void;
  onSimulator: () => void;
  onCat: () => void;
  onReadiness: () => void;
};

function AssessmentTrend({ points }: { points: StudentHomeProps["assessmentTrend"] }) {
  const width = 420;
  const height = 142;
  const left = 12;
  const right = 408;
  const top = 18;
  const bottom = 112;
  const coordinates = points.map((point, index) => ({
    x: points.length < 2 ? (left + right) / 2 : left + index * (right - left) / (points.length - 1),
    y: bottom - Math.max(0, Math.min(100, point.score)) / 100 * (bottom - top),
    ...point,
  }));
  const line = coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = coordinates.length ? `${line} L ${coordinates[coordinates.length - 1].x} ${bottom} L ${coordinates[0].x} ${bottom} Z` : "";
  const latest = points[points.length - 1];

  return <section className="student-trend" aria-label="Assessment score trend">
    <div className="student-trend-heading"><div><span>YOUR PROGRESS</span><strong>Assessment trend</strong></div>{latest ? <div className="student-trend-latest"><strong>{latest.score}%</strong><small>Latest score</small></div> : <span className="student-trend-empty-tag">Ready when you are</span>}</div>
    {points.length ? <div className="student-trend-plot">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Assessment scores: ${points.map(point => `${point.label} ${point.score} percent`).join(", ")}`} preserveAspectRatio="none">
        <defs><linearGradient id="studentTrendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b9b3ff" stopOpacity=".34"/><stop offset="100%" stopColor="#b9b3ff" stopOpacity="0"/></linearGradient><linearGradient id="studentTrendLine" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="#aaa3ff"/><stop offset="100%" stopColor="#8ee1d0"/></linearGradient></defs>
        {[25,50,75,100].map(value => <g key={value}><line x1={left} x2={right} y1={bottom-value/100*(bottom-top)} y2={bottom-value/100*(bottom-top)} stroke="#ffffff" strokeOpacity=".12" strokeDasharray="3 6"/><text x="0" y={bottom-value/100*(bottom-top)+3} fill="#d6d5ef" fillOpacity=".62" fontSize="8">{value}</text></g>)}
        <path d={area} fill="url(#studentTrendFill)" className="student-trend-area"/>
        <path d={line} fill="none" stroke="url(#studentTrendLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="student-trend-line"/>
        {coordinates.map((point,index)=><circle key={point.id} cx={point.x} cy={point.y} r={index===coordinates.length-1?5:3.5} fill={index===coordinates.length-1?"#a8eadb":"#c9c4ff"} stroke="#343567" strokeWidth="2"><title>{point.label}: {point.score}% · {point.mode}</title></circle>)}
      </svg>
      <div className="student-trend-labels">{coordinates.map((point,index)=><span key={point.id} className={index===coordinates.length-1?"latest":""}>{point.label}</span>)}</div>
    </div> : <div className="student-trend-empty"><span className="student-trend-empty-line"/><p>Complete a CAT or readiness exam to see your score trend here.</p></div>}
  </section>;
}

export default function StudentHome(props: StudentHomeProps) {
  const progress = props.questionCount ? Math.min(100, Math.round(props.completedCount / props.questionCount * 100)) : 0;
  const hours = Math.floor(props.studyMinutes / 60);
  const minutes = props.studyMinutes % 60;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return <div className="student-home">
    <section className="student-hero">
      <div className="student-hero-copy">
        <div className="student-kicker"><Sparkles size={14}/> YOUR NCLEX LEARNING SPACE</div>
        <h1>{greeting}.<br/>Ready for your next step?</h1>
        <p>Build clinical confidence through deliberate practice, realistic cases, and feedback that helps you understand the why.</p>
        <div className="student-hero-actions">
          <button className="student-primary-action" onClick={props.onPractice}><Play size={16} fill="currentColor"/> Continue practicing</button>
          <button className="student-secondary-action" onClick={props.onSimulator}><ClipboardCheck size={16}/> Exam simulator</button>
        </div>
      </div>
      <AssessmentTrend points={props.assessmentTrend}/>
    </section>

    <section className="student-metrics" aria-label="Study overview">
      <article><span className="student-metric-icon violet"><BookOpen size={18}/></span><div><strong>{props.completedCount.toLocaleString()}</strong><span>Questions practiced</span></div><small>of {props.questionCount.toLocaleString()}</small></article>
      <article><span className="student-metric-icon mint"><CheckCircle2 size={18}/></span><div><strong>{props.accuracy}%</strong><span>Practice accuracy</span></div><small>Based on answered items</small></article>
      <article><span className="student-metric-icon amber"><Flame size={18}/></span><div><strong>{props.activeDays}</strong><span>Active study days</span></div><small>Recorded exam sessions</small></article>
      <article><span className="student-metric-icon blue"><Clock3 size={18}/></span><div><strong>{hours}h {minutes}m</strong><span>Recorded study time</span></div><small>Completed examinations</small></article>
    </section>

    <div className="student-section-heading"><div><span>YOUR NEXT MOVE</span><h2>Choose how you want to learn</h2></div></div>
    <section className="student-learning-grid">
      <button className="student-learning-card featured" onClick={props.onPractice}>
        <span className="student-card-icon"><BookOpen size={21}/></span><span className="student-card-label">BUILD KNOWLEDGE</span><strong>Question bank</strong><p>Practice by topic, review detailed rationales, and save questions that deserve another look.</p><div className="student-bank-coverage"><div><span>Bank coverage</span><strong>{progress}%</strong></div><i><b style={{width:progress+"%"}}/></i></div><span className="student-card-link">Explore questions <ArrowRight size={15}/></span>
      </button>
      <button className="student-learning-card" onClick={props.onCat}>
        <span className="student-card-icon"><Brain size={21}/></span><span className="student-card-label">ADAPTIVE PRACTICE</span><strong>CAT assessment</strong><p>Work through an adaptive practice assessment and review how your performance changes.</p><span className="student-card-link">Start CAT <ArrowRight size={15}/></span>
      </button>
      <button className="student-learning-card" onClick={props.onReadiness}>
        <span className="student-card-icon"><Target size={21}/></span><span className="student-card-label">CHECK YOUR PROGRESS</span><strong>Readiness exam</strong><p>Complete a timed assessment and identify the areas that need more focused review.</p><span className="student-card-link">Start assessment <ArrowRight size={15}/></span>
      </button>
    </section>
    <div className="student-dashboard-disclaimer">QuickRN practice assessments are educational tools, not official NCLEX examinations or validated pass predictions.</div>
  </div>;
}

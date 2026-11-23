import type { CSSProperties } from "react";
import { Activity, ArrowRight, BookOpen, Brain, CalendarDays, ChartNoAxesCombined, CheckCircle2, ClipboardCheck, Clock3, Flame, Layers3, NotebookPen, Play, Sparkles, Stethoscope, Target } from "lucide-react";

type StudentHomeProps = {
  questionCount: number;
  completedCount: number;
  accuracy: number;
  savedCount: number;
  activeDays: number;
  studyMinutes: number;
  weakestCategory: string | null;
  onNavigate: (page: "practice" | "progress" | "history" | "calendar" | "saved") => void;
  onPractice: () => void;
  onSimulator: () => void;
  onCat: () => void;
  onReadiness: () => void;
};

const judgmentSteps = [
  "Recognize cues",
  "Analyze cues",
  "Prioritize hypotheses",
  "Generate solutions",
  "Take action",
  "Evaluate outcomes",
];

export default function StudentHome(props: StudentHomeProps) {
  const progress = props.questionCount ? Math.min(100, Math.round(props.completedCount / props.questionCount * 100)) : 0;
  const hours = Math.floor(props.studyMinutes / 60);
  const minutes = props.studyMinutes % 60;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return <div className="student-home">
    <section className="student-hero">
      <div className="student-hero-copy">
        <div className="student-kicker"><Sparkles size={14}/> YOUR NCLEX LEARNING SPACE</div>
        <h1>{greeting}. Ready for your next step?</h1>
        <p>Build clinical confidence through deliberate practice, realistic cases, and feedback that helps you understand the why.</p>
        <div className="student-hero-actions">
          <button className="student-primary-action" onClick={props.onPractice}><Play size={16} fill="currentColor"/> Continue practicing</button>
          <button className="student-secondary-action" onClick={props.onSimulator}><ClipboardCheck size={16}/> Exam simulator</button>
        </div>
      </div>
      <div className="student-hero-progress">
        <div className="student-progress-ring" style={{"--progress": progress + "%"} as CSSProperties}>
          <div><strong>{progress}%</strong><span>BANK COVERAGE</span></div>
        </div>
        <span>{props.completedCount.toLocaleString()} of {props.questionCount.toLocaleString()} questions practiced</span>
      </div>
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
        <span className="student-card-icon"><BookOpen size={21}/></span><span className="student-card-label">BUILD KNOWLEDGE</span><strong>Question bank</strong><p>Practice by topic, review detailed rationales, and save questions that deserve another look.</p><span className="student-card-link">Explore questions <ArrowRight size={15}/></span>
      </button>
      <button className="student-learning-card" onClick={props.onCat}>
        <span className="student-card-icon"><Brain size={21}/></span><span className="student-card-label">ADAPTIVE PRACTICE</span><strong>CAT assessment</strong><p>Work through an adaptive practice assessment and review how your performance changes.</p><span className="student-card-link">Start CAT <ArrowRight size={15}/></span>
      </button>
      <button className="student-learning-card" onClick={props.onReadiness}>
        <span className="student-card-icon"><Target size={21}/></span><span className="student-card-label">CHECK YOUR PROGRESS</span><strong>Readiness exam</strong><p>Complete a timed assessment and identify the areas that need more focused review.</p><span className="student-card-link">Start assessment <ArrowRight size={15}/></span>
      </button>
    </section>

    <div className="student-lower-grid">
      <section className="student-panel student-focus-panel">
        <div className="student-panel-heading"><div><span>PERSONALIZED FOCUS</span><h2>Your next review priority</h2></div><Stethoscope size={20}/></div>
        {props.weakestCategory ? <><p>Your lowest-scoring assessment category is:</p><strong className="student-focus-topic">{props.weakestCategory}</strong><button onClick={()=>props.onNavigate("progress")}>Review performance <ArrowRight size={15}/></button></> : <><p>Complete a CAT or readiness assessment to identify your lowest-performing category.</p><button onClick={props.onReadiness}>Take a readiness exam <ArrowRight size={15}/></button></>}
        <div className="student-focus-divider"/>
        <div className="student-mini-stat"><span>Questions saved for review</span><strong>{props.savedCount}</strong></div>
        <button className="student-inline-link" onClick={()=>props.onNavigate("saved")}>Open your notebook <ArrowRight size={14}/></button>
      </section>

      <section className="student-panel">
        <div className="student-panel-heading"><div><span>NGN CLINICAL JUDGMENT</span><h2>Think like a nurse</h2></div><Layers3 size={20}/></div>
        <p>Use the six clinical judgment functions as a framework when working through unfolding patient cases.</p>
        <div className="student-judgment-steps">{judgmentSteps.map((step,index)=><div key={step}><span>{index+1}</span><strong>{step}</strong></div>)}</div>
        <button className="student-inline-link" onClick={props.onPractice}>Practice clinical questions <ArrowRight size={14}/></button>
      </section>
    </div>

    <section className="student-quick-links">
      <button onClick={()=>props.onNavigate("progress")}><ChartNoAxesCombined size={18}/><span><strong>My performance</strong><small>Track progress by category</small></span><ArrowRight size={16}/></button>
      <button onClick={()=>props.onNavigate("history")}><Activity size={18}/><span><strong>Exam history</strong><small>Review completed sessions</small></span><ArrowRight size={16}/></button>
      <button onClick={()=>props.onNavigate("calendar")}><CalendarDays size={18}/><span><strong>Study calendar</strong><small>See your study activity</small></span><ArrowRight size={16}/></button>
      <button onClick={()=>props.onNavigate("saved")}><NotebookPen size={18}/><span><strong>My notebook</strong><small>{props.savedCount} saved questions</small></span><ArrowRight size={16}/></button>
    </section>
    <div className="student-dashboard-disclaimer">QuickRN practice assessments are educational tools, not official NCLEX examinations or validated pass predictions.</div>
  </div>;
}

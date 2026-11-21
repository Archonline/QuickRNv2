import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";
import { Activity, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, CircleHelp, Clock3, Flame, GraduationCap, LayoutDashboard, Search, ShieldCheck, Target, X } from "lucide-react";
import { questions } from "./questions";

const categories = ["All topics", ...Array.from(new Set(questions.map((q) => q.category)))];

export default function App() {
  const [active, setActive] = useState("All topics");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const { user, logOut } = useAuth();

  useEffect(() => {
    let active = true;
    async function loadProgress() {
      if (!user || !db) { setProgressLoaded(true); return; }
      try {
        const snapshot = await getDoc(doc(db, "users", user.uid, "progress", "default"));
        if (active && snapshot.exists()) {
          const ids = snapshot.data().completedQuestionIds;
          if (Array.isArray(ids)) setCompleted(ids.filter((id): id is string => typeof id === "string"));
        }
      } catch (error) { console.error("Could not load learning progress", error); }
      finally { if (active) setProgressLoaded(true); }
    }
    setProgressLoaded(false); void loadProgress();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!user || !db || !progressLoaded) return;
    void setDoc(doc(db, "users", user.uid, "progress", "default"), {
      completedQuestionIds: completed, updatedAt: serverTimestamp()
    }, { merge: true }).catch(error => console.error("Could not save learning progress", error));
  }, [user, completed, progressLoaded]);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => questions.filter((q) =>
    (active === "All topics" || q.category === active) &&
    (q.prompt.toLowerCase().includes(query.toLowerCase()) || q.topic.toLowerCase().includes(query.toLowerCase()))
  ), [active, query]);
  const question = filtered[index];
  const correct = question ? selected === question.answer : false;

  function changeCategory(category: string) { setActive(category); setIndex(0); setSelected(null); setRevealed(false); }
  function next() { setIndex((n) => (n + 1) % filtered.length); setSelected(null); setRevealed(false); }
  function previous() { setIndex((n) => (n - 1 + filtered.length) % filtered.length); setSelected(null); setRevealed(false); }
  function checkAnswer() {
    if (selected === null || !question) return;
    setRevealed(true);
    if (!completed.includes(question.id)) setCompleted((items) => [...items, question.id]);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={22}/></div><span>quick<span className="brand-light">rn</span></span><span className="beta">BETA</span></div>
      <div className="side-label">LEARN</div>
      <button className="nav-item active"><LayoutDashboard size={18}/> Dashboard</button>
      <button className="nav-item" onClick={() => document.getElementById("practice")?.scrollIntoView({behavior:"smooth"})}><BookOpen size={18}/> Practice questions</button>
      <button className="nav-item" onClick={() => changeCategory("All topics")}><GraduationCap size={18}/> Study topics</button>
      <div className="side-label spaced">YOUR PROGRESS</div>
      <div className="progress-card"><div className="progress-icon"><Target size={17}/></div><div><strong>{completed.length} / {questions.length}</strong><span>Questions completed</span></div></div>
      <div className="sidebar-bottom"><div className="help-icon"><CircleHelp size={17}/></div><div><strong>Keep learning</strong><span>Small steps add up.</span></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Learning space <span>/</span> <b>Dashboard</b></div><div className="top-right"><span className="status-dot"></span><span>{user?.email ?? "Learner account"}</span><button className="auth-logout" onClick={() => void logOut()}>Sign out</button><div className="avatar">{(user?.email?.[0] ?? "S").toUpperCase()}</div></div></header>
      <div className="content-wrap">
        <div className="welcome-row"><div><div className="eyebrow">YOUR NCLEX STUDY SPACE</div><h1>Build confidence, one question at a time.</h1><p className="subheading">Focused practice to help you strengthen clinical judgment and prepare with purpose.</p></div><div className="welcome-icon"><GraduationCap size={34}/></div></div>

        <div className="notice"><ShieldCheck size={18}/><div><strong>Development question set</strong><span>These sample items are for interface testing and learning-flow development only. They have not been clinically validated and are not an official NCLEX resource.</span></div></div>

        <section className="stats-grid">
          <div className="stat-card"><div className="stat-icon purple"><BookOpen size={19}/></div><div className="stat-number">{questions.length}</div><div className="stat-label">Sample questions</div><div className="stat-foot">Across {categories.length - 1} topic areas</div></div>
          <div className="stat-card"><div className="stat-icon green"><Check size={19}/></div><div className="stat-number">{completed.length}</div><div className="stat-label">Completed</div><div className="stat-foot">Keep your momentum going</div></div>
          <div className="stat-card"><div className="stat-icon orange"><Flame size={19}/></div><div className="stat-number">{completed.length ? "Active" : "Start"}</div><div className="stat-label">Study streak</div><div className="stat-foot">Build a consistent routine</div></div>
          <div className="stat-card"><div className="stat-icon blue"><Clock3 size={19}/></div><div className="stat-number">5–10</div><div className="stat-label">Daily minutes</div><div className="stat-foot">A little practice each day</div></div>
        </section>

        <section className="practice-section" id="practice">
          <div className="section-heading"><div><div className="eyebrow">PRACTICE MODE</div><h2>Question practice</h2><p>Choose a topic, think it through, then review the rationale.</p></div><div className="question-count">{filtered.length} items</div></div>
          <div className="practice-panel">
            <div className="filter-row"><div className="tabs">{categories.map((c) => <button key={c} className={active === c ? "tab selected" : "tab"} onClick={() => changeCategory(c)}>{c}</button>)}</div><div className="search-box"><Search size={16}/><input value={query} onChange={(e) => {setQuery(e.target.value);setIndex(0);setSelected(null);setRevealed(false);}} placeholder="Search questions"/></div></div>
            {question ? <>
              <div className="question-meta"><span className="tag">{question.category}</span><span className="tag muted">{question.difficulty}</span><span className="meta-topic">{question.topic}</span><span className="spacer"></span><span className="meta-number">Question {index + 1} of {filtered.length}</span></div>
              <h3 className="question-title">{question.prompt}</h3>
              <div className="answer-list">{question.options.map((option, i) => {
                const isCorrect = revealed && i === question.answer;
                const isWrong = revealed && selected === i && i !== question.answer;
                return <button key={option} disabled={revealed} onClick={() => setSelected(i)} className={`answer-option ${selected === i ? "chosen" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}>
                  <span className="option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span>{isCorrect && <Check size={18} className="answer-check"/>}{isWrong && <X size={18} className="answer-x"/>}
                </button>;
              })}</div>
              {revealed && <div className={`rationale ${correct ? "good" : "review"}`}><div className="rationale-title">{correct ? "That's correct" : "Review this answer"} <span>{correct ? <Check size={16}/> : <BookOpen size={16}/>}</span></div><p>{question.rationale}</p></div>}
              <div className="question-footer"><span className="footer-note">{revealed ? "Answer reviewed" : "Select one answer to continue"}</span><div className="footer-actions"><button className="button secondary" onClick={previous}><ChevronLeft size={17}/> Previous</button>{!revealed ? <button className="button primary" disabled={selected === null} onClick={checkAnswer}>Check answer <ArrowRight size={17}/></button> : <button className="button primary" onClick={next}>Next question <ChevronRight size={17}/></button>}</div></div>
            </> : <div className="empty-state"><Search size={24}/><strong>No matching questions</strong><span>Try another search term or topic.</span><button className="button secondary" onClick={() => {setQuery("");changeCategory("All topics");}}>Clear filters</button></div>}
          </div>
        </section>
        <footer className="footer">QuickRN <span>·</span> Learning platform in development <span>·</span> Sample content only</footer>
      </div>
    </main>
  </div>;
}
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { CalendarDays, CheckCircle2, ClipboardList, Save, Sparkles } from "lucide-react";
import type { User } from "firebase/auth";
import { db } from "./firebase";

type TopicScore = { category: string; accuracy: number; total: number };
type StudyDay = { day: string; topic: string; questions: number; focus: string };
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEFAULT_TARGET = 30;

function buildPlan(topics: TopicScore[], target: number): StudyDay[] {
  const ordered = [...topics].sort((a, b) => a.accuracy - b.accuracy);
  return DAYS.map((day, index) => {
    const topic = ordered.length ? ordered[index % Math.min(ordered.length, 4)] : undefined;
    return {
      day,
      topic: topic?.category ?? "Mixed review",
      questions: target,
      focus: topic ? topic.accuracy < 60 ? "Rebuild core concepts" : topic.accuracy < 80 ? "Target weak areas" : "Maintain mastery" : "Build a balanced routine"
    };
  });
}

export default function StudyPlannerPage({ user, topics }: { user: User | null; topics: TopicScore[] }) {
  const [plan, setPlan] = useState<StudyDay[]>([]);
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_TARGET);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const topicOptions = useMemo(() => topics.map(item => item.category), [topics]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const generated = buildPlan(topics, DEFAULT_TARGET);
      if (!user || !db) {
        if (active) { setPlan(generated); setLoading(false); setStatus("Sign in to save your study plan across devices."); }
        return;
      }
      try {
        const [preferences, savedPlan] = await Promise.all([
          getDoc(doc(db, "users", user.uid, "settings", "preferences")),
          getDoc(doc(db, "users", user.uid, "studyPlans", "current"))
        ]);
        const goal = Number(preferences.data()?.dailyGoal);
        const target = [10, 20, 30, 50, 75].includes(goal) ? goal : DEFAULT_TARGET;
        if (active) {
          setDailyGoal(target);
          const savedDays = savedPlan.data()?.days;
          if (Array.isArray(savedDays) && savedDays.length === 7) {
            setPlan(savedDays.map((day, index) => ({
              day: DAYS[index],
              topic: typeof day.topic === "string" ? day.topic : generated[index].topic,
              questions: [10, 20, 30, 50, 75].includes(Number(day.questions)) ? Number(day.questions) : target,
              focus: typeof day.focus === "string" ? day.focus : generated[index].focus
            })));
            setStatus("Your saved weekly plan is loaded.");
          } else {
            setPlan(generated.map(day => ({ ...day, questions: target })));
            setStatus("A starter plan has been created from your assessment performance.");
          }
        }
      } catch (error) {
        console.error("Study plan load failed", error);
        if (active) { setPlan(generated); setStatus("Could not load your saved plan. You can still build a plan in this session."); }
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [user, topics]);

  function updateDay(index: number, patch: Partial<StudyDay>) {
    setPlan(current => current.map((day, i) => i === index ? { ...day, ...patch } : day));
    setStatus("You have unsaved changes.");
  }
  function regenerate() {
    setPlan(buildPlan(topics, dailyGoal));
    setStatus("Plan refreshed using your lowest-scoring assessment topics.");
  }
  async function save() {
    if (!user || !db) { setStatus("Sign in and configure Firebase to save your plan."); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid, "studyPlans", "current"), {
        days: plan.map(({ day, topic, questions, focus }) => ({ day, topic, questions, focus })),
        updatedAt: serverTimestamp()
      }, { merge: true });
      setStatus("Weekly study plan saved to your account.");
    } catch (error) {
      console.error("Study plan save failed", error);
      setStatus("Could not save your plan. Check your connection and Firestore rules.");
    } finally { setSaving(false); }
  }

  const totalQuestions = plan.reduce((sum, day) => sum + day.questions, 0);
  return <section className="study-planner-page">
    <div className="eyebrow">YOUR PERSONAL STUDY ROUTINE</div>
    <div className="study-planner-heading"><div><h1>Study planner</h1><p className="subheading">Turn your assessment results into a practical weekly review schedule.</p></div><div className="study-planner-icon"><CalendarDays size={28}/></div></div>
    <div className="study-plan-summary">
      <div><span>Weekly target</span><strong>{totalQuestions} questions</strong></div>
      <div><span>Daily baseline</span><strong>{dailyGoal} questions</strong></div>
      <div><span>Topics available</span><strong>{topics.length}</strong></div>
    </div>
    {topics.length === 0 && <div className="notice"><Sparkles size={18}/><div><strong>Start with a balanced review</strong><span>Complete a CAT or Readiness Exam to personalize this plan using category performance.</span></div></div>}
    <div className="study-plan-toolbar"><div><h2><ClipboardList size={18}/> Your week</h2><p>Adjust the focus and question target for each day.</p></div><div><button className="button secondary" onClick={regenerate} disabled={loading}><Sparkles size={15}/> Regenerate plan</button><button className="button primary" onClick={()=>void save()} disabled={loading||saving||!user||!db}><Save size={15}/>{saving?"Saving…":"Save plan"}</button></div></div>
    {loading ? <div className="analytics-empty">Loading your study plan…</div> : <div className="study-plan-days">{plan.map((day,index)=><article className="study-day-card" key={day.day}>
      <div className="study-day-top"><span>{day.day}</span><small>{day.focus}</small></div>
      <label>Review topic<select value={day.topic} onChange={event=>updateDay(index,{topic:event.target.value})}><option value="Mixed review">Mixed review</option>{topicOptions.map(topic=><option value={topic} key={topic}>{topic}</option>)}</select></label>
      <label>Question target<select value={day.questions} onChange={event=>updateDay(index,{questions:Number(event.target.value)})}><option value={10}>10 questions</option><option value={20}>20 questions</option><option value={30}>30 questions</option><option value={50}>50 questions</option><option value={75}>75 questions</option></select></label>
      <div className="study-day-footer"><span>{topics.find(topic=>topic.category===day.topic)?.accuracy !== undefined ? `Assessment accuracy: ${topics.find(topic=>topic.category===day.topic)?.accuracy}%` : "Balanced practice session"}</span><strong>{day.questions} Q</strong></div>
    </article>)}</div>}
    <div className="study-plan-note"><CheckCircle2 size={17}/><span>{status || "Your plan is a flexible guide. Update it as your learning needs change."}</span></div>
    <p className="study-plan-disclaimer">Topic suggestions are based on completed QuickRN practice assessments when available. They are study recommendations, not a clinical competency evaluation or a guarantee of NCLEX readiness.</p>
  </section>;
}

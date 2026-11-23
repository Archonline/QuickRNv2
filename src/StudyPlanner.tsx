import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowRight, BookOpen, CalendarCheck, CheckCircle2, ClipboardList, Flame, RotateCcw, Target } from "lucide-react";
import { db } from "./firebase";

type Props = {
  uid: string | null;
  priorityCategory: string | null;
  savedCount: number;
  missedCount: number;
  assessmentCount: number;
  onPractice: (category: string) => void;
  onNotebook: () => void;
  onHistory: () => void;
  onAssessment: () => void;
};

type Task = { id: string; title: string; detail: string; action: string; onClick: () => void; icon: typeof BookOpen };

function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export default function StudyPlanner(props: Props) {
  const [today] = useState(() => new Date());
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const key = dateKey(today);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoaded(false);
      if (!props.uid || !db) {
        setCompletedTasks([]);
        setDueCount(0);
        setLoaded(true);
        return;
      }
      try {
        const [plan, notebook] = await Promise.all([
          getDoc(doc(db, "users", props.uid, "studyPlans", key)),
          getDocs(collection(db, "users", props.uid, "studyNotebook")),
        ]);
        if (!active) return;
        const checked = plan.exists() ? plan.data().completedTaskIds : [];
        setCompletedTasks(Array.isArray(checked) ? checked.filter((id): id is string => typeof id === "string") : []);
        const due = notebook.docs.filter(entry => {
          const dueAt = entry.data().dueAt;
          return !Number.isFinite(dueAt) || dueAt <= Date.now();
        }).length;
        setDueCount(due);
      } catch (error) {
        console.error("Study plan failed to load", error);
      } finally {
        if (active) setLoaded(true);
      }
    }
    void load();
    return () => { active = false; };
  }, [props.uid, key]);

  const tasks = useMemo<Task[]>(() => {
    const priority = props.priorityCategory;
    const result: Task[] = [{
      id: "targeted-practice",
      title: priority ? "Practice your priority category" : "Build your baseline",
      detail: priority ? "Complete a focused set in " + priority + "." : "Complete a short practice set to establish your first performance baseline.",
      action: "Start focused practice",
      onClick: () => props.onPractice(priority ?? "All topics"),
      icon: Target,
    }];
    if (props.savedCount > 0 || dueCount > 0) result.push({
      id: "spaced-review",
      title: "Review your notebook",
      detail: dueCount > 0 ? dueCount + " saved question(s) are due for review." : props.savedCount + " saved question(s) are ready for active recall.",
      action: "Open notebook",
      onClick: props.onNotebook,
      icon: BookOpen,
    });
    if (props.missedCount > 0) result.push({
      id: "missed-review",
      title: "Revisit missed assessment questions",
      detail: props.missedCount + " recent response(s) need another look. Read the rationale and identify the cue you missed.",
      action: "Review exam history",
      onClick: props.onHistory,
      icon: ClipboardList,
    });
    result.push({
      id: "timed-assessment",
      title: "Complete a timed assessment",
      detail: props.assessmentCount > 0 ? "Check your progress with another timed practice session." : "Try your first timed assessment when you are ready.",
      action: "Start assessment",
      onClick: props.onAssessment,
      icon: CalendarCheck,
    });
    return result;
  }, [props.priorityCategory, props.savedCount, props.missedCount, props.assessmentCount, dueCount, props.onPractice, props.onNotebook, props.onHistory, props.onAssessment]);

  async function toggleTask(id: string) {
    const next = completedTasks.includes(id) ? completedTasks.filter(value => value !== id) : [...completedTasks, id];
    setCompletedTasks(next);
    if (!props.uid || !db) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", props.uid, "studyPlans", key), {
        dateKey: key,
        completedTaskIds: next,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error("Study plan save failed", error);
    } finally {
      setSaving(false);
    }
  }

  const completedCount = tasks.filter(task => completedTasks.includes(task.id)).length;
  const percent = tasks.length ? Math.round(completedCount / tasks.length * 100) : 0;

  return <section className="study-planner-page">
    <div className="study-planner-heading">
      <div><div className="eyebrow">A PLAN YOU CAN FOLLOW</div><h1>Your study plan</h1><p className="subheading">{today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · A focused set of actions based on your QuickRN activity.</p></div>
      <div className="study-plan-progress"><div><strong>{completedCount}/{tasks.length}</strong><span>Today's tasks</span></div><div className="study-plan-track"><i style={{ width: percent + "%" }}/></div><small>{percent}% complete</small></div>
    </div>
    {!props.uid && <div className="notice"><CalendarCheck size={18}/><div><strong>Sign in to save your plan</strong><span>Task checkmarks stay in this session when signed out. Sign in to sync daily completion to your account.</span></div></div>}
    <div className="study-plan-context"><div><Flame size={17}/><span><strong>{props.priorityCategory ?? "Your baseline"}</strong><small>{props.priorityCategory ? "Current priority from your assessment history" : "Complete an assessment to identify a priority category"}</small></span></div><div><RotateCcw size={17}/><span><strong>{dueCount}</strong><small>Notebook reviews due today</small></span></div><div><CheckCircle2 size={17}/><span><strong>{props.assessmentCount}</strong><small>Timed assessments completed</small></span></div></div>
    <div className="study-plan-list"><div className="study-plan-list-heading"><div><span>YOUR DAILY CHECKLIST</span><h2>Small steps, meaningful progress</h2></div><span>{saving ? "Saving…" : loaded ? "Progress saved" : "Loading plan…"}</span></div>
      {tasks.map((task, index) => { const Icon = task.icon; const done = completedTasks.includes(task.id); return <article className={"study-plan-task" + (done ? " is-complete" : "")} key={task.id}>
        <button type="button" className="study-plan-check" aria-label={(done ? "Mark incomplete: " : "Mark complete: ") + task.title} aria-pressed={done} onClick={() => void toggleTask(task.id)}><CheckCircle2 size={20}/></button>
        <div className="study-plan-task-icon"><Icon size={19}/></div>
        <div className="study-plan-task-copy"><span>STEP {index + 1}</span><h3>{task.title}</h3><p>{task.detail}</p><button type="button" className="study-plan-action" onClick={task.onClick}>{task.action} <ArrowRight size={14}/></button></div>
        {done && <span className="study-plan-done">Completed</span>}
      </article>; })}
    </div>
    <p className="study-plan-disclaimer">This plan is a practical study aid generated from your recorded activity. It is not an individualized clinical assessment or a validated NCLEX pass prediction. Adjust the workload to your schedule.</p>
  </section>;
}

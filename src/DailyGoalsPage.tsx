import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { CalendarCheck, Flame, Goal, TrendingUp } from "lucide-react";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import { loadDailyActivity, localDateKey, type DailyActivity } from "./studyActivity";

function shiftDate(key: string, offset: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day + offset);
  return localDateKey(date);
}
function countForDay(entry?: DailyActivity): number {
  return (Array.isArray(entry?.practiceQuestionIds) ? new Set(entry.practiceQuestionIds).size : 0) +
    (typeof entry?.examQuestionCount === "number" && Number.isFinite(entry.examQuestionCount) ? Math.max(0, Number(entry?.examQuestionCount)) : 0);
}
function streakLength(activity: DailyActivity[], today: string): number {
  const active = new Set(activity.filter(item => countForDay(item) > 0).map(item => item.dateKey));
  let cursor = active.has(today) ? today : shiftDate(today, -1);
  if (!active.has(cursor)) return 0;
  let streak = 0;
  while (active.has(cursor)) { streak += 1; cursor = shiftDate(cursor, -1); }
  return streak;
}

export default function DailyGoalsPage({ user }: { user: User | null }) {
  const [activity, setActivity] = useState<DailyActivity[]>([]);
  const [goal, setGoal] = useState(30);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      if (!user || !db) {
        if (active) { setActivity([]); setLoading(false); setStatus("Sign in to track daily activity and streaks across devices."); }
        return;
      }
      try {
        const [records, preferences] = await Promise.all([
          loadDailyActivity(user),
          getDoc(doc(db, "users", user.uid, "settings", "preferences"))
        ]);
        const storedGoal = Number(preferences.data()?.dailyGoal);
        if (active) {
          setActivity(records);
          setGoal([10,20,30,50,75].includes(storedGoal) ? storedGoal : 30);
          setStatus("Activity is counted from dated practice answers and submitted exams.");
        }
      } catch (error) {
        console.error("Unable to load daily study activity", error);
        if (active) setStatus("Daily activity could not be loaded. Check your connection and try again.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [user]);

  const metrics = useMemo(() => {
    const today = localDateKey();
    const byDate = new Map(activity.map(item => [item.dateKey, item]));
    const todayCount = countForDay(byDate.get(today));
    const week = Array.from({length:7}, (_, index) => {
      const dateKey = shiftDate(today, index - 6);
      const entry = byDate.get(dateKey);
      return { dateKey, count: countForDay(entry), label: new Date(Number(dateKey.slice(0,4)), Number(dateKey.slice(5,7))-1, Number(dateKey.slice(8,10))).toLocaleDateString(undefined,{weekday:"short"}) };
    });
    const weeklyCount = week.reduce((sum, day) => sum + day.count, 0);
    const bestStreak = (() => {
      const active = new Set(activity.filter(item => countForDay(item)>0).map(item=>item.dateKey));
      let best=0, run=0, previous="";
      for (const key of [...active].sort()) { run = previous && shiftDate(previous,1)===key ? run+1 : 1; best=Math.max(best,run); previous=key; }
      return best;
    })();
    return { todayCount, weeklyCount, streak: streakLength(activity,today), bestStreak, week };
  }, [activity]);

  const progress = Math.min(100, Math.round(metrics.todayCount / goal * 100));
  return <section className="daily-goals-page">
    <div className="eyebrow">CONSISTENCY BUILDS CONFIDENCE</div>
    <div className="daily-goals-heading"><div><h1>Daily goals & study streaks</h1><p className="subheading">See your real study activity and build a sustainable learning habit.</p></div><div className="daily-goals-icon"><Flame size={28}/></div></div>
    <div className="daily-goals-metrics">
      <article><span><Flame size={16}/> Current streak</span><strong>{metrics.streak} days</strong><small>{metrics.streak ? "Keep your momentum going" : "Complete a question today to start"}</small></article>
      <article><span><TrendingUp size={16}/> Best streak</span><strong>{metrics.bestStreak} days</strong><small>Your longest run of active study days</small></article>
      <article><span><CalendarCheck size={16}/> This week</span><strong>{metrics.weeklyCount}</strong><small>Questions answered or completed in exams</small></article>
    </div>
    <article className="daily-goal-card">
      <div className="daily-goal-card-head"><div><span className="eyebrow">TODAY'S TARGET</span><h2>{metrics.todayCount} of {goal} questions</h2></div><div className="daily-goal-percent">{progress}%</div></div>
      <div className="daily-goal-track"><i style={{width:progress+"%"}}/></div>
      <p>{metrics.todayCount >= goal ? "Daily goal reached. Excellent work!" : `${goal-metrics.todayCount} more questions to reach today's goal.`}</p>
    </article>
    <article className="daily-week-card"><div className="daily-week-head"><h2><Goal size={18}/> Last 7 days</h2><span>Daily activity</span></div>
      <div className="daily-week-bars">{metrics.week.map(day=><div className="daily-week-day" key={day.dateKey}><strong>{day.count}</strong><div className="daily-week-bar-track"><i style={{height:Math.max(day.count?8:3,Math.min(100,day.count/Math.max(goal,...metrics.week.map(item=>item.count))*100))+"%"}}/></div><span>{day.label}</span></div>)}</div>
    </article>
    <div className="daily-goals-footnote" role="status">{loading ? "Loading dated study activity…" : status} Daily totals combine unique practice questions answered and questions answered in submitted exams. Streaks use your device's local calendar date.</div>
  </section>;
}

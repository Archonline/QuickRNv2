import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Bell, BookOpen, Eye, RotateCcw, Save, ShieldCheck, UserRound } from "lucide-react";
import type { User } from "firebase/auth";
import { db } from "./firebase";

export type Preferences = {
  dailyGoal: number;
  defaultExamLength: number;
  showRationales: boolean;
  compactLayout: boolean;
  largerText: boolean;
  studyReminders: boolean;
};
export const defaultPreferences: Preferences = { dailyGoal: 30, defaultExamLength: 85, showRationales: true, compactLayout: false, largerText: false, studyReminders: false };
const allowedGoals = [10,20,30,50,75];
const allowedLengths = [20,60,85,150,600];
function normalize(value: Record<string, unknown>): Preferences {
  return {
    dailyGoal: allowedGoals.includes(Number(value.dailyGoal)) ? Number(value.dailyGoal) : defaultPreferences.dailyGoal,
    defaultExamLength: allowedLengths.includes(Number(value.defaultExamLength)) ? Number(value.defaultExamLength) : defaultPreferences.defaultExamLength,
    showRationales: typeof value.showRationales === "boolean" ? value.showRationales : defaultPreferences.showRationales,
    compactLayout: typeof value.compactLayout === "boolean" ? value.compactLayout : defaultPreferences.compactLayout,
    largerText: typeof value.largerText === "boolean" ? value.largerText : defaultPreferences.largerText,
    studyReminders: typeof value.studyReminders === "boolean" ? value.studyReminders : defaultPreferences.studyReminders
  };
}

export default function SettingsPage({ user, onDefaultExamLengthChange }: { user: User | null; onDefaultExamLengthChange?: (length: number) => void }) {
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError("");
      if (!user || !db) { if (active) { setLoading(false); setError("Sign in and configure Firebase to load account settings."); } return; }
      try {
        const snapshot = await getDoc(doc(db, "users", user.uid, "settings", "preferences"));
        const loaded = snapshot.exists() ? normalize(snapshot.data()) : defaultPreferences;
        if (active) {
          setPrefs(loaded);
          onDefaultExamLengthChange?.(loaded.defaultExamLength);
          document.documentElement.classList.toggle("qr-large-text", loaded.largerText);
          document.documentElement.classList.toggle("qr-compact-layout", loaded.compactLayout);
        }
      } catch (cause) {
        console.error("Unable to load learner settings", cause);
        if (active) setError("Could not load your settings from Firebase. Please try again.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [user, onDefaultExamLengthChange]);

  function update<K extends keyof Preferences>(field: K, value: Preferences[K]) {
    setPrefs(current => ({ ...current, [field]: value }));
    setSaved(false); setError("");
  }
  async function save() {
    if (!user || !db) { setError("Sign in and configure Firebase before saving settings."); return; }
    setSaving(true); setError("");
    try {
      await setDoc(doc(db, "users", user.uid, "settings", "preferences"), { ...prefs, updatedAt: serverTimestamp() }, { merge: true });
      document.documentElement.classList.toggle("qr-large-text", prefs.largerText);
      document.documentElement.classList.toggle("qr-compact-layout", prefs.compactLayout);
      onDefaultExamLengthChange?.(prefs.defaultExamLength);
      setSaved(true);
    } catch (cause) {
      console.error("Unable to save learner settings", cause);
      setError("Firebase could not save your settings. Check your connection and Firestore rules, then retry.");
    } finally { setSaving(false); }
  }
  async function reset() {
    setPrefs(defaultPreferences); setSaved(false); setError("");
    if (!user || !db) { setError("Sign in and configure Firebase before resetting account settings."); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid, "settings", "preferences"), { ...defaultPreferences, updatedAt: serverTimestamp() }, { merge: true });
      document.documentElement.classList.remove("qr-large-text","qr-compact-layout");
      onDefaultExamLengthChange?.(defaultPreferences.defaultExamLength);
      setSaved(true);
    } catch (cause) {
      console.error("Unable to reset learner settings", cause);
      setError("Firebase could not reset your settings. Please retry.");
    } finally { setSaving(false); }
  }
  return <section className="settings-page">
    <div className="eyebrow">PERSONALIZE YOUR STUDY SPACE</div><h1>Settings</h1><p className="settings-intro">Manage your profile details, study defaults, and learning preferences.</p>
    {loading && <p className="settings-status" role="status">Loading your settings from Firebase…</p>}
    <div className="settings-card"><div className="settings-card-title"><UserRound size={18}/><div><h2>Account</h2><p>Your signed-in QuickRN account</p></div></div>
      <div className="settings-account"><div className="settings-avatar">{(user?.email?.[0] ?? "S").toUpperCase()}</div><div><strong>{user?.displayName || "QuickRN learner"}</strong><span>{user?.email || "Demo learner"}</span><small>{user ? "Signed in" : "Guest session"}</small></div></div>
      <p className="settings-help">Account authentication is managed securely through Firebase. Passwords and sign-in credentials are never stored in learner preferences.</p>
    </div>
    <div className="settings-card"><div className="settings-card-title"><BookOpen size={18}/><div><h2>Study preferences</h2><p>Set your default study targets</p></div></div>
      <div className="settings-field"><label htmlFor="daily-goal">Daily question goal</label><select id="daily-goal" value={prefs.dailyGoal} disabled={loading||saving} onChange={e=>update("dailyGoal",Number(e.target.value))}><option value={10}>10 questions</option><option value={20}>20 questions</option><option value={30}>30 questions</option><option value={50}>50 questions</option><option value={75}>75 questions</option></select></div>
      <div className="settings-field"><label htmlFor="exam-length">Default exam length</label><select id="exam-length" value={prefs.defaultExamLength} disabled={loading||saving} onChange={e=>update("defaultExamLength",Number(e.target.value))}><option value={20}>20 questions</option><option value={60}>60 questions</option><option value={85}>85 questions</option><option value={150}>150 questions</option><option value={600}>All available questions</option></select></div>
      <label className="settings-toggle"><span><strong>Show rationales after answering</strong><small>Display the explanation immediately after checking an answer.</small></span><input type="checkbox" checked={prefs.showRationales} disabled={loading||saving} onChange={e=>update("showRationales",e.target.checked)}/></label>
    </div>
    <div className="settings-card"><div className="settings-card-title"><Eye size={18}/><div><h2>Display and accessibility</h2><p>Adjust the reading experience</p></div></div>
      <label className="settings-toggle"><span><strong>Larger reading text</strong><small>Increase text size across supported study screens.</small></span><input type="checkbox" checked={prefs.largerText} disabled={loading||saving} onChange={e=>update("largerText",e.target.checked)}/></label>
      <label className="settings-toggle"><span><strong>Compact layout</strong><small>Reduce spacing in supported dashboard and study panels.</small></span><input type="checkbox" checked={prefs.compactLayout} disabled={loading||saving} onChange={e=>update("compactLayout",e.target.checked)}/></label>
    </div>
    <div className="settings-card"><div className="settings-card-title"><Bell size={18}/><div><h2>Study reminders</h2><p>Reminder preference for future planner integration</p></div></div>
      <label className="settings-toggle"><span><strong>Enable study reminders</strong><small>This stores your preference; scheduled browser or email notifications are not implemented yet.</small></span><input type="checkbox" checked={prefs.studyReminders} disabled={loading||saving} onChange={e=>update("studyReminders",e.target.checked)}/></label>
    </div>
    <div className="settings-actions"><span className="settings-saved" role="status">{error || (saved ? "Preferences saved to your Firebase account." : "Changes are not saved yet.")}</span><button className="button secondary" disabled={loading||saving||!user||!db} onClick={()=>void reset()}><RotateCcw size={15}/> Reset</button><button className="button primary" disabled={loading||saving||!user||!db} onClick={()=>void save()}><Save size={15}/> {saving?"Saving…":"Save preferences"}</button></div>
    <div className="settings-disclaimer"><ShieldCheck size={17}/><span>Your preferences are stored in Firestore under your authenticated account and follow you across devices. Notification delivery and account profile editing are separate features.</span></div>
  </section>;
}

import { useEffect, useState } from "react";
import { Bell, BookOpen, Eye, RotateCcw, Save, ShieldCheck, UserRound } from "lucide-react";
import type { User } from "firebase/auth";

type Preferences = {
  dailyGoal: number;
  defaultExamLength: number;
  showRationales: boolean;
  compactLayout: boolean;
  largerText: boolean;
  studyReminders: boolean;
};
const defaults: Preferences = { dailyGoal: 30, defaultExamLength: 85, showRationales: true, compactLayout: false, largerText: false, studyReminders: false };
const key = "quickrn-user-preferences-v1";

export default function SettingsPage({ user }: { user: User | null }) {
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) { const loaded = { ...defaults, ...JSON.parse(raw) as Partial<Preferences> }; setPrefs(loaded); document.documentElement.classList.toggle("qr-large-text", loaded.largerText); document.documentElement.classList.toggle("qr-compact-layout", loaded.compactLayout); }
    } catch (error) { console.warn("Could not load QuickRN preferences", error); }
  }, []);
  function update<K extends keyof Preferences>(field: K, value: Preferences[K]) {
    setPrefs(current => ({ ...current, [field]: value }));
    setSaved(false);
  }
  function save() {
    localStorage.setItem(key, JSON.stringify(prefs));
    document.documentElement.classList.toggle("qr-large-text", prefs.largerText);
    document.documentElement.classList.toggle("qr-compact-layout", prefs.compactLayout);
    setSaved(true);
  }
  function reset() { setPrefs(defaults); localStorage.removeItem(key); document.documentElement.classList.remove("qr-large-text","qr-compact-layout"); setSaved(false); }
  return <section className="settings-page">
    <div className="eyebrow">PERSONALIZE YOUR STUDY SPACE</div><h1>Settings</h1><p className="settings-intro">Manage your profile details, study defaults, and learning preferences.</p>
    <div className="settings-card"><div className="settings-card-title"><UserRound size={18}/><div><h2>Account</h2><p>Your signed-in QuickRN account</p></div></div>
      <div className="settings-account"><div className="settings-avatar">{(user?.email?.[0] ?? "S").toUpperCase()}</div><div><strong>{user?.displayName || "QuickRN learner"}</strong><span>{user?.email || "Demo learner"}</span><small>{user ? "Signed in" : "Guest session"}</small></div></div>
      <p className="settings-help">Account authentication is managed securely through Firebase. Password and sign-in methods are not stored in these local preferences.</p>
    </div>
    <div className="settings-card"><div className="settings-card-title"><BookOpen size={18}/><div><h2>Study preferences</h2><p>Set your default study targets</p></div></div>
      <div className="settings-field"><label htmlFor="daily-goal">Daily question goal</label><select id="daily-goal" value={prefs.dailyGoal} onChange={e=>update("dailyGoal",Number(e.target.value))}><option value={10}>10 questions</option><option value={20}>20 questions</option><option value={30}>30 questions</option><option value={50}>50 questions</option><option value={75}>75 questions</option></select></div>
      <div className="settings-field"><label htmlFor="exam-length">Default exam length</label><select id="exam-length" value={prefs.defaultExamLength} onChange={e=>update("defaultExamLength",Number(e.target.value))}><option value={20}>20 questions</option><option value={60}>60 questions</option><option value={85}>85 questions</option><option value={150}>150 questions</option><option value={600}>All available questions</option></select></div>
      <label className="settings-toggle"><span><strong>Show rationales after answering</strong><small>Display the explanation immediately after checking an answer.</small></span><input type="checkbox" checked={prefs.showRationales} onChange={e=>update("showRationales",e.target.checked)}/></label>
    </div>
    <div className="settings-card"><div className="settings-card-title"><Eye size={18}/><div><h2>Display and accessibility</h2><p>Adjust the reading experience</p></div></div>
      <label className="settings-toggle"><span><strong>Larger reading text</strong><small>Increase text size across supported study screens.</small></span><input type="checkbox" checked={prefs.largerText} onChange={e=>update("largerText",e.target.checked)}/></label>
      <label className="settings-toggle"><span><strong>Compact layout</strong><small>Reduce spacing in supported dashboard and study panels.</small></span><input type="checkbox" checked={prefs.compactLayout} onChange={e=>update("compactLayout",e.target.checked)}/></label>
    </div>
    <div className="settings-card"><div className="settings-card-title"><Bell size={18}/><div><h2>Study reminders</h2><p>Reminder preference for future planner integration</p></div></div>
      <label className="settings-toggle"><span><strong>Enable study reminders</strong><small>This saves your preference; browser or email notifications are not sent by this setting yet.</small></span><input type="checkbox" checked={prefs.studyReminders} onChange={e=>update("studyReminders",e.target.checked)}/></label>
    </div>
    <div className="settings-actions"><span className="settings-saved" role="status">{saved ? "Preferences saved on this device." : "Changes are not saved yet."}</span><button className="button secondary" onClick={reset}><RotateCcw size={15}/> Reset</button><button className="button primary" onClick={save}><Save size={15}/> Save preferences</button></div>
    <div className="settings-disclaimer"><ShieldCheck size={17}/><span>These settings are stored in this browser on this device. Cross-device preference sync, calendar notifications, and account profile editing require additional backend integration.</span></div>
  </section>;
}

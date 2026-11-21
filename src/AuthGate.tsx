import { useState, type FormEvent, type ReactNode } from "react";
import { Activity, Mail, LockKeyhole } from "lucide-react";
import { AuthProvider, useAuth } from "./AuthContext";

function Gate({ children }: { children: ReactNode }) {
  const { user, loading, configured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try { if (mode === "signup") await signUp(email.trim(), password); else await signIn(email.trim(), password); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to authenticate."); }
    finally { setBusy(false); }
  }
  if (loading) return <div className="auth-screen"><div className="auth-card">Loading your learning space…</div></div>;
  if (user || demoMode) return <>{children}</>;
  return <div className="auth-screen"><form className="auth-card" onSubmit={submit}>
    <div className="auth-brand"><span className="brand-mark"><Activity size={22}/></span><strong>quickrn</strong></div>
    <div className="eyebrow">YOUR NCLEX STUDY SPACE</div><h1>{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
    <p>Sign in to save your learning progress across devices.</p>
    {!configured && <div className="auth-warning">Firebase is not configured yet. Add the VITE_FIREBASE_* values from your Firebase project to the deployment environment.</div>}
    <label>Email address</label><div className="auth-input"><Mail size={17}/><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>
    <label>Password</label><div className="auth-input"><LockKeyhole size={17}/><input type="password" minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/></div>
    {error && <div className="auth-error" role="alert">{error}</div>}
    <button className="button primary auth-submit" disabled={busy || !configured}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
    <button type="button" className="auth-switch" onClick={()=>{setMode(mode === "signin" ? "signup" : "signin");setError("");}}>{mode === "signin" ? "New to QuickRN? Create an account" : "Already registered? Sign in"}</button>
    {!configured && <button type="button" className="auth-switch" onClick={()=>setDemoMode(true)}>Continue in demo mode (progress not saved)</button>}
  </form></div>;
}
export default function AuthGate({ children }: { children: ReactNode }) {
  return <AuthProvider><Gate>{children}</Gate></AuthProvider>;
}

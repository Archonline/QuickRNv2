import { useState, type FormEvent, type ReactNode } from "react";
import { Activity, Mail, LockKeyhole, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { AuthProvider, useAuth } from "./AuthContext";
import LandingPage from "./LandingPage";

type AuthMode = "signin" | "signup" | "reset";

function friendlyAuthError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : "";
  const messages: Record<string, string> = {
    "auth/invalid-email": "Enter a valid email address.",
    "auth/user-not-found": "No account was found for that email. Check it or create an account.",
    "auth/wrong-password": "That password doesn't match this account. Try again or reset your password.",
    "auth/invalid-credential": "The email or password is incorrect. Check your details and try again.",
    "auth/email-already-in-use": "An account already exists with this email. Sign in instead.",
    "auth/weak-password": "Choose a stronger password with at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Wait a little while before trying again.",
    "auth/network-request-failed": "Network error. Check your internet connection and try again.",
    "auth/operation-not-allowed": "Email/password sign-in is disabled in Firebase Authentication settings.",
    "auth/unauthorized-domain": "This website domain is not authorized in Firebase Authentication.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed before completing sign-in.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups and try again.",
    "auth/cancelled-popup-request": "A Google sign-in window is already open. Finish that sign-in first.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using another sign-in method. Sign in with that method first."
  };
  return messages[code] ?? (error instanceof Error ? error.message : "Something went wrong. Please try again.");
}

function Gate({ children }: { children: ReactNode }) {
  const { user, loading, configured, signIn, signInWithGoogle, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
    setPassword("");
    setConfirmPassword("");
  }

  async function continueWithGoogle() {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const cleanEmail = email.trim();
    if (mode === "reset" && !cleanEmail) {
      setError("Enter your email address first.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(cleanEmail, password);
      } else if (mode === "reset") {
        await resetPassword(cleanEmail);
        setNotice("If an account exists for this email, Firebase will send a password-reset link. Check your inbox and spam folder.");
      } else {
        await signIn(cleanEmail, password);
      }
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="auth-screen"><div className="auth-loading"><span className="auth-spinner" />Loading your learning space…</div></div>;
  }
  if (user || demoMode) return <>{children}</>;
  if (!showAuth) return <LandingPage onStart={() => { setShowAuth(true); changeMode("signin"); }} />;

  const isSignup = mode === "signup";
  const isReset = mode === "reset";
  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <button type="button" className="back-to-landing" onClick={() => setShowAuth(false)}>
          <ArrowLeft size={16} /> Back to QuickRN
        </button>
        <div className="auth-brand">
          <span className="brand-mark"><Activity size={22} /></span>
          <strong>quick<span>rn</span></strong>
          <span className="auth-beta">BETA</span>
        </div>
        <div className="eyebrow">{isReset ? "ACCOUNT RECOVERY" : "YOUR NCLEX STUDY SPACE"}</div>
        <h1>{isReset ? "Reset your password" : isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-intro">
          {isReset
            ? "Enter the email address linked to your account and we'll send a reset link."
            : isSignup
              ? "Create an account to save your learning progress across devices."
              : "Sign in to continue your nursing study journey."}
        </p>

        {!configured && (
          <div className="auth-warning" role="status">
            Firebase isn't connected yet. Add the Firebase web app configuration and enable Email/Password sign-in to activate accounts.
          </div>
        )}

        {!isReset && <>
          <button type="button" className="auth-google-button" onClick={continueWithGoogle}
            disabled={busy || !configured}>
            <span className="auth-google-mark" aria-hidden="true">G</span>
            Continue with Google
          </button>
          <div className="auth-divider"><span>or continue with email</span></div>
        </>}

        <label htmlFor="auth-email">Email address</label>
        <div className="auth-input">
          <Mail size={17} />
          <input id="auth-email" type="email" autoComplete="email" required value={email}
            onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
        </div>

        {!isReset && <>
          <div className="auth-label-row">
            <label htmlFor="auth-password">Password</label>
            {!isSignup && <button type="button" className="auth-inline-link" onClick={() => changeMode("reset")}>Forgot password?</button>}
          </div>
          <div className="auth-input">
            <LockKeyhole size={17} />
            <input id="auth-password" type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"} minLength={6}
              required value={password} onChange={event => setPassword(event.target.value)}
              placeholder={isSignup ? "At least 6 characters" : "Enter your password"} />
            <button type="button" className="auth-eye" aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(value => !value)}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </>}

        {isSignup && <>
          <label htmlFor="auth-confirm-password">Confirm password</label>
          <div className="auth-input">
            <LockKeyhole size={17} />
            <input id="auth-confirm-password" type="password" autoComplete="new-password" minLength={6}
              required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password" />
          </div>
        </>}

        {error && <div className="auth-error" role="alert">{error}</div>}
        {notice && <div className="auth-success" role="status">{notice}</div>}

        <button className="button primary auth-submit" disabled={busy || !configured}>
          {busy ? "Please wait…" : isReset ? "Send reset link" : isSignup ? "Create account" : "Sign in"}
        </button>

        {isReset ? (
          <button type="button" className="auth-switch" onClick={() => changeMode("signin")}>Back to sign in</button>
        ) : (
          <button type="button" className="auth-switch" onClick={() => changeMode(isSignup ? "signin" : "signup")}>
            {isSignup ? "Already have an account? Sign in" : "New to QuickRN? Create an account"}
          </button>
        )}

        {!configured && <button type="button" className="auth-switch auth-demo" onClick={() => setDemoMode(true)}>
          Continue in demo mode (progress not saved)
        </button>}

        <div className="auth-security"><ShieldCheck size={14} /> Your account is secured by Firebase Authentication</div>
      </form>
    </main>
  );
}

export default function AuthGate({ children }: { children: ReactNode }) {
  return <AuthProvider><Gate>{children}</Gate></AuthProvider>;
}

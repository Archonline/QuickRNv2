import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth, firebaseConfigured } from "./firebase";

type AuthValue = { user: User | null; loading: boolean; configured: boolean; signIn: (email: string, password: string) => Promise<void>; signUp: (email: string, password: string) => Promise<void>; logOut: () => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    return onAuthStateChanged(auth, (next) => { setUser(next); setLoading(false); });
  }, []);
  const value = useMemo<AuthValue>(() => ({
    user, loading, configured: firebaseConfigured,
    signIn: async (email, password) => { if (!auth) throw new Error("Firebase is not configured."); await signInWithEmailAndPassword(auth, email, password); },
    signUp: async (email, password) => { if (!auth) throw new Error("Firebase is not configured."); await createUserWithEmailAndPassword(auth, email, password); },
    logOut: async () => { if (auth) await signOut(auth); }
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; }

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";
import { auth, firebaseConfigured } from "./firebase";

type AuthValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
};
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user,
    loading,
    configured: firebaseConfigured,
    signIn: async (email, password) => {
      if (!auth) throw new Error("Firebase is not configured. Add your Firebase web app settings first.");
      await signInWithEmailAndPassword(auth, email, password);
    },
    signInWithGoogle: async () => {
      if (!auth) throw new Error("Firebase is not configured. Add your Firebase web app settings first.");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    },
    signUp: async (email, password) => {
      if (!auth) throw new Error("Firebase is not configured. Add your Firebase web app settings first.");
      await createUserWithEmailAndPassword(auth, email, password);
    },
    resetPassword: async (email) => {
      if (!auth) throw new Error("Firebase is not configured. Add your Firebase web app settings first.");
      await sendPasswordResetEmail(auth, email);
    },
    logOut: async () => {
      if (auth) await signOut(auth);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

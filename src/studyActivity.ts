import { arrayUnion, collection, doc, getDocs, increment, limit, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";

export type DailyActivity = {
  dateKey: string;
  practiceQuestionIds?: string[];
  examQuestionCount?: number;
};

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function recordPracticeCompletion(user: User | null, questionId: string): Promise<void> {
  if (!user || !db) return;
  const dateKey = localDateKey();
  await setDoc(doc(db, "users", user.uid, "dailyActivity", dateKey), {
    dateKey,
    practiceQuestionIds: arrayUnion(questionId),
    updatedAt: new Date()
  }, { merge: true });
}

export async function recordExamCompletionActivity(user: User | null, answeredCount: number): Promise<void> {
  if (!user || !db || answeredCount <= 0) return;
  const dateKey = localDateKey();
  await setDoc(doc(db, "users", user.uid, "dailyActivity", dateKey), {
    dateKey,
    examQuestionCount: increment(answeredCount),
    updatedAt: new Date()
  }, { merge: true });
}

export async function loadDailyActivity(user: User): Promise<DailyActivity[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "users", user.uid, "dailyActivity"));
  return snapshot.docs
    .map(item => item.data() as DailyActivity)
    .filter(item => /^\d{4}-\d{2}-\d{2}$/.test(item.dateKey))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .slice(0, 90);
}

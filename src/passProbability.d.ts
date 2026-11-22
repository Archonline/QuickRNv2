export type ProbabilityAttempt = { mode: "cat" | "readiness"; scorePercent: number; questionCount: number; completedAtMs: number };
export type ProbabilityPoint = ProbabilityAttempt & { attempt: number; probability: number; rollingScore: number };
export function buildPassProbabilitySeries(attempts: ProbabilityAttempt[]): ProbabilityPoint[];

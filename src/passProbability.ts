export type ProbabilityAttempt = {
  mode: "cat" | "readiness";
  scorePercent: number;
  questionCount: number;
  completedAtMs: number;
};

export type ProbabilityPoint = ProbabilityAttempt & {
  attempt: number;
  probability: number;
  rollingScore: number;
};

/**
 * QuickRN's study-readiness trend model.
 * It combines a recency-weighted score, recent score variability, and a
 * confidence adjustment for the number of completed assessments.
 * This is an educational estimate, not a clinically validated NCLEX prediction.
 */
export function buildPassProbabilitySeries(attempts: ProbabilityAttempt[]): ProbabilityPoint[] {
  const ordered = attempts
    .filter(item =>
      (item.mode === "cat" || item.mode === "readiness") &&
      Number.isFinite(item.scorePercent) &&
      Number.isFinite(item.questionCount) &&
      item.questionCount > 0 &&
      Number.isFinite(item.completedAtMs) &&
      item.completedAtMs > 0
    )
    .sort((a, b) => a.completedAtMs - b.completedAtMs);

  let rollingScore = 70;
  const scores: number[] = [];
  let effectiveAssessments = 0;

  return ordered.map((attempt, index) => {
    const score = Math.max(0, Math.min(100, attempt.scorePercent));
    const itemWeight = Math.max(0.65, Math.min(1.35, Math.sqrt(attempt.questionCount / 85)));
    const alpha = Math.min(0.62, 0.34 * itemWeight + 0.12);
    rollingScore = index === 0 ? score : rollingScore + alpha * (score - rollingScore);
    scores.push(score);

    const recent = scores.slice(-5);
    const recentMean = recent.reduce((sum, value) => sum + value, 0) / recent.length;
    const variance = recent.reduce((sum, value) => sum + (value - recentMean) ** 2, 0) / recent.length;
    const volatilityPenalty = Math.max(0, Math.sqrt(variance) - 7) * 0.22;
    const adjustedScore = rollingScore - volatilityPenalty;
    const rawProbability = 100 / (1 + Math.exp(-(adjustedScore - 70) / 7.5));

    effectiveAssessments += itemWeight;
    const confidence = 1 - Math.exp(-effectiveAssessments / 2.4);
    const probability = Math.round(Math.max(5, Math.min(95, 50 + (rawProbability - 50) * confidence)));

    return {
      ...attempt,
      scorePercent: score,
      attempt: index + 1,
      rollingScore: Math.round(rollingScore),
      probability
    };
  });
}

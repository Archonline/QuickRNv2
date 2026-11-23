export type CatMeasurement = {
  theta: number;
  standardError: number;
  information: number;
  responseCount: number;
  confidence: "low" | "moderate" | "higher";
};
export type CatResponse = {
  question?: {
    difficulty?: "Foundational" | "Intermediate" | "Advanced";
    catDifficulty?: number;
    catDiscrimination?: number;
  };
  earned: number;
  difficulty?: "Foundational" | "Intermediate" | "Advanced";
  catDifficulty?: number;
  catDiscrimination?: number;
};
export function catItemParameters(question: CatResponse["question"] | CatResponse): { difficulty: number; discrimination: number };
export function estimateCatMeasurement(responses?: CatResponse[]): CatMeasurement;
export function selectNextCatQuestion<T extends { id: string; status: string; category: string; difficulty?: string; catDifficulty?: number; catDiscrimination?: number; caseStudyId?: string; format?: string; caseStudy?: string }>(questions: T[], usedIds?: string[], responses?: CatResponse[], categoryCounts?: Record<string, number>, seed?: number): T | null;
export function buildRemediationTargets(results?: Array<{ category: string; earnedPoints: number }>): Array<{ category: string; sampleSize: number; accuracy: number; priority: "high" | "moderate" }>;
export function readinessBand(scorePercent: number, answeredCount: number, questionCount: number): string;
export function shouldStopCat(responseCount: number, measurement: Pick<CatMeasurement, "standardError">, options?: { minQuestions?: number; maxQuestions?: number; targetStandardError?: number }): boolean;

import type { NclexItemType } from "./questions";
export function responseScore(type: NclexItemType, actual: string[], expected: string[], tolerance?: number): number;
export function responseIsCorrect(type: NclexItemType, actual: string[], expected: string[], tolerance?: number): boolean;

export function estimateCatAbility(responses: { earned: number; difficulty: string }[]): number;

export type ReadinessResponse = { earned: number; difficulty: string; category?: string };
export type ReadinessEvaluation = {
  passed: boolean;
  questionCount: number;
  scorePercent: number;
  ability: number;
  categories: { name: string; total: number; earned: number; percent: number }[];
  weakCategories: string[];
  reasons: string[];
  rules: {
    minimumQuestions: number;
    maximumQuestions: number;
    minimumScorePercent: number;
    minimumAbility: number;
    minimumCategoryPercent: number;
    minimumCategorySample: number;
  };
};
export const READINESS_RULES: ReadinessEvaluation["rules"];
export function evaluateReadiness(responses: ReadinessResponse[]): ReadinessEvaluation;

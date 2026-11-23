import type { Question } from "./questions";

export function validateQuestion(question: Question): { valid: boolean; errors: string[] };
export function validateQuestionBank(items: Question[]): {
  total: number;
  valid: number;
  invalid: number;
  duplicateIds: string[];
  orphanedCaseGroups: string[];
  results: Array<{ id: string; valid: boolean; errors: string[] }>;
};

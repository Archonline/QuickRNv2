import type { NclexItemType } from "./questions";
export function responseScore(type: NclexItemType, actual: string[], expected: string[], tolerance?: number): number;
export function responseIsCorrect(type: NclexItemType, actual: string[], expected: string[], tolerance?: number): boolean;

export function estimateCatAbility(responses: { earned: number; difficulty: string }[]): number;

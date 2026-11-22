import type { NclexItemType } from "./questions";
export function responseScore(type: NclexItemType, actual: string[], expected: string[], tolerance?: number): number;\nexport function responseIsCorrect(type: NclexItemType, actual: string[], expected: string[], tolerance?: number): boolean;

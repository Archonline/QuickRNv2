const SET_SCORED = new Set([
  "multiple-response",
  "extended-multiple-response",
  "select-n",
  "highlight-text",
  "highlight-table",
  "matrix-multiple",
  "matrix-single",
  "matrix-grid",
  "drop-down-table",
  "bow-tie",
  "graphics-based"
]);
const ORDER_SCORED = new Set([
  "drop-down-cloze",
  "drop-down-rationale",
  "ordered-response",
  "drag-drop",
  "extended-drag-drop"
]);

export function responseScore(type, actual, expected, tolerance = 0) {
  if (!Array.isArray(actual) || !Array.isArray(expected) || expected.length === 0) return 0;
  if (type === "numeric-entry") {
    if (actual.length !== 1 || expected.length !== 1) return 0;
    const value = Number(actual[0]);
    const target = Number(expected[0]);
    return Number.isFinite(value) && Number.isFinite(target) && Math.abs(value - target) <= tolerance ? 1 : 0;
  }
  if (ORDER_SCORED.has(type)) {
    return actual.length === expected.length && actual.every((value, index) => value === expected[index]) ? 1 : 0;
  }
  if (SET_SCORED.has(type)) {
    const expectedSet = new Set(expected);
    const actualSet = new Set(actual.filter(value => value !== ""));
    const correctSelections = [...actualSet].filter(value => expectedSet.has(value)).length;
    const incorrectSelections = [...actualSet].filter(value => !expectedSet.has(value)).length;
    return Math.max(0, correctSelections - incorrectSelections) / expectedSet.size;
  }
  return actual.length === expected.length && actual[0] === expected[0] ? 1 : 0;
}

export function responseIsCorrect(type, actual, expected, tolerance = 0) {
  return responseScore(type, actual, expected, tolerance) === 1;
}


/**
 * Uncalibrated Rasch-style practice ability estimate.
 * Difficulty labels are mapped to provisional logits; this is not NCSBN/NCLEX IRT scoring.
 */
export function estimateCatAbility(responses) {
  if (!Array.isArray(responses) || responses.length === 0) return 0;
  const difficulty = value => value === "Foundational" ? -1 : value === "Advanced" ? 1 : 0;
  let theta = 0;
  for (let iteration = 0; iteration < 8; iteration += 1) {
    let residual = 0;
    let information = 0;
    for (const response of responses) {
      const earned = Math.max(0, Math.min(1, Number(response.earned) || 0));
      const p = 1 / (1 + Math.exp(-(theta - difficulty(response.difficulty))));
      residual += earned - p;
      information += p * (1 - p);
    }
    if (information < 1e-8) break;
    theta = Math.max(-4, Math.min(4, theta + Math.max(-0.5, Math.min(0.5, residual / information))));
  }
  return Number(theta.toFixed(3));
}

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


/**
 * Strict QuickRN readiness benchmark.
 * This is an internal, uncalibrated practice standard, not an NCSBN pass rule.
 * A candidate must complete at least 85 hard-item CAT questions, earn >=85%
 * partial-credit score, reach provisional ability >= +1.25 logits, and earn
 * >=70% in every question category represented by at least five items.
 */
export const READINESS_RULES = Object.freeze({
  minimumQuestions: 85,
  maximumQuestions: 150,
  minimumScorePercent: 85,
  minimumAbility: 2.25,
  minimumCategoryPercent: 75,
  minimumCategorySample: 5
});

export function evaluateReadiness(responses) {
  const items = Array.isArray(responses) ? responses : [];
  const earned = items.reduce((sum, item) => sum + Math.max(0, Math.min(1, Number(item.earned) || 0)), 0);
  const rawScorePercent = items.length ? (earned / items.length) * 100 : 0;
  const scorePercent = Math.round(rawScorePercent);
  const ability = estimateCatAbility(items.map(item => ({
    earned: item.earned,
    difficulty: item.difficulty
  })));
  const categoryMap = new Map();
  for (const item of items) {
    const name = String(item.category || "Uncategorized");
    const current = categoryMap.get(name) || { name, total: 0, earned: 0 };
    current.total += 1;
    current.earned += Math.max(0, Math.min(1, Number(item.earned) || 0));
    categoryMap.set(name, current);
  }
  const categories = [...categoryMap.values()].map(item => ({
    ...item,
    percent: item.total ? Math.round(item.earned / item.total * 100) : 0
  })).sort((a, b) => a.percent - b.percent);
  const weakCategories = categories.filter(item =>
    item.total >= READINESS_RULES.minimumCategorySample &&
    (item.earned / item.total) * 100 < READINESS_RULES.minimumCategoryPercent
  );
  const reasons = [];
  if (items.length < READINESS_RULES.minimumQuestions) {
    reasons.push(`Complete at least ${READINESS_RULES.minimumQuestions} questions.`);
  }
  if (rawScorePercent < READINESS_RULES.minimumScorePercent) {
    reasons.push(`Earn at least ${READINESS_RULES.minimumScorePercent}% overall partial-credit score.`);
  }
  if (ability < READINESS_RULES.minimumAbility) {
    reasons.push(`Reach the provisional ability threshold of +${READINESS_RULES.minimumAbility.toFixed(2)}.`);
  }
  if (weakCategories.length) {
    reasons.push(`Raise every sampled category with at least ${READINESS_RULES.minimumCategorySample} items to ${READINESS_RULES.minimumCategoryPercent}% or higher.`);
  }
  return {
    passed: reasons.length === 0,
    questionCount: items.length,
    scorePercent,
    ability,
    categories,
    weakCategories: weakCategories.map(item => item.name),
    reasons,
    rules: READINESS_RULES
  };
}

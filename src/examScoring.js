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

export function responseIsCorrect(type, actual, expected, tolerance = 0) {
  if (!Array.isArray(actual) || !Array.isArray(expected) || expected.length === 0) return false;
  if (type === "numeric-entry") {
    if (actual.length !== 1 || expected.length !== 1) return false;
    const value = Number(actual[0]);
    const target = Number(expected[0]);
    return Number.isFinite(value) && Number.isFinite(target) && Math.abs(value - target) <= tolerance;
  }
  if (ORDER_SCORED.has(type)) {
    return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
  }
  if (SET_SCORED.has(type)) {
    return actual.length === expected.length &&
      new Set(actual).size === new Set(expected).size &&
      actual.every(value => expected.includes(value));
  }
  return actual.length === expected.length && actual[0] === expected[0];
}

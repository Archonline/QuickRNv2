const SET_SCORED = new Set([
  "multiple-response",
  "extended-multiple-response",
  "highlight-text",
  "highlight-table",
  "matrix-grid",
  "drop-down-table",
  "bow-tie",
  "graphics-based"
]);
const ORDER_SCORED = new Set(["ordered-response", "extended-drag-drop"]);

export function responseIsCorrect(type, actual, expected) {
  if (!Array.isArray(actual) || !Array.isArray(expected) || expected.length === 0) return false;
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

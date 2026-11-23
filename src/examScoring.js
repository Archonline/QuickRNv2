import { estimateCatMeasurement } from "./catEngine.js";

const SET_SCORED = new Set(["multiple-response","extended-multiple-response","select-n","highlight-text","highlight-table","matrix-multiple","matrix-grid","bow-tie","graphics-based"]);
const ORDER_SCORED = new Set(["ordered-response","extended-drag-drop"]);
const clamp = n => Math.max(0, Math.min(1, n));
const setCredit = (actual, expected) => {
  const key = new Set(expected.map(String));
  const got = new Set(actual.filter(v => v !== "").map(String));
  const right = [...got].filter(v => key.has(v)).length;
  const wrong = [...got].filter(v => !key.has(v)).length;
  return clamp((right - wrong) / Math.max(1, key.size));
};
const exactSequence = (actual, expected) => actual.length === expected.length && actual.every((v, i) => String(v) === String(expected[i])) ? 1 : 0;

function matrixCredit(type, actual, expected) {
  const keys = new Set(expected.map(String));
  const rows = new Set([...expected, ...actual].map(v => String(v).split(":")[0]));
  if (!rows.size) return 0;
  let earned = 0;
  for (const row of rows) {
    const key = [...keys].filter(v => v.startsWith(row + ":"));
    const answer = actual.filter(v => String(v).startsWith(row + ":"));
    earned += type === "matrix-single"
      ? (key.length === 1 && answer.length === 1 && key[0] === String(answer[0]) ? 1 : 0)
      : setCredit(answer, key);
  }
  return earned / rows.size;
}

function bowTieCredit(actual, expected) {
  return ["c", "a", "m"].reduce((total, prefix) => {
    const earned = setCredit(actual.filter(v => String(v).startsWith(prefix)), expected.filter(v => String(v).startsWith(prefix)));
    return total + earned / 3;
  }, 0);
}

function positionalCredit(actual, expected) {
  const count = Math.max(actual.length, expected.length);
  if (!count) return 0;
  let earned = 0;
  for (let index = 0; index < count; index += 1) {
    if (actual[index] !== undefined && actual[index] !== "" && String(actual[index]) === String(expected[index])) earned += 1;
  }
  return earned / count;
}

export function responseScore(type, actual, expected, tolerance = 0) {
  if (!Array.isArray(actual) || !Array.isArray(expected) || !expected.length) return 0;
  if (type === "numeric-entry") {
    if (actual.length !== 1 || expected.length !== 1) return 0;
    const answer = Number(actual[0]), key = Number(expected[0]);
    return Number.isFinite(answer) && Number.isFinite(key) && Math.abs(answer - key) <= tolerance ? 1 : 0;
  }
  if (ORDER_SCORED.has(type)) return exactSequence(actual, expected);
  if (["matrix-single", "matrix-multiple", "matrix-grid"].includes(type)) {
    const coordinateValues = [...actual, ...expected].every(value => /^\d+:\d+$/.test(String(value)));
    if (type === "matrix-grid" && !coordinateValues) return setCredit(actual, expected);
    return matrixCredit(type === "matrix-grid" ? "matrix-multiple" : type, actual, expected);
  }
  if (type === "bow-tie") return bowTieCredit(actual, expected);
  if (type === "drop-down-table") {
    if ([...actual, ...expected].some(value => String(value).includes(":"))) {
      const rows = new Set([...actual, ...expected].map(value => String(value).split(":")[0]));
      let earned = 0;
      for (const row of rows) {
        const answer = actual.filter(value => String(value).startsWith(row + ":"));
        const key = expected.filter(value => String(value).startsWith(row + ":"));
        if (answer.length === 1 && key.length === 1 && String(answer[0]) === String(key[0])) earned += 1;
      }
      return rows.size ? earned / rows.size : 0;
    }
    return positionalCredit(actual, expected);
  }
  if (["drop-down-cloze", "drop-down-rationale", "drag-drop"].includes(type)) return positionalCredit(actual, expected);
  if (SET_SCORED.has(type)) return setCredit(actual, expected);
  return exactSequence(actual, expected);
}

export function responseIsCorrect(type, actual, expected, tolerance = 0) {
  return responseScore(type, actual, expected, tolerance) === 1;
}
\n/** Backward-compatible scalar estimate; new code should use estimateCatMeasurement. */\nexport function estimateCatAbility(responses) { return estimateCatMeasurement(responses).theta; }\n
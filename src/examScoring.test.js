import test from "node:test";
import assert from "node:assert/strict";
import { responseIsCorrect } from "./examScoring.js";

const cases = [
  ["single-response", ["2"], ["2"], true],
  ["single-response", ["1"], ["2"], false],
  ["multiple-response", ["0", "2"], ["2", "0"], true],
  ["extended-multiple-response", ["0", "1", "3"], ["0", "1", "3"], true],
  ["drop-down-cloze", ["0", "2"], ["0", "2"], true],
  ["drop-down-cloze", ["2", "0"], ["0", "2"], false],
  ["drop-down-table", ["0:1", "1:2"], ["1:2", "0:1"], true],
  ["drop-down-table", ["0:2", "1:2"], ["0:1", "1:2"], false],
  ["highlight-text", ["SpO2 84%", "HR 132"], ["HR 132", "SpO2 84%"], true],
  ["highlight-table", ["0", "2"], ["0", "2"], true],
  ["matrix-grid", ["0:2", "1:0"], ["1:0", "0:2"], true],
  ["matrix-grid", ["0:1", "1:0"], ["1:0", "0:2"], false],
  ["ordered-response", ["0", "1", "2"], ["0", "1", "2"], true],
  ["ordered-response", ["1", "0", "2"], ["0", "1", "2"], false],
  ["bow-tie", ["c0", "a0", "a1", "m0", "m1"], ["m1", "a1", "c0", "m0", "a0"], true],
  ["trend", ["1"], ["1"], true],
  ["graphics-based", ["0", "3"], ["3", "0"], true],
  ["extended-drag-drop", ["2", "0", "1"], ["2", "0", "1"], true],
  ["extended-drag-drop", ["0", "2", "1"], ["2", "0", "1"], false]
];

for (const [type, actual, expected, result] of cases) {
  test(type + " response scoring: " + actual.join(","), () => {
    assert.equal(responseIsCorrect(type, actual, expected), result);
  });
}

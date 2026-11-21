import test from "node:test";
import assert from "node:assert/strict";
import { responseIsCorrect } from "../src/examScoring.js";

const formats = [
  ["single-response", ["2"], ["2"], true],
  ["multiple-response", ["0", "2"], ["2", "0"], true],
  ["extended-multiple-response", ["0", "4"], ["0", "4"], true],
  ["drop-down-cloze", ["1", "3"], ["1", "3"], true],
  ["drop-down-table", ["1", "0"], ["1", "0"], true],
  ["highlight-text", ["0", "2"], ["2", "0"], true],
  ["highlight-table", ["1"], ["1"], true],
  ["matrix-grid", ["Emergency", "Expected"], ["Emergency", "Expected"], true],
  ["ordered-response", ["0", "2", "1"], ["0", "1", "2"], false],
  ["bow-tie", ["c0", "a1", "a0", "m0", "m1"], ["c0", "a0", "a1", "m0", "m1"], true],
  ["trend", ["3"], ["3"], true],
  ["extended-drag-drop", ["2", "1", "0"], ["0", "1", "2"], false],
  ["graphics-based", ["2"], ["2"], true],
];

for (const [type, actual, expected, wanted] of formats) {
  test(type + " scoring", () => assert.equal(responseIsCorrect(type, actual, expected), wanted));
}
test("matrix and ordered responses are position-sensitive", () => {
  assert.equal(responseIsCorrect("matrix-grid", ["Emergency", "Expected"], ["Expected", "Emergency"]), false);
  assert.equal(responseIsCorrect("ordered-response", ["1", "0"], ["0", "1"]), false);
});
test("empty and incomplete answers are never correct", () => {
  assert.equal(responseIsCorrect("single-response", [], ["0"]), false);
  assert.equal(responseIsCorrect("multiple-response", ["0"], ["0", "1"]), false);
});

import test from "node:test";
import assert from "node:assert/strict";
import { responseScore } from "../src/examScoring.js";
import { validateQuestion, validateQuestionBank } from "../src/questionValidation.js";
test("single response exact match",()=>{assert.equal(responseScore("single-response",["1"],["1"]),1);assert.equal(responseScore("single-response",["0"],["1"]),0);});
test("multiple response uses plus-minus partial credit and zero floor",()=>{assert.equal(responseScore("multiple-response",["0"],["0","1"]),.5);assert.equal(responseScore("multiple-response",["0","2"],["0","1"]),0);});
test("select N and highlight use partial credit",()=>{assert.equal(responseScore("select-n",["0","1"],["0","1","2"]),2/3);assert.equal(responseScore("highlight-text",["a"],["a","b"]),.5);});
test("matrix single scores each row independently",()=>{assert.equal(responseScore("matrix-single",["0:0","1:1"],["0:0","1:0"]),.5);});
test("matrix multiple scores each row independently",()=>{assert.equal(responseScore("matrix-multiple",["0:0","1:1"],["0:0","0:1","1:1"]),.75);});
test("bow tie scores condition, action, and monitoring groups independently",()=>{assert.equal(responseScore("bow-tie",["c0","a0-1","m0-0"],["c0","a0-1","a1-2","m0-0","m1-1"]),2/3);});
test("dropdown and drag-drop score blanks independently",()=>{assert.equal(responseScore("drop-down-cloze",["1","0"],["1","2"]),.5);assert.equal(responseScore("drag-drop",["x"],["x","y"]),.5);});
test("ordered response requires exact order",()=>{assert.equal(responseScore("ordered-response",["1","0"],["0","1"]),0);});
test("numeric entry honors tolerance",()=>{assert.equal(responseScore("numeric-entry",["5.1"],["5"],.2),1);});
const valid={id:"x",category:"A",topic:"B",difficulty:"Foundational",prompt:"Q",options:["a","b"],answer:0,itemType:"single-response",interaction:{choices:["a","b"],correctResponse:["0"]}};
test("validator rejects malformed keyed response",()=>{assert.equal(validateQuestion({...valid,interaction:{choices:["a","b"],correctResponse:["9"]}}).valid,false);});
test("validator accepts well-formed single response",()=>{assert.equal(validateQuestion(valid).valid,true);});
test("bank audit detects duplicate IDs",()=>{const result=validateQuestionBank([valid,{...valid}]);assert.deepEqual(result.duplicateIds,["x"]);});

test("structural validator accepts each supported NCLEX interaction family",()=>{
 const base={id:"format",category:"A",topic:"B",difficulty:"Intermediate",prompt:"Prompt",options:["A","B"],answer:0,status:"published"};
 const fixtures=[
  {...base,itemType:"single-response",interaction:{choices:["A","B"],correctResponse:["0"]}},
  {...base,itemType:"multiple-response",interaction:{choices:["A","B"],correctResponse:["0","1"]}},
  {...base,itemType:"select-n",interaction:{choices:["A","B"],selectCount:1,correctResponse:["0"]}},
  {...base,itemType:"drop-down-cloze",interaction:{clozeTemplate:"Choose [BLANK_1].",clozeChoicesByBlank:[["A","B"]],correctResponse:["0"]}},
  {...base,itemType:"drop-down-rationale",interaction:{rationaleTemplate:"Because [BLANK_1].",rationaleChoicesByBlank:[["A","B"]],correctResponse:["0"]}},
  {...base,itemType:"highlight-text",interaction:{segments:["Cue A","Cue B"],highlightableSegments:["Cue A","Cue B"],correctResponse:["Cue A"]}},
  {...base,itemType:"matrix-single",interaction:{rows:["Row 1"],columns:["A","B"],correctResponse:["0:0"]}},
  {...base,itemType:"matrix-multiple",interaction:{rows:["Row 1"],columns:["A","B"],correctResponse:["0:0"]}},
  {...base,itemType:"numeric-entry",interaction:{correctResponse:["12.5"]}},
  {...base,itemType:"ordered-response",interaction:{orderItems:["A","B"],correctOrder:[0,1],correctResponse:["0","1"]}},
  {...base,itemType:"bow-tie",interaction:{bowTie:{conditions:["A","B"],actions:["A","B"],monitoring:["A","B"],correctCondition:0,correctActions:[0,1],correctMonitoring:[0,1]},correctResponse:["c0","a0-0","a1-1","m0-0","m1-1"]}},
  {...base,itemType:"drag-drop",interaction:{dragDropTemplate:"[BLANK_1]",dragDropChoices:["A","B"],correctResponse:["0"]}},
  {...base,itemType:"trend",interaction:{choices:["A","B"],trend:[{time:"1",findings:"A"},{time:"2",findings:"B"}],correctResponse:["0"]}},
  {...base,itemType:"graphics-based",interaction:{graphic:{title:"Diagram",description:"Choose",labels:["A","B"],correctLabels:[0]},correctResponse:["0"]}}
 ];
 const results=fixtures.map(q=>({type:q.itemType,...validateQuestion(q)}));
 assert.deepEqual(results.filter(x=>!x.valid).map(x=>({type:x.type,errors:x.errors})),[]);
});

test("matrix-grid coordinates receive row-wise partial credit",()=>{
 assert.equal(responseScore("matrix-grid",["0:0","1:1"],["0:0","1:0"]),.5);
 assert.equal(responseScore("matrix-grid",["0:0"],["0:0","1:1"]),.5);
});
test("legacy NGN formats retain format-specific partial credit",()=>{
 assert.equal(responseScore("highlight-table",["cue-a"],["cue-a","cue-b"]),.5);
 assert.equal(responseScore("drop-down-table",["0:1","1:0"],["0:1","1:1"]),.5);
 assert.equal(responseScore("extended-multiple-response",["0"],["0","1"]),.5);
 assert.equal(responseScore("extended-drag-drop",["1","0"],["0","1"]),0);
});
test("unanswered responses never earn credit",()=>{
 for(const type of ["multiple-response","matrix-grid","bow-tie","drop-down-cloze","highlight-table"]) {
  assert.equal(responseScore(type,[],["0"]),0,type);
 }
});

test("bank audit reports the real published-format distribution",()=>{
 const result=validateQuestionBank([valid,{...valid,id:"matrix",itemType:"matrix-grid"}]);
 assert.equal(result.formatCounts["single-response"],1);
 assert.equal(result.formatCounts["matrix-grid"],1);
 assert.equal(result.invalidByType["matrix-grid"]??0,1);
});

test("validator accepts calibrated CAT item parameters within supported bounds",()=>{
 assert.equal(validateQuestion({...valid,catDifficulty:1.25,catDiscrimination:1.4}).valid,true);
 assert.equal(validateQuestion({...valid,catDifficulty:4}).valid,false);
 assert.equal(validateQuestion({...valid,catDiscrimination:0.1}).valid,false);
});

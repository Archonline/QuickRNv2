import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import ExamPage, {type ExamCompletion} from "../../src/ExamPage";
import type {Question} from "../../src/questions";
import "../../src/style.css";
import "../../src/exam-overrides.css";
import "../../src/design-system.css";

const params=new URLSearchParams(window.location.search);
const mode=(params.get("mode")??"self-study") as "self-study"|"cat"|"readiness";
const count=mode==="readiness"?85:20;
const questions:Question[]=Array.from({length:count},(_,i)=>({
 id:"e2e-"+String(i+1).padStart(3,"0"),category:"Fundamentals",topic:"Reliability test",difficulty:"Intermediate",
 prompt:"Reliability test question "+(i+1)+": which option is correct?",
 options:["Option A","Option B","Option C","Option D"],answer:0,
 rationale:"Option A is the keyed answer for this test fixture.",status:"published",itemType:"single-response"
}));
function Harness(){
 const [completion,setCompletion]=useState<ExamCompletion|null>(null);
 return <><ExamPage questions={questions} mode={mode} defaultQuestionCount={20} onExit={()=>{document.body.dataset.exited="true";}} onComplete={setCompletion}/>
 <output data-testid="completion" aria-live="polite">{completion?JSON.stringify({mode:completion.mode,questionCount:completion.questionCount,answeredCount:completion.answeredCount,correctCount:completion.correctCount,unansweredCount:completion.unansweredCount}):""}</output></>;
}
createRoot(document.getElementById("root")!).render(<Harness/>);

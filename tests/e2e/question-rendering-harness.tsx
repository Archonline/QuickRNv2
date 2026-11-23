import React from "react";
import {createRoot} from "react-dom/client";
import ExamPage from "../../src/ExamPage";
import {questionBank600} from "../../src/ngnQuestionBank";
import "../../src/style.css";
import "../../src/exam-overrides.css";
import "../../src/design-system.css";

function Harness(){
 return <ExamPage questions={questionBank600} mode="self-study" defaultQuestionCount={85} onExit={()=>{document.body.dataset.exited="true";}}/>;
}
createRoot(document.getElementById("root")!).render(<Harness/>);

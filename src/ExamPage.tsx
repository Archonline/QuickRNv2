import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CheckCircle2, Clock3, Flag, List, X } from "lucide-react";
import type { Question } from "./questions";

type Props={questions:Question[];onExit:()=>void};
const LETTERS=["A","B","C","D","E","F","G","H"];
function sameSet(a:number[],b:number[]){return a.length===b.length&&a.every(x=>b.includes(x));}
export default function ExamPage({questions,onExit}:Props){
 const exam=useMemo(()=>questions.filter(q=>q.status==="published").slice(0,85),[questions]);
 const [answers,setAnswers]=useState<Record<string,number[]>>({});
 const [current,setCurrent]=useState(0);
 const [flagged,setFlagged]=useState<string[]>([]);
 const [seconds,setSeconds]=useState(5*60*60);
 const [finished,setFinished]=useState(false);
 const [showNavigator,setShowNavigator]=useState(true);
 const item=exam[current];
 useEffect(()=>{if(finished)return;const id=window.setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>window.clearInterval(id);},[finished]);
 useEffect(()=>{if(seconds===0&&!finished)setFinished(true);},[seconds,finished]);
 const selected= item ? (answers[item.id]??[]) : [];
 const done=Object.keys(answers).filter(k=>answers[k].length>0).length;
 const score=exam.reduce((n,q)=>n+((answers[q.id]??[]).length===1&&(answers[q.id]??[])[0]===q.answer?1:0),0);
 const toggle=(idx:number)=>setAnswers(old=>{const current=old[item.id]??[];const next=item.format==="multiple"?(current.includes(idx)?current.filter(x=>x!==idx):[...current,idx]):[idx];return {...old,[item.id]:next};});
 const fmt=(s:number)=>String(Math.floor(s/3600)).padStart(2,"0")+":"+String(Math.floor((s%3600)/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
 if(!item)return <div className="exam-screen"><p>No published questions are available.</p><button onClick={onExit}>Return</button></div>;
 return <div className="exam-screen">
  <header className="exam-header"><div className="exam-brand"><span className="exam-brand-mark">Q</span><div><strong>QuickRN</strong><small>RN PRACTICE EXAM</small></div></div><div className="exam-header-center"><strong>NCLEX-RN style practice exam</strong><span>Practice mode · {exam.length} items</span></div><div className="exam-timer"><Clock3 size={17}/><div><small>TIME REMAINING</small><strong>{fmt(seconds)}</strong></div></div><button className="exam-exit" onClick={()=>setFinished(true)}>End exam</button></header>
  <div className="exam-subbar"><span>Candidate practice session</span><span>Responses saved in this session</span></div>
  <div className="exam-layout">
   {showNavigator&&<aside className="exam-nav"><div className="exam-nav-title"><strong>Question navigator</strong><button onClick={()=>setShowNavigator(false)} aria-label="Hide navigator"><X size={16}/></button></div><div className="exam-nav-progress"><div><span>Answered</span><b>{done} / {exam.length}</b></div><i><span style={{width:(done/exam.length*100)+"%"}}/></i></div><div className="exam-number-grid">{exam.map((q,i)=><button key={q.id} className={(i===current?"active ":"")+(answers[q.id]?.length?"answered ":"")+(flagged.includes(q.id)?"flagged":"")} onClick={()=>setCurrent(i)} title={"Question "+(i+1)}>{i+1}{flagged.includes(q.id)&&<Flag size={9}/>}</button>)}</div><div className="exam-legend"><span><i className="legend-current"/>Current</span><span><i className="legend-answered"/>Answered</span><span><i className="legend-flag"/>Flagged</span></div><button className="exam-submit-side" onClick={()=>setFinished(true)}>Submit exam</button></aside>}
   <main className="exam-main">{!showNavigator&&<button className="exam-show-nav" onClick={()=>setShowNavigator(true)}><List size={15}/> Question list</button>}
    <div className="exam-main-top"><span>QUESTION {current+1} OF {exam.length}</span><button className={flagged.includes(item.id)?"exam-flag active":"exam-flag"} onClick={()=>setFlagged(v=>v.includes(item.id)?v.filter(x=>x!==item.id):[...v,item.id])}>{flagged.includes(item.id)?<BookmarkCheck size={16}/>:<Bookmark size={16}/>} {flagged.includes(item.id)?"Flagged for review":"Flag for review"}</button></div>
    {item.caseStudy&&<section className="exam-case"><div className="exam-case-label">CLIENT RECORD · UNFOLDING CASE STUDY</div><p>{item.caseStudy}</p>{item.exhibit&&<details open><summary>Exhibit: Clinical record</summary><p>{item.exhibit}</p></details>}</section>}
    <div className="exam-item-meta"><span>{item.category}</span><span>{item.difficulty}</span><span>{item.topic}</span></div>
    <h1 className="exam-stem">{item.prompt}</h1>
    {item.format==="multiple"&&<p className="exam-instruction">Select all responses that apply.</p>}
    <div className="exam-options">{item.options.map((opt,i)=><button key={i} className={"exam-option "+(selected.includes(i)?"selected":"")} onClick={()=>toggle(i)}><span className="exam-option-letter">{LETTERS[i]}</span><span>{opt}</span><span className="exam-option-check">{selected.includes(i)?"✓":""}</span></button>)}</div>
    <div className="exam-workspace-note">Select the best response. You may change your answer before submitting the exam.</div>
    <div className="exam-controls"><button className="exam-prev" disabled={current===0} onClick={()=>setCurrent(v=>Math.max(0,v-1))}><ArrowLeft size={16}/> Previous</button><span>{selected.length?"Response selected":"No response selected"}</span>{current===exam.length-1?<button className="exam-next" onClick={()=>setFinished(true)}>Review and submit <CheckCircle2 size={16}/></button>:<button className="exam-next" onClick={()=>setCurrent(v=>Math.min(exam.length-1,v+1))}>Next <ArrowRight size={16}/></button>}</div>
   </main>
  </div>
  {finished&&<div className="exam-modal-backdrop"><section className="exam-modal"><div className="exam-modal-icon"><CheckCircle2 size={25}/></div><h2>Submit practice exam?</h2><p>You answered {done} of {exam.length} questions. Unanswered questions will be scored as incorrect.</p><div className="exam-modal-stats"><div><strong>{done}</strong><span>Answered</span></div><div><strong>{exam.length-done}</strong><span>Unanswered</span></div><div><strong>{flagged.length}</strong><span>Flagged</span></div></div><div className="exam-modal-actions"><button onClick={()=>setFinished(false)}>Return to exam</button><button onClick={()=>setFinished(false)} className="exam-final-submit" disabled>Calculating…</button></div><p className="exam-modal-disclaimer">This practice interface is independently developed and is not an official NCSBN examination or replica.</p></section></div>}
 </div>;
}

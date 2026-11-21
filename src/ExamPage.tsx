import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CheckCircle2, Clock3, Flag, List, X, ChevronUp, ChevronDown } from "lucide-react";
import type { NclexItemType, Question } from "./questions";

type Props={questions:Question[];onExit:()=>void};
const LETTERS=["A","B","C","D","E","F","G","H"];
const LABELS:Record<NclexItemType,string>={
"single-response":"Multiple choice","multiple-response":"Multiple response","extended-multiple-response":"Extended multiple response",
"drop-down-cloze":"Drop-down cloze","drop-down-table":"Drop-down table","highlight-text":"Highlight text",
"highlight-table":"Highlight table","matrix-grid":"Matrix / grid","ordered-response":"Ordered response",
"bow-tie":"Bow-tie","trend":"Trend","extended-drag-drop":"Extended drag-and-drop","graphics-based":"Graphics-based"
};
function sameSet(a:string[],b:string[]){return a.length===b.length&&a.every(x=>b.includes(x));}
export default function ExamPage({questions,onExit}:Props){
 const exam=useMemo(()=>{const published=questions.filter(q=>q.status==="published");const legacy=published.filter(q=>!q.id.startsWith("ngn-"));const ngn=published.filter(q=>q.id.startsWith("ngn-"));return [...legacy.slice(0,72),...ngn.slice(0,13)];},[questions]);
 const [answers,setAnswers]=useState<Record<string,string[]>>({});
 const [current,setCurrent]=useState(0);
 const [flagged,setFlagged]=useState<string[]>([]);
 const [seconds,setSeconds]=useState(5*60*60);
 const [finished,setFinished]=useState(false);
 const [submitted,setSubmitted]=useState(false);
 const [showNavigator,setShowNavigator]=useState(true);
 const item=exam[current];
 useEffect(()=>{if(finished||submitted)return;const id=window.setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>window.clearInterval(id);},[finished,submitted]);
 useEffect(()=>{if(seconds===0&&!submitted)setFinished(true);},[seconds,submitted]);
 if(!item)return <div className="exam-screen"><p>No published questions are available.</p><button onClick={onExit}>Return</button></div>;
 const selected=answers[item.id]??[];
 const done=Object.keys(answers).filter(k=>answers[k].length>0).length;
 const correct=(q:Question)=>{const response=answers[q.id]??[];const expected=q.interaction?.correctResponse??[String(q.answer)];return sameSet(response,expected);};
 const score=exam.reduce((n,q)=>n+(correct(q)?1:0),0);
 const setResponse=(values:string[])=>setAnswers(old=>({...old,[item.id]:values}));
 const toggle=(value:string)=>setResponse(selected.includes(value)?selected.filter(x=>x!==value):[...selected,value]);
 const fmt=(s:number)=>String(Math.floor(s/3600)).padStart(2,"0")+":"+String(Math.floor((s%3600)/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
 const type=item.itemType??(item.format==="multiple"?"multiple-response":"single-response");
 const data=item.interaction??{instruction:type==="multiple-response"?"Select all that apply.":"Select one response.",choices:item.options,correctResponse:[String(item.answer)]};
 const choiceList=data.choices??item.options;
 const renderChoices=(multi:boolean)=> <div className="exam-options">{choiceList.map((opt,i)=>{const value=String(i);return <button key={i} className={"exam-option "+(selected.includes(value)?"selected":"")} onClick={()=>multi?toggle(value):setResponse([value])}><span className="exam-option-letter">{LETTERS[i]}</span><span>{opt}</span><span className="exam-option-check">{selected.includes(value)?"✓":""}</span></button>})}</div>;
 const renderMatrix=()=> <div className="ngn-matrix"><table><thead><tr><th>Finding</th>{(data.columns??["Expected","Needs follow-up","Emergency"]).map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{(data.rows??[]).map((r,i)=><tr key={i}><th>{r}</th>{(data.columns??[]).map(c=><td key={c}><label><input type="radio" name={"matrix-"+i} checked={selected[i]===c} onChange={()=>{const a=[...selected];a[i]=c;setResponse(a);}}/>{c}</label></td>)}</tr>)}</tbody></table></div>;
 const renderHighlight=()=> <div className="ngn-highlight">{(data.segments??[item.caseStudy??item.prompt,item.exhibit??""]).map((segment,i)=><button key={i} className={selected.includes(String(i))?"selected":""} onClick={()=>toggle(String(i))}>{segment}</button>)}</div>;
 const renderOrdered=()=> {const order=selected.length?selected:["2","0","3","1"];return <div className="ngn-order">{order.map((entry,pos)=>{const i=Number(entry);return <div className="ngn-order-row" key={entry}><span>{pos+1}. {(data.orderItems??choiceList)[i]}</span><button disabled={pos===0} onClick={()=>{const a=[...order];[a[pos-1],a[pos]]=[a[pos],a[pos-1]];setResponse(a);}} aria-label="Move up"><ChevronUp size={16}/></button><button disabled={pos===order.length-1} onClick={()=>{const a=[...order];[a[pos+1],a[pos]]=[a[pos],a[pos+1]];setResponse(a);}} aria-label="Move down"><ChevronDown size={16}/></button></div>})}<button className="button secondary" onClick={()=>setResponse(order)}>Save this sequence</button></div>;};
 const renderBowTie=()=>{const b=data.bowTie;if(!b)return renderChoices(true);return <div className="ngn-bowtie"><label>Most likely condition<select value={selected[0]??""} onChange={e=>setResponse([e.target.value,...selected.slice(1)])}><option value="">Select condition</option>{b.conditions.map((x,i)=><option value={"c"+i} key={i}>{x}</option>)}</select></label><label>Priority actions (select two)</label>{b.actions.map((x,i)=><label className="ngn-check" key={i}><input type="checkbox" checked={selected.includes("a"+i)} onChange={()=>toggle("a"+i)}/>{x}</label>)}<label>Parameters to monitor (select two)</label>{b.monitoring.map((x,i)=><label className="ngn-check" key={i}><input type="checkbox" checked={selected.includes("m"+i)} onChange={()=>toggle("m"+i)}/>{x}</label>)}</div>;};
 const renderDropdown=()=> <div className="ngn-dropdown">{(type==="drop-down-table"?(data.rows??["Clinical interpretation","Nursing response"]):[data.instruction??"Complete the statement"]).map((row,i)=><label key={i}>{row}<select value={selected[i]??""} onChange={e=>{const a=[...selected];a[i]=e.target.value;setResponse(a);}}><option value="">Choose response</option>{choiceList.map((x,j)=><option key={j} value={String(j)}>{x}</option>)}</select></label>)}</div>;
 const renderGraphic=()=> <div className="ngn-graphic"><div className="ngn-graphic-figure"><strong>{data.graphic?.title??item.topic}</strong><p>{data.graphic?.description??"Labeled clinical schematic"}</p><div className="ngn-graphic-labels">{(data.graphic?.labels??choiceList).map((x,i)=><button key={i} className={selected.includes(String(i))?"selected":""} onClick={()=>toggle(String(i))}>{i+1}. {x}</button>)}</div></div></div>;
 const renderInteraction=()=>{switch(type){case"single-response":return renderChoices(false);case"multiple-response":case"extended-multiple-response":return renderChoices(true);case"drop-down-cloze":case"drop-down-table":return renderDropdown();case"highlight-text":case"highlight-table":return renderHighlight();case"matrix-grid":return renderMatrix();case"ordered-response":case"extended-drag-drop":return renderOrdered();case"bow-tie":return renderBowTie();case"trend":return <><div className="ngn-trend">{(data.trend??[]).map((t,i)=><div key={i}><strong>{t.time}</strong><p>{t.findings}</p></div>)}</div>{renderChoices(false)}</>;case"graphics-based":return renderGraphic();default:return renderChoices(false);}};
 return <div className="exam-screen">
  <header className="exam-header"><div className="exam-brand"><span className="exam-brand-mark">Q</span><div><strong>QuickRN</strong><small>RN PRACTICE EXAM</small></div></div><div className="exam-header-center"><strong>NCLEX-RN style practice exam</strong><span>Practice mode · {exam.length} items</span></div><div className="exam-timer"><Clock3 size={17}/><div><small>TIME REMAINING</small><strong>{fmt(seconds)}</strong></div></div><button className="exam-exit" onClick={()=>setFinished(true)}>End exam</button></header>
  <div className="exam-subbar"><span>Candidate practice session</span><span>Responses saved in this session</span></div>
  <div className="exam-layout">
   {showNavigator&&<aside className="exam-nav"><div className="exam-nav-title"><strong>Question navigator</strong><button onClick={()=>setShowNavigator(false)} aria-label="Hide navigator"><X size={16}/></button></div><div className="exam-nav-progress"><div><span>Answered</span><b>{done} / {exam.length}</b></div><i><span style={{width:(done/exam.length*100)+"%"}}/></i></div><div className="exam-number-grid">{exam.map((q,i)=><button key={q.id} className={(i===current?"active ":"")+(answers[q.id]?.length?"answered ":"")+(flagged.includes(q.id)?"flagged":"")} onClick={()=>setCurrent(i)} title={"Question "+(i+1)}>{i+1}{flagged.includes(q.id)&&<Flag size={9}/>}</button>)}</div><div className="exam-legend"><span><i className="legend-current"/>Current</span><span><i className="legend-answered"/>Answered</span><span><i className="legend-flag"/>Flagged</span></div><button className="exam-submit-side" onClick={()=>setFinished(true)}>Submit exam</button></aside>}
   <main className="exam-main">{!showNavigator&&<button className="exam-show-nav" onClick={()=>setShowNavigator(true)}><List size={15}/> Question list</button>}
    <div className="exam-main-top"><span>QUESTION {current+1} OF {exam.length}</span><button className={flagged.includes(item.id)?"exam-flag active":"exam-flag"} onClick={()=>setFlagged(v=>v.includes(item.id)?v.filter(x=>x!==item.id):[...v,item.id])}>{flagged.includes(item.id)?<BookmarkCheck size={16}/>:<Bookmark size={16}/>} {flagged.includes(item.id)?"Flagged for review":"Flag for review"}</button></div>
    {item.caseStudy&&<section className="exam-case"><div className="exam-case-label">CLIENT RECORD · {item.caseStudyId?"UNFOLDING CASE STUDY":"CLINICAL SCENARIO"}</div><p>{item.caseStudy}</p>{item.exhibit&&<details open><summary>Exhibit: Clinical record</summary><p>{item.exhibit}</p></details>}</section>}
    <div className="exam-item-meta"><span>{item.category}</span><span>{item.difficulty}</span><span>{item.topic}</span><span>{LABELS[type]}</span></div>
    <h1 className="exam-stem">{item.prompt}</h1>
    <p className="exam-instruction">{data.instruction??"Select the best response."}</p>
    {renderInteraction()}
    <div className="exam-workspace-note">Your response is saved in this practice session. You may change it before submitting.</div>
    <div className="exam-controls"><button className="exam-prev" disabled={current===0} onClick={()=>setCurrent(v=>Math.max(0,v-1))}><ArrowLeft size={16}/> Previous</button><span>{selected.length?"Response recorded":"No response selected"}</span>{current===exam.length-1?<button className="exam-next" onClick={()=>setFinished(true)}>Review and submit <CheckCircle2 size={16}/></button>:<button className="exam-next" onClick={()=>setCurrent(v=>Math.min(exam.length-1,v+1))}>Next <ArrowRight size={16}/></button>}</div>
   </main>
  </div>
  {finished&&!submitted&&<div className="exam-modal-backdrop"><section className="exam-modal"><div className="exam-modal-icon"><CheckCircle2 size={25}/></div><h2>Submit practice exam?</h2><p>You answered {done} of {exam.length} questions. Unanswered questions will be scored as incorrect.</p><div className="exam-modal-stats"><div><strong>{done}</strong><span>Answered</span></div><div><strong>{exam.length-done}</strong><span>Unanswered</span></div><div><strong>{flagged.length}</strong><span>Flagged</span></div></div><div className="exam-modal-actions"><button onClick={()=>setFinished(false)}>Return to exam</button><button onClick={()=>{setSubmitted(true);setFinished(false);}} className="exam-final-submit">Submit exam</button></div><p className="exam-modal-disclaimer">This practice interface is independently developed and is not an official NCSBN examination or replica.</p></section></div>}
  {submitted&&<div className="exam-modal-backdrop"><section className="exam-modal"><div className="exam-modal-icon"><CheckCircle2 size={25}/></div><h2>Practice exam results</h2><div className="exam-modal-stats"><div><strong>{score}/{exam.length}</strong><span>Score</span></div><div><strong>{Math.round(score/exam.length*100)}%</strong><span>Accuracy</span></div><div><strong>{done}</strong><span>Answered</span></div></div><p>Review the explanations in Practice Questions to reinforce clinical judgment. Scoring is exact-match practice scoring, not official NCLEX partial-credit scoring.</p><div className="exam-modal-actions"><button onClick={onExit} className="exam-final-submit">Return to dashboard</button></div></section></div>}
 </div>;
}

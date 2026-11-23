import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import QuickRNBrand from "./QuickRNBrand";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, X, Calculator, FileText, ClipboardList, MessageSquareWarning } from "lucide-react";
import type { CanonicalNclexItemType, Question, QuestionInteraction } from "./questions";
import { responseScore, estimateCatAbility } from "./examScoring.js";

export type ExamQuestionResult={questionId:string;category:string;topic:string;earnedPoints:number;correct:boolean;answered:boolean};
export type ExamCompletion={mode:"self-study"|"cat"|"readiness";questionCount:number;answeredCount:number;correctCount:number;incorrectCount:number;unansweredCount:number;earnedPoints:number;possiblePoints:number;scorePercent:number;durationSeconds:number;questionResults:ExamQuestionResult[]};
type Props={questions:Question[];onExit:()=>void;defaultQuestionCount?:number;onComplete?:(result:ExamCompletion)=>void;onReportFeedback?:(report:{questionId:string;itemType:string;topic:string;prompt:string;feedback:string;mode:string})=>Promise<void>;onFlagQuestion?:(questionId:string)=>void;onPracticeTopic?:(topic:string)=>void;onPracticeCategory?:(category:string)=>void;savedQuestionIds?:string[];mode?:"self-study"|"cat"|"readiness"};
const LETTERS=["A","B","C","D","E","F","G","H"];
const EMPTY_SAVED_QUESTION_IDS:string[]=[];
const FORMAT_SAMPLER_TYPES:CanonicalNclexItemType[]=["single-response","multiple-response","select-n","drop-down-cloze","drop-down-rationale","highlight-text","matrix-multiple","matrix-single","numeric-entry","ordered-response","bow-tie","drag-drop","trend","graphics-based"];


export default function ExamPage({questions,onExit,defaultQuestionCount=85,onComplete,onReportFeedback,onFlagQuestion,onPracticeTopic,onPracticeCategory,savedQuestionIds=EMPTY_SAVED_QUESTION_IDS,mode="self-study"}:Props){
 const published=useMemo(()=>questions.filter(q=>q.status==="published"),[questions]);
 const [questionCount,setQuestionCount]=useState(String(defaultQuestionCount));
 useEffect(()=>{setQuestionCount(mode==="readiness"&&![85,100,150].includes(defaultQuestionCount)?"85":defaultQuestionCount===600?"all":String(defaultQuestionCount));},[defaultQuestionCount,mode]);
 const [started,setStarted]=useState(false);
 const [startedAt,setStartedAt]=useState<number|null>(null);
 const [completionRecorded,setCompletionRecorded]=useState(false);
 const [formatSampler,setFormatSampler]=useState(false);
 const [samplerSeed,setSamplerSeed]=useState(()=>Math.floor(Math.random()*0x100000000));
 function caseGroupKey(q:Question){return q.caseStudyId??(q.format==="case-study"&&q.caseStudy?`case:${q.caseStudy}`:undefined);}
function expandCaseStudyGroups(items:Question[],publishedItems:Question[]){const emitted=new Set<string>();const output:Question[]=[];for(const q of items){if(emitted.has(q.id))continue;const key=caseGroupKey(q);const group=key?publishedItems.filter(candidate=>caseGroupKey(candidate)===key):[q];for(const member of group){if(!emitted.has(member.id)){output.push(member);emitted.add(member.id);}}}return output;}
function shuffleQuestionBlocks(items:Question[],seed:number){const blocks:Question[][]=[];const emitted=new Set<string>();for(const q of items){if(emitted.has(q.id))continue;const key=caseGroupKey(q);const block=key?items.filter(candidate=>caseGroupKey(candidate)===key):[q];blocks.push(block);block.forEach(member=>emitted.add(member.id));}return seededShuffle(blocks,seed).flat();}
function seededShuffle<T>(items:T[],seed:number){const out=[...items];let state=(seed>>>0)||0x9e3779b9;const random=()=>{state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function normalizedType(q:Question){const t=q.itemType??(q.format==="multiple"?"multiple-response":"single-response");return t==="matrix-grid"?"matrix-multiple":t;}
function selectExamItems(publishedItems:Question[],count:number,seed:number){const shuffled=seededShuffle(publishedItems,seed);const cases=new Map<string,Question[]>();for(const q of publishedItems){const key=caseGroupKey(q);if(key){const group=cases.get(key)??[];group.push(q);cases.set(key,group);}}
 const caseGroups=seededShuffle([...cases.values()],seed+101);const caseScreens=Math.min(count>=6?12:0,caseGroups.reduce((n,g)=>n+g.length,0));const chosenCases:Question[]=[];let screens=0;for(const group of caseGroups){if(screens>=caseScreens)break;if(screens+group.length<=caseScreens){chosenCases.push(...group);screens+=group.length;}}
 const standaloneNgn=shuffled.filter(q=>!caseGroupKey(q)&&normalizedType(q)!=="single-response");const ngnTarget=Math.min(count,Math.max(count>=6?Math.ceil(count*.35):1,chosenCases.length));const ngnStandaloneTarget=Math.max(0,ngnTarget-chosenCases.length);const chosenNgn=seededShuffle(standaloneNgn,seed+211).slice(0,ngnStandaloneTarget);const traditional=shuffled.filter(q=>!caseGroupKey(q)&&normalizedType(q)==="single-response");const traditionalTarget=Math.max(0,count-chosenCases.length-chosenNgn.length);const chosenTraditional=seededShuffle(traditional,seed+307).slice(0,traditionalTarget);return shuffleQuestionBlocks([...chosenTraditional,...chosenCases,...chosenNgn],seed+401);}
const selectedExam=useMemo(()=>{const formatType=(q:Question)=>normalizedType(q);if(formatSampler){const selected:Question[]=[];const used=new Set<string>();for(const type of FORMAT_SAMPLER_TYPES){const preferred=published.filter(q=>!caseGroupKey(q)&&formatType(q)===type&&!used.has(q.id));const fallback=published.filter(q=>formatType(q)===type&&!used.has(q.id));const candidates=[...preferred];for(const q of fallback)if(!candidates.some(candidate=>candidate.id===q.id))candidates.push(q);const randomized=seededShuffle(candidates,samplerSeed+FORMAT_SAMPLER_TYPES.indexOf(type)+1);const picked=randomized[0];if(picked){selected.push(picked);used.add(picked.id);}}return shuffleQuestionBlocks(selected,samplerSeed+401);}if(questionCount==="all"&&mode==="self-study")return shuffleQuestionBlocks(expandCaseStudyGroups(published,published),samplerSeed+401);const count=Number(questionCount);return selectExamItems(published,count,samplerSeed);},[published,questionCount,formatSampler,samplerSeed,mode]);
 const [catExam,setCatExam]=useState<Question[]>([]);
 const exam=mode==="cat"&&catExam.length?catExam:selectedExam;
 const [remainingSeconds,setRemainingSeconds]=useState(5*60*60);
 const [breakCheckpoint,setBreakCheckpoint]=useState(0);
 const [showBreakPrompt,setShowBreakPrompt]=useState(false);
 const [showBreakScreen,setShowBreakScreen]=useState(false);
 const [breakSeconds,setBreakSeconds]=useState(10*60);
 const [answers,setAnswers]=useState<Record<string,string[]>>({});
 const [current,setCurrent]=useState(0);
 const [flagged,setFlagged]=useState<string[]>([]);
 const toggleFlaggedQuestion=(id:string)=>{setFlagged(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);onFlagQuestion?.(id);};
 useEffect(()=>{setFlagged(savedQuestionIds.filter(id=>exam.some(question=>question.id===id)));},[savedQuestionIds,exam]);

 const [finished,setFinished]=useState(false);
 const [submitted,setSubmitted]=useState(false);

 const [showReview,setShowReview]=useState(false);
 const [showCalculator,setShowCalculator]=useState(false);
 const [calculatorPosition,setCalculatorPosition]=useState<{left:number;top:number}|null>(null);
 const [calculatorDrag,setCalculatorDrag]=useState<{offsetX:number;offsetY:number}|null>(null);
 const [showNotes,setShowNotes]=useState(false);
 const [notes,setNotes]=useState<Record<string,string>>({});
 const [showReport,setShowReport]=useState(false);
 const [reportText,setReportText]=useState("");
 const [reportSubmitting,setReportSubmitting]=useState(false);
 const [reportError,setReportError]=useState("");
 const submitItemReport=async()=>{if(!item||!reportText.trim())return;if(!onReportFeedback){setReportError("Question feedback submission is unavailable. Please reload the app and try again.");return;}setReportSubmitting(true);setReportError("");try{await onReportFeedback({questionId:item.id,itemType:type,topic:item.topic,prompt:item.prompt,feedback:reportText.trim(),mode});setShowReport(false);setReportText("");}catch(error){console.error("Unable to submit question report",error);setReportError(error instanceof Error?error.message:"Your report could not be submitted. Please try again.");}finally{setReportSubmitting(false);}};
 const [calcValue,setCalcValue]=useState("0");
 const [reviewFilter,setReviewFilter]=useState<"all"|"incorrect"|"unanswered"|"flagged">("all");
 const [activeRecordTab,setActiveRecordTab]=useState<"notes"|"history"|"medications"|"assessment"|"vitals"|"labs"|"orders"|"flowsheet">("notes");
 const [activeTrendIndex,setActiveTrendIndex]=useState(0);
 const [reviewIndex,setReviewIndex]=useState(0);
 const item=exam[current];

 const done=Object.keys(answers).filter(k=>(answers[k]??[]).some(value=>value!=="")).length;
 const expected=(q:Question)=>q.interaction?.correctResponse??[String(q.answer)];
 const itemCredit=(q:Question,actual:string[])=>{const itemType=q.itemType??(q.format==="multiple"?"multiple-response":"single-response");const target=expected(q);if(itemType==="numeric-entry"){if(actual.length!==1||target.length!==1)return 0;const value=Number(actual[0]),key=Number(target[0]);return Number.isFinite(value)&&Number.isFinite(key)&&Math.abs(value-key)<=(q.interaction?.numericTolerance??0)?1:0;}return responseScore(itemType,actual,target);};
 const isQuestionCorrect=(q:Question,actual:string[])=>itemCredit(q,actual)===1;
 const correct=(q:Question)=>isQuestionCorrect(q,answers[q.id]??[]);
 const score=exam.reduce((n,q)=>n+itemCredit(q,answers[q.id]??[]),0);
 const selected=item?(answers[item.id]??[]):[];
 const hasAnsweredCurrent=selected.some(value=>value!=="");
 const setResponse=(values:string[])=>{if(item)setAnswers(old=>({...old,[item.id]:values}));};
 const setIndexedResponse=(index:number,value:string)=>{const next=[...selected];while(next.length<=index)next.push("");next[index]=value;setResponse(next);};
 const toggle=(value:string)=>setResponse(selected.includes(value)?selected.filter(x=>x!==value):[...selected,value]);

 const type=item?(item.itemType??(item.format==="multiple"?"multiple-response":"single-response")):"single-response";
 const isUnfoldingCase=!!item&&(!!item.caseStudyId||(!!item.caseStudy&&item.format==="case-study"));
 const isTwoPaneQuestion=["multiple-response","select-n","drop-down-cloze","matrix-multiple","matrix-single","numeric-entry","ordered-response","bow-tie","drag-drop","trend","highlight-text","drop-down-rationale"].includes(type);
 const hasProgressNotes=!!item?.caseRecord?.progressNotes?.trim();
 const hasClinicalRecord=!!item&&(item.caseRecord?hasProgressNotes:(isUnfoldingCase||isTwoPaneQuestion)&&!!(item.caseStudy||item.clinicalScenario||item.exhibit||(type==="trend"&&item.interaction?.trend?.length)));
 const currentCaseItems=isUnfoldingCase?exam.filter(q=>caseGroupKey(q)===caseGroupKey(item!)):[ ];
 const caseScreen=isUnfoldingCase?currentCaseItems.findIndex(q=>q.id===item!.id)+1:0;
 const recordText=item?.caseStudy??"";
 const vitalLines=[...recordText.matchAll(/(?:BP|HR|RR|SpO2|temperature|Temp|O2 saturation)[^\n.]*(?:\.|$)/gi)].map(m=>m[0].trim());
 const caseRecord=item?.caseRecord;
 const recordTabs:{key:typeof activeRecordTab;label:string;content:string}[]=caseRecord?[
  {key:"notes",label:"Progress Notes",content:[caseRecord.progressNotes,caseRecord.flowSheet].filter(value=>!!value?.trim()).join("\n\n")||recordText},
  {key:"history",label:"History",content:caseRecord.history??""},
  {key:"medications",label:"Medication List",content:caseRecord.medicationList??""},
  {key:"assessment",label:"Assessment",content:caseRecord.assessment??""},
  {key:"vitals",label:"Vital Signs",content:caseRecord.vitalSigns??vitalLines.join("\n")},
  {key:"labs",label:"Lab Results",content:caseRecord.labs??""},
  {key:"orders",label:"Provider Orders",content:caseRecord.providerOrders??""},
  {key:"flowsheet",label:"Flow Sheet",content:caseRecord.flowSheet??(currentCaseItems.slice(0,caseScreen).map((entry,index)=>"Screen "+(index+1)+" · "+(entry.caseRecord?.progressNotes??"Clinical update")+"\n"+(entry.caseRecord?.vitalSigns??"")).join("\n\n")+(caseRecord.assessment?"\n\nCurrent assessment\n"+caseRecord.assessment:"")+(caseRecord.labs?"\n\nCurrent labs\n"+caseRecord.labs:"")||"No additional flow-sheet observations are documented.")}
 ]:[];
 const visibleRecordTabs=recordTabs.filter(tab=>!!tab.content?.trim()&&!/^No (?:additional|separate|laboratory)/i.test(tab.content.trim()));
 const selectedRecordTab=visibleRecordTabs.find(tab=>tab.key===activeRecordTab)??visibleRecordTabs[0];
 const activeRecordContent=selectedRecordTab?.content??"";
 const data:QuestionInteraction=item?.interaction??{instruction:type==="multiple-response"?"Select all that apply.":"Select one response.",choices:item?.options??[],correctResponse:item?[String(item.answer)]:[]};
 const choices=data.choices??item?.options??[];
 const go=(i:number)=>{setCurrent(Math.max(0,Math.min(exam.length-1,i)));setShowReview(false);setShowNotes(false);setActiveRecordTab("notes");setActiveTrendIndex(0);};
 const renderChoices=(multi:boolean,limit?:number)=><div className="exam-options">{choices.map((opt,i)=>{const value=String(i);const isSelected=selected.includes(value);const limitReached=multi&&limit!==undefined&&selected.length>=limit&&!isSelected;return <label key={i} className={"exam-option "+(multi?"multi ":"")+(isSelected?"selected":"")}><input type={multi?"checkbox":"radio"} name={item!.id+"-response"} value={value} checked={isSelected} disabled={limitReached} onChange={()=>{if(!multi){setResponse([value]);return;}if(isSelected){toggle(value);return;}if(limit===undefined||selected.length<limit)toggle(value);}}/>{(multi||type!=="single-response")&&<span className="exam-option-letter">{LETTERS[i]??i+1}.</span>}<span className="exam-option-text">{opt}</span></label>})}</div>;
 const renderMatrix=(forceMultiple?:boolean)=>{
  const columns=data.columns??["Expected","Needs follow-up","Emergency"];
  const multiple=type==="matrix-multiple"||(type==="matrix-grid"&&(forceMultiple??data.matrixMode==="multiple"));
  if(data.matrixGroups?.length)return <div className="ngn-matrix ngn-matrix-grouped"><table><thead><tr><th>Client need</th><th>Potential nursing interventions</th></tr></thead><tbody>{data.matrixGroups.map((group,i)=><tr key={i}><th>{group.label}</th><td><div className="ngn-matrix-group-options">{group.options.map((option,j)=>{const value="g"+i+":"+j;return <label className="ngn-matrix-group-option" key={value}><input type="radio" name={item!.id+"-matrix-group-"+i} checked={selected.includes(value)} onChange={()=>setResponse([...selected.filter(v=>!v.startsWith("g"+i+":")),value])}/><span>{option}</span></label>;})}</div></td></tr>)}</tbody></table></div>;
  return <div className="ngn-matrix"><table><thead><tr><th>Clinical finding</th>{columns.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{(data.rows??[]).map((row,i)=><tr key={i}><th>{row}</th>{columns.map((column,j)=>{const key=i+":"+j;return <td key={column}><label className="exam-radio-cell"><input type={multiple?"checkbox":"radio"} name={item!.id+"-matrix-"+i} checked={selected.includes(key)} onChange={()=>setResponse(multiple?(selected.includes(key)?selected.filter(v=>v!==key):[...selected,key]):[...selected.filter(v=>!v.startsWith(i+":")),key])}/><span>{column}</span></label></td>;})}</tr>)}</tbody></table></div>;
 };
 const renderHighlight=()=>type==="highlight-table"?<div className="ngn-matrix"><table><thead><tr><th>Clinical cue</th><th>Highlight</th></tr></thead><tbody>{(data.segments??[]).map((s,i)=><tr key={i}><td>{s}</td><td><input aria-label={"Highlight cue "+(i+1)} type="checkbox" checked={selected.includes(String(i))} onChange={()=>toggle(String(i))}/></td></tr>)}</tbody></table></div>:<div className="ngn-highlight"><div className="ngn-highlight-passage" aria-label="Clinical passage for text highlighting">{(data.segments?.length?data.segments:[item!.clinicalScenario??item!.prompt]).map((token,i)=>{const value=token.trim();const selectable=(data.highlightableSegments??[]).includes(value);return selectable?<button type="button" key={i} className={selected.includes(value)?"selected":""} aria-pressed={selected.includes(value)} onClick={()=>setResponse(selected.includes(value)?selected.filter(x=>x!==value):[...selected,value])}>{token}</button>:<span className="highlight-disabled" key={i}>{token}</span>;})}</div><div className="ngn-highlight-selections"><strong>Highlighted response</strong>{selected.length?selected.map(s=><mark key={s}>{s}</mark>):<span>No text selected yet</span>}</div></div>;
const renderOrdered=()=>{const source=data.orderItems??choices;const order=selected.length?selected:source.map((_,i)=>String(i));return <div className="ngn-order">{order.map((entry,pos)=>{const i=Number(entry);return <div className="ngn-order-row" key={entry} draggable={true} onDragStart={e=>e.dataTransfer.setData("text/plain",String(pos))} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const from=Number(e.dataTransfer.getData("text/plain"));const a=[...order];const [picked]=a.splice(from,1);a.splice(pos,0,picked);setResponse(a);}}><span className="ngn-order-number">{pos+1}</span><span className="ngn-order-text">{source[i]}</span></div>})}</div>;};
 const renderBowTie=()=>{const b=data.bowTie;if(!b)return renderChoices(true);const group=(prefix:string)=>selected.filter(v=>v.startsWith(prefix));const assign=(prefix:string,slotIndex:number,value:string)=>{if(prefix==="c"){setResponse([...selected.filter(v=>!v.startsWith("c")),value]);return;}const choice=value.slice(1);const token=prefix+slotIndex+"-"+choice;const next=selected.filter(v=>!(v.startsWith(prefix)&&v.split("-")[1]===choice)&&!v.startsWith(prefix+slotIndex+"-"));setResponse([...next,token]);};const add=(prefix:string,value:string,limit:number)=>{if(prefix==="c"){if(selected.includes(value))setResponse(selected.filter(v=>v!==value));else setResponse([...selected.filter(v=>!v.startsWith("c")),value]);return;}const choice=value.slice(1);const existing=selected.find(v=>v.startsWith(prefix)&&v.split("-")[1]===choice);if(existing){setResponse(selected.filter(v=>v!==existing));return;}const occupied=[0,1].findIndex(slotIndex=>!selected.some(v=>v.startsWith(prefix+slotIndex+"-")));if(occupied>=0&&occupied<limit)assign(prefix,occupied,value);};const drop=(event:DragEvent<HTMLDivElement>,prefix:string,slotIndex:number)=>{event.preventDefault();const value=event.dataTransfer.getData("text/plain");if(value.startsWith(prefix))assign(prefix,slotIndex,value);};const slot=(prefix:string,index:number,placeholder:string,value:string|undefined,label:string|undefined)=><div className={"ngn-bowtie-drop-slot "+(value?"filled":"")} onDragOver={event=>event.preventDefault()} onDrop={event=>drop(event,prefix,index)}>{value?<button type="button" draggable onDragStart={event=>event.dataTransfer.setData("text/plain",value)} onClick={()=>setResponse(selected.filter(v=>v!==value))} aria-label={"Remove selected "+label+" from bow-tie slot"} title="Click to remove; drag back to the choices">{label} <span aria-hidden="true">×</span></button>:<span>{placeholder}</span>}</div>;const actionValues=[selected.find(v=>v.startsWith("a0-")),selected.find(v=>v.startsWith("a1-"))],monitorValues=[selected.find(v=>v.startsWith("m0-")),selected.find(v=>v.startsWith("m1-"))],conditionValue=group("c")[0];const choiceIndex=(token:string)=>Number(token.split("-")[1]);const bank=(prefix:string,title:string,items:string[],limit:number)=><div className="ngn-bowtie-column"><strong>{title}</strong>{items.map((label,i)=>{const value=prefix+i;const isChosen=prefix==="c"?selected.includes(value):selected.some(v=>v.startsWith(prefix)&&choiceIndex(v)===i);return <button type="button" key={i} draggable={!isChosen} className={"ngn-bowtie-tile "+(isChosen?"selected":"")} onDragStart={event=>event.dataTransfer.setData("text/plain",value)} onClick={()=>add(prefix,value,limit)}>{label}</button>;})}</div>;return <div className={"ngn-bowtie-workspace "+(isUnfoldingCase?"ngn-bowtie-case":"")}><section className="ngn-bowtie-response"><div className="ngn-bowtie-layout"><div className="ngn-bowtie-diagram"><div className="ngn-bowtie-slot ngn-bowtie-actions"><strong>Actions to take</strong>{[0,1].map(i=>{const v=actionValues[i];return slot("a",i,"Drop action here",v,v?b.actions[choiceIndex(v)]:undefined);})}</div><div className="ngn-bowtie-condition"><strong>Potential condition</strong>{slot("c",0,"Drop condition here",conditionValue,conditionValue?b.conditions[Number(conditionValue.slice(1))]:undefined)}</div><div className="ngn-bowtie-slot ngn-bowtie-monitors"><strong>Parameters to monitor</strong>{[0,1].map(i=>{const v=monitorValues[i];return slot("m",i,"Drop parameter here",v,v?b.monitoring[choiceIndex(v)]:undefined);})}</div></div><div className="ngn-bowtie-bank" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const value=event.dataTransfer.getData("text/plain");setResponse(selected.filter(v=>v!==value));}}><div className="ngn-bowtie-remove-hint">Drag a filled response here to remove it</div>{bank("a","Actions to take · Choose two",b.actions,2)}{bank("c","Potential conditions · Choose one",b.conditions,1)}{bank("m","Parameters to monitor · Choose two",b.monitoring,2)}</div></div></section></div>;};
 const renderDropdown=()=>type==="drop-down-table"?<div className="ngn-matrix"><table><thead><tr><th>Clinical judgment element</th><th>Choose response</th></tr></thead><tbody>{(data.rows??["Complete the statement"]).map((row,i)=>{const rowChoices=data.rowChoices?.[i]??choices;const value=selected.find(v=>v.startsWith(i+":"))?.slice(String(i).length+1)??"";return <tr key={i}><th>{row}</th><td><select aria-label={row} value={value} onChange={e=>{const next=selected.filter(v=>!v.startsWith(i+":"));if(e.target.value!=="")next.push(i+":"+e.target.value);setResponse(next);}}><option value="">Select response</option>{rowChoices.map((x,j)=><option key={j} value={String(j)}>{x}</option>)}</select></td></tr>;})}</tbody></table></div>:<div className="ngn-dropdown"><div className="ngn-cloze-sentence">{(data.clozeTemplate??(item!.prompt+" The priority response is [BLANK_1].")).split(/(\[BLANK_\d+\])/g).map((part,i)=>{const match=part.match(/^\[BLANK_(\d+)\]$/);if(!match)return part;const index=Number(match[1])-1;const options=data.clozeChoicesByBlank?.[index]??data.clozeChoices??choices;return <select key={i} aria-label={"Blank "+(index+1)} value={selected[index]??""} onChange={e=>{setIndexedResponse(index,e.target.value);}}><option value="">Select response</option>{options.map((choice,j)=><option key={j} value={String(j)}>{choice}</option>)}</select>;})}</div></div>;
 const renderRationale=()=>{const template=data.rationaleTemplate??"The nurse should [BLANK_1] because [BLANK_2].";return <div className="ngn-dropdown"><div className="ngn-cloze-sentence">{template.split(/(\[BLANK_\d+\])/g).map((part,i)=>{const match=part.match(/^\[BLANK_(\d+)\]$/);if(!match)return part;const index=Number(match[1])-1;const options=data.rationaleChoicesByBlank?.[index]??choices;return <select key={i} aria-label={"Rationale blank "+(index+1)} value={selected[index]??""} onChange={e=>{const next=[...selected];next[index]=e.target.value;setResponse(next);}}><option value="">Select response</option>{options.map((choice,j)=><option key={j} value={String(j)}>{choice}</option>)}</select>;})}</div></div>;};
 const renderDragDrop=()=>{const template=data.dragDropTemplate??"The nurse should first [BLANK_1] and then [BLANK_2].";const options=data.dragDropChoices??choices;const blankMatches=[...template.matchAll(/\[BLANK_(\d+)\]/g)];const setSlot=(index:number,value:string)=>{const next=[...selected];for(let i=0;i<next.length;i++){if(i!==index&&next[i]===value)next[i]="";}while(next.length<=index)next.push("");next[index]=value;setResponse(next);};return <div className="ngn-dragdrop"><div className="ngn-dragdrop-sentence">{template.split(/(\[BLANK_\d+\])/g).map((part,i)=>{const match=part.match(/^\[BLANK_(\d+)\]$/);if(!match)return part;const index=Number(match[1])-1;const value=selected[index];return <span key={i} className={"ngn-dragdrop-slot "+(value!==undefined&&value!==""?"filled":"")} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();setSlot(index,e.dataTransfer.getData("text/plain"));}}>{value!==undefined&&value!==""?<button type="button" onClick={()=>{const next=[...selected];next[index]="";setResponse(next);}}>{options[Number(value)]??"Selected"} ×</button>:"Drop answer here"}</span>;})}</div><div className="ngn-dragdrop-bank"><strong>Word choices</strong>{options.map((choice,i)=>{const value=String(i),used=selected.includes(value);return <button type="button" key={i} draggable={!used} disabled={used} onDragStart={e=>e.dataTransfer.setData("text/plain",value)} onClick={()=>{const nextBlank=blankMatches.find(m=>!selected[Number(m[1])-1]);if(nextBlank)setSlot(Number(nextBlank[1])-1,value);}}>{choice}</button>;})}</div></div>;};
 const renderNumeric=()=> <div className="ngn-numeric"><div><input id="exam-numeric-answer" aria-label="Numeric response" type="number" inputMode="decimal" step="any" value={selected[0]??""} onChange={e=>setResponse(e.target.value===""?[]:[e.target.value])} placeholder=""/>{data.numericUnit&&<span>{data.numericUnit}</span>}</div></div>;
 const renderGraphic=()=>{const hotspots=data.graphic?.hotspots??[];return <div className="ngn-graphic"><div className="ngn-graphic-figure"><strong>{data.graphic?.title??"Clinical diagram"}</strong><p>{data.graphic?.description??"Select the location on the anatomical reference."}</p>{hotspots.length?<div style={{position:"relative",width:"100%",maxWidth:760,margin:"0 auto"}}><img src="/assets/clinical-landmark-map.svg" alt="Schematic anatomical landmark reference showing anterior torso, posterior torso, and foot" style={{display:"block",width:"100%",height:"auto"}}/>{hotspots.map((spot,i)=><button type="button" key={i} aria-label={"Select landmark "+(i+1)+": "+spot.label} title={spot.label} className={selected.includes(String(i))?"selected":""} onClick={()=>toggle(String(i))} style={{position:"absolute",left:spot.x+"%",top:spot.y+"%",transform:"translate(-50%,-50%)",width:38,height:38,borderRadius:999,border:"3px solid #1d4f91",background:selected.includes(String(i))?"#1d4f91":"#fff",color:selected.includes(String(i))?"#fff":"#173b68",fontWeight:800,cursor:"pointer"}}>{i+1}</button>)}</div>:<svg viewBox="0 0 640 180" role="img" aria-label={data.graphic?.title??"Clinical diagram"}><rect x="8" y="8" width="624" height="164" rx="14" fill="#eef3f8" stroke="#9aabc0"/>{(data.graphic?.labels??choices).map((x,i)=><g key={i}><rect x={22+(i%2)*305} y={20+Math.floor(i/2)*72} width="285" height="58" rx="9" fill={selected.includes(String(i))?"#dce9ff":"#fff"} stroke="#72859d"/><text x={34+(i%2)*305} y={54+Math.floor(i/2)*72} fontSize="15" fill="#24364b">{i+1}. {x.slice(0,34)}</text></g>)}</svg>}<div className="ngn-graphic-labels">{(data.graphic?.labels??choices).map((x,i)=><button type="button" key={i} className={selected.includes(String(i))?"selected":""} onClick={()=>toggle(String(i))}>Select {i+1}: {x}</button>)}</div></div></div>;};
 const renderTrend=()=> <section className="ngn-trend ngn-trend-response">{renderChoices(false)}</section>;
 const renderInteraction=()=>{switch(type){case"single-response":return renderChoices(false);case"multiple-response":case"extended-multiple-response":return renderChoices(true);case"select-n":return <>{renderChoices(true,data.selectCount??2)}</>;case"drop-down-cloze":case"drop-down-table":return renderDropdown();case"drop-down-rationale":return renderRationale();case"highlight-text":case"highlight-table":return renderHighlight();case"matrix-multiple":return renderMatrix(true);case"matrix-single":return renderMatrix(false);case"matrix-grid":return renderMatrix();case"numeric-entry":return renderNumeric();case"ordered-response":case"extended-drag-drop":return renderOrdered();case"drag-drop":return renderDragDrop();case"bow-tie":return renderBowTie();case"trend":return renderTrend();case"graphics-based":return renderGraphic();default:return renderChoices(false);}};
 const reviewLabels=(q:Question,values:string[])=>{
  const t=q.itemType??(q.format==="multiple"?"multiple-response":"single-response");
  const d:QuestionInteraction=q.interaction??{choices:q.options,correctResponse:[String(q.answer)]};
  const opts=d.choices??q.options;
  if(t==="drop-down-cloze")return values.length?values.map((v,i)=>v===""?"Blank "+(i+1)+": Not answered":(d.clozeChoicesByBlank?.[i]??d.clozeChoices??opts)[Number(v)]??v):["Not answered"];
  if(t==="drop-down-rationale")return values.length?values.map((v,i)=>v===""?"Blank "+(i+1)+": Not answered":(d.rationaleChoicesByBlank?.[i]??opts)[Number(v)]??v):["Not answered"];
  if(t==="drag-drop")return values.length?values.map((v,i)=>v===""?"Blank "+(i+1)+": Not answered":(d.dragDropChoices??opts)[Number(v)]??v):["Not answered"];
  values=values.filter(value=>value!=="");
  if(!values.length)return ["Not answered"];
  if(d.matrixGroups?.length)return values.map(v=>{const match=v.match(/^g(\d+):(\d+)$/);if(!match)return v;const group=d.matrixGroups![Number(match[1])];return (group?.label??"Client need")+": "+(group?.options[Number(match[2])]??v);});
  if(t==="matrix-grid"||t==="matrix-multiple"||t==="matrix-single")return values.map(v=>{const [row,...rest]=v.split(":");const ri=Number(row);return (d.rows?.[ri]??"Finding "+(ri+1))+": "+(d.columns?.[Number(rest.join(":"))]??rest.join(":"));});
  if(t==="drop-down-table")return values.map(v=>{const [row,...rest]=v.split(":");const ri=Number(row),choice=Number(rest.join(":"));return (d.rows?.[ri]??"Row "+(ri+1))+": "+(d.rowChoices?.[ri]?.[choice]??opts[choice]??rest.join(":"));});
  if(t==="numeric-entry")return values.map(v=>v+(d.numericUnit?" "+d.numericUnit:""));
  if(t==="highlight-text")return values;
  if(t==="highlight-table")return values.map(v=>d.segments?.[Number(v)]??v);
  if(t==="bow-tie"&&d.bowTie)return values.map(v=>{if(v.startsWith("c"))return "Condition: "+d.bowTie!.conditions[Number(v.slice(1))];if(v.startsWith("a"))return "Action "+(Number(v[1])+1)+": "+d.bowTie!.actions[Number(v.split("-")[1])];if(v.startsWith("m"))return "Monitor "+(Number(v[1])+1)+": "+d.bowTie!.monitoring[Number(v.split("-")[1])];return v;});
  if(t==="ordered-response"||t==="extended-drag-drop")return values.map(v=>(d.orderItems??opts)[Number(v)]??v);
  if(t==="graphics-based")return values.map(v=>d.graphic?.labels[Number(v)]??opts[Number(v)]??v);
  return values.map(v=>opts[Number(v)]??v);
 };
 const reviewItems=exam.map((q,i)=>({q,i})).filter(({q})=>reviewFilter==="all"||(reviewFilter==="incorrect"&&(answers[q.id]??[]).some(value=>value!=="")&&!correct(q))||(reviewFilter==="unanswered"&&!(answers[q.id]??[]).some(value=>value!==""))||(reviewFilter==="flagged"&&flagged.includes(q.id)));
 const submitExam=()=>{setFinished(false);setShowBreakPrompt(false);setShowBreakScreen(false);setReviewIndex(0);setActiveRecordTab("notes");if(!completionRecorded){const questionResults:ExamQuestionResult[]=exam.map(q=>{const response=answers[q.id]??[];return {questionId:q.id,category:q.category,topic:q.topic,earnedPoints:itemCredit(q,response),correct:isQuestionCorrect(q,response),answered:response.some(value=>value!=="")};});const answeredCount=questionResults.filter(result=>result.answered).length;const correctCount=questionResults.filter(result=>result.correct).length;const possiblePoints=exam.length;onComplete?.({mode,questionCount:exam.length,answeredCount,correctCount,incorrectCount:questionResults.filter(result=>result.answered&&!result.correct&&result.earnedPoints===0).length,unansweredCount:exam.length-answeredCount,earnedPoints:score,possiblePoints,scorePercent:possiblePoints?Math.round(score/possiblePoints*100):0,durationSeconds:startedAt?Math.max(0,Math.round((Date.now()-startedAt)/1000)):0,questionResults});setCompletionRecorded(true);}setSubmitted(true);};
 const advanceAdaptive=()=>{if(mode!=="self-study"&&!hasAnsweredCurrent)return;if(mode!=="cat"){go(current+1);return;}const answered=catExam.map(q=>({q}));const ability=estimateCatAbility(answered.map(x=>({earned:itemCredit(x.q,answers[x.q.id]??[]),difficulty:x.q.difficulty})));const target=ability< -0.45?"Foundational":ability>0.55?"Advanced":"Intermediate";const used=new Set(catExam.map(q=>q.id));const counts=new Map<string,number>();catExam.forEach(q=>counts.set(q.category,(counts.get(q.category)??0)+1));const pool=seededShuffle(published.filter(q=>!used.has(q.id)),samplerSeed+catExam.length);const ranked=pool.map(q=>({q,score:(q.difficulty===target?0: q.difficulty==="Intermediate"?1:2)+(counts.get(q.category)??0)*0.08})).sort((a,b)=>a.score-b.score);const nextQuestion=ranked[0]?.q;if(nextQuestion&&catExam.length<150){setCatExam(old=>[...old,nextQuestion]);go(current+1);}else{setReviewFilter("all");setShowReview(true);}};
 useEffect(()=>{if(!started||submitted||mode==="self-study")return;const timer=window.setInterval(()=>setRemainingSeconds(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer);},[started,submitted,mode]);
 useEffect(()=>{if(started&&!submitted&&mode!=="self-study"&&remainingSeconds===0)submitExam();},[remainingSeconds,started,submitted,mode]);
 const breakThresholds=[3*60*60,90*60];
 useEffect(()=>{if(!started||submitted||mode==="self-study"||showBreakScreen||breakCheckpoint>=breakThresholds.length)return;if(remainingSeconds<=breakThresholds[breakCheckpoint]){setShowBreakPrompt(true);setBreakCheckpoint(value=>value+1);}},[remainingSeconds,started,submitted,mode,breakCheckpoint,showBreakScreen]);
 useEffect(()=>{if(!showBreakScreen)return;const timer=window.setInterval(()=>setBreakSeconds(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer);},[showBreakScreen]);
 useEffect(()=>{if(showBreakScreen&&breakSeconds===0)setShowBreakScreen(false);},[showBreakScreen,breakSeconds]);
 if(!published.length)return <div className="exam-screen"><div className="exam-empty"><h2>No published questions available</h2><p>There are no published questions available for this examination.</p><button className="exam-next" onClick={onExit}>Return to QuickRN</button></div></div>;
 const canStartExam = mode === "cat" || (formatSampler ? selectedExam.length === FORMAT_SAMPLER_TYPES.length : selectedExam.length === (questionCount === "all" ? published.length : Number(questionCount)));
 const handleStartExam = () => {
  const nextSeed = Math.floor(Math.random() * 0x100000000);
  setSamplerSeed(nextSeed);
  setStarted(true);
  setStartedAt(Date.now());
  setCompletionRecorded(false);
  setCurrent(0);
  setAnswers({});
  setFlagged(savedQuestionIds.filter(id => exam.some(question => question.id === id)));
  setNotes({});
  setFinished(false);
  setSubmitted(false);
  setReviewIndex(0);
  setRemainingSeconds(5 * 60 * 60);
  setBreakCheckpoint(0);
  setShowBreakPrompt(false);
  setShowBreakScreen(false);
  setBreakSeconds(10 * 60);
  const firstCatQuestion =
   seededShuffle(published.filter(q => q.difficulty === "Intermediate"), nextSeed)[0] ??
   seededShuffle(published, nextSeed)[0];
  setCatExam(mode === "cat" && firstCatQuestion ? [firstCatQuestion] : []);
 };
 if (!started) {
  return (
   <div className="exam-screen exam-setup">
    <header className="exam-header">
     <QuickRNBrand className="exam-brand" tagline="RN LICENSURE PRACTICE" compact />
     <button type="button" className="exam-exit" onClick={onExit}>Exit</button>
    </header>
    <main className="exam-setup-content">
     <div className="exam-setup-kicker">
      {mode === "cat" ? "COMPUTER ADAPTIVE TEST" : mode === "readiness" ? "NCLEX READINESS EXAM" : "SELF-PACED PRACTICE EXAM"}
     </div>
     <h1>
      {mode === "cat" ? "Start your adaptive examination" : mode === "readiness" ? "Start your readiness examination" : "Choose your examination length"}
     </h1>
     <p>
      {mode === "cat"
       ? "The next question is selected based on your response history. The session runs for up to five hours and ends between 85 and 150 questions."
       : mode === "readiness"
        ? "Choose an 85-, 100-, or 150-question timed practice assessment. Your report will show performance by category and questions to review; it is not a pass prediction."
        : "Work through the questions at your own pace. There is no countdown timer."}
     </p>
     {(mode === "self-study" || mode === "readiness") && (
      <>
       <div className="exam-length-options">
        {(mode === "readiness"
         ? [
            { value: "85", label: "85 questions", detail: "Practice-length assessment" },
            { value: "100", label: "100 questions", detail: "Extended assessment" },
            { value: "150", label: "150 questions", detail: "Maximum-length practice" }
           ]
         : [
            { value: "20", label: "20 questions", detail: "Quick practice" },
            { value: "60", label: "60 questions", detail: "Focused session" },
            { value: "85", label: "85 questions", detail: "NCLEX-length practice" },
            { value: "150", label: "150 questions", detail: "Extended practice" },
            { value: "all", label: "All questions", detail: published.length + " available" }
           ]
        ).map(option => (
         <button
          type="button"
          key={option.value}
          className={!formatSampler && questionCount === option.value ? "active" : ""}
          onClick={() => {
           setFormatSampler(false);
           setQuestionCount(option.value);
          }}
         >
          <strong>{option.label}</strong>
          <span>{option.detail}</span>
         </button>
        ))}
       </div>
       {mode === "readiness" && (
        <p className="exam-setup-note">
         Selected assessment: {selectedExam.length} of {Number(questionCount)} requested questions available in the published bank.
        </p>
       )}
       {mode === "self-study" && (
        <button
         type="button"
         className={"exam-format-sampler " + (formatSampler ? "active" : "")}
         onClick={() => {
          setSamplerSeed(value => value + 1);
          setFormatSampler(true);
         }}
        >
         <strong>14-format NGN sampler</strong>
         <span>One published item from each supported interaction format</span>
        </button>
       )}
      </>
     )}
     <button type="button" className="exam-start-button" disabled={!canStartExam} onClick={handleStartExam}>
      Begin examination <ArrowRight size={18} />
     </button>
     <div className="exam-setup-note">
      <span>{mode === "self-study" ? "Self-paced" : "Timed · 5 hours"}</span>
      <span>Responses save automatically</span>
      <span>Review before submission</span>
     </div>
    </main>
   </div>
  );
 }
 if(!item)return <div className="exam-screen"><div className="exam-empty"><h2>No questions in this examination</h2><button className="exam-next" onClick={onExit}>Return to QuickRN</button></div></div>;
 if(submitted){
  const q=exam[reviewIndex]??exam[0];
  const response=answers[q.id]??[];
  const expectedResponse=expected(q);
  const isCorrect=isQuestionCorrect(q,response);
  const qData:QuestionInteraction=q.interaction??{choices:q.options,correctResponse:[String(q.answer)]};
  const reviewRecordTabs:{key:"notes"|"history"|"medications"|"assessment"|"vitals"|"labs"|"orders"|"flowsheet";label:string;content:string}[]=q.caseRecord?[
   {key:"notes",label:"Progress Notes",content:[q.caseRecord.progressNotes,q.caseRecord.flowSheet].filter(value=>!!value?.trim()).join("\n\n")||q.caseStudy||""},
   {key:"history",label:"History",content:q.caseRecord.history??"No additional history is documented."},
   {key:"medications",label:"Medication List",content:q.caseRecord.medicationList??"No medication list is documented."},
   {key:"assessment",label:"Assessment",content:q.caseRecord.assessment??"No separate assessment is documented."},
   {key:"vitals",label:"Vital Signs",content:q.caseRecord.vitalSigns??"No separate vital-sign record is documented."},
   {key:"labs",label:"Lab Results",content:q.caseRecord.labs??q.exhibit??"No laboratory results are documented."},
   {key:"orders",label:"Provider Orders",content:q.caseRecord.providerOrders??"No separate provider orders are documented."},
   {key:"flowsheet",label:"Flow Sheet",content:q.caseRecord.flowSheet??exam.filter(entry=>entry.caseStudyId===q.caseStudyId&&exam.indexOf(entry)<=reviewIndex).map((entry,index)=>"Screen "+(index+1)+" · "+(entry.caseRecord?.progressNotes??"Clinical update")+"\n"+(entry.caseRecord?.vitalSigns??"")).join("\n\n")}
  ]:[];
  const reviewRecordActive=reviewRecordTabs.find(tab=>tab.key===activeRecordTab)??reviewRecordTabs[0];
  const actualLabels=reviewLabels(q,response);
  const correctLabels=reviewLabels(q,expectedResponse);const catAbility=mode==="cat"?estimateCatAbility(catExam.map(question=>({earned:itemCredit(question,answers[question.id]??[]),difficulty:question.difficulty}))):0;
  const credit=itemCredit(q,response);const status=response.every(value=>value==="")?"Unanswered":credit===1?"Correct":credit>0?"Partially correct":"Incorrect";
  const readinessCategoryMetrics=exam.reduce((groups,question)=>{const current=groups[question.category]??{total:0,earned:0};current.total+=1;current.earned+=itemCredit(question,answers[question.id]??[]);groups[question.category]=current;return groups;},{} as Record<string,{total:number;earned:number}>);
  const readinessCategoryRows=Object.entries(readinessCategoryMetrics).map(([name,value])=>({name,...value,percent:Math.round(value.earned/value.total*100)})).sort((a,b)=>a.percent-b.percent);
  const firstNeedsReviewIndex=exam.findIndex(question=>!isQuestionCorrect(question,answers[question.id]??[]));
  const needsReviewCount=exam.filter(question=>!isQuestionCorrect(question,answers[question.id]??[])).length;
  return <div className="exam-screen exam-review-screen">
   <header className="exam-header"><QuickRNBrand className="exam-brand" tagline="RN LICENSURE PRACTICE" compact /><div className="exam-header-center"><strong>Examination Review</strong><span>Submitted responses and rationales</span></div><button type="button" className="exam-exit" onClick={onExit}>Return to dashboard</button></header>
   <section className="exam-review-summary"><div><span>EXAMINATION COMPLETE</span><h1>Review your performance</h1><p>Review each item, compare your response with the keyed answer, and read the rationale.</p>{mode!=="self-study"&&done===exam.length&&<p className="exam-review-flag-summary">{flagged.length} question{flagged.length===1?"":"s"} flagged for review</p>}</div><div className="exam-review-score"><strong>{score}/{exam.length}</strong><span>{Math.round(score/exam.length*100)}% partial-credit score</span>{mode==="readiness"&&<small>Practice assessment result only. This score is not a validated readiness classification or an NCLEX pass prediction.</small>}{mode==="cat"&&<small>Uncalibrated CAT-style ability estimate: {catAbility.toFixed(2)} · not an official NCLEX result</small>}</div></section>
   <section className="exam-readiness-report" aria-label="Assessment performance report"><div className="exam-readiness-report-head"><div><strong>Session performance</strong><span>{mode==="readiness"?"Readiness practice report":mode==="cat"?"CAT-style practice report":"Practice exam report"}</span></div><button type="button" className="exam-nav-review" disabled={firstNeedsReviewIndex<0} onClick={()=>setReviewIndex(Math.max(0,firstNeedsReviewIndex))}>Review items needing attention ({needsReviewCount}) <ArrowRight size={15}/></button></div><div className="exam-readiness-metrics"><div><strong>{done}/{exam.length}</strong><span>Answered</span></div><div><strong>{exam.length-done}</strong><span>Unanswered</span></div><div><strong>{exam.filter(question=>isQuestionCorrect(question,answers[question.id]??[])).length}</strong><span>Fully correct</span></div><div><strong>{Math.floor((startedAt?Math.max(0,Date.now()-startedAt):0)/60000)} min</strong><span>Elapsed time</span></div></div><div className="exam-readiness-category-list"><h2>Performance by question category</h2>{readinessCategoryRows.map((area,index)=><div className="exam-readiness-category" key={area.name}><div><strong>{area.name}</strong><span>{area.percent}% earned credit · {area.total} questions</span></div><div className="exam-readiness-track"><i style={{width:area.percent+"%"}}/></div>{index===0&&<button type="button" className="exam-readiness-practice-link" onClick={()=>onPracticeCategory?.(area.name)}>Practice priority category</button>}</div>)}</div><p className="exam-readiness-disclaimer">Category results are descriptive of the questions sampled in this session. Categories may have different sample sizes and are not calibrated against official NCLEX scoring.</p></section>
   <div className="exam-review-progress"><span style={{width:((reviewIndex+1)/exam.length*100)+"%"}}/></div>
   <div className="exam-review-workspace">
    <main className="exam-review-left">
     <div className="exam-review-item-top"><span>QUESTION {reviewIndex+1} OF {exam.length}</span><span className={"exam-review-status "+(status==="Correct"?"correct":status==="Incorrect"?"incorrect":"unanswered")}>{status}</span>{mode!=="self-study"&&done===exam.length&&<button type="button" className={flagged.includes(q.id)?"exam-flag active":"exam-flag"} onClick={()=>toggleFlaggedQuestion(q.id)}>{flagged.includes(q.id)?"Remove flag":"Flag for review"}</button>}</div>
     {q.caseStudy&&!q.caseRecord&&<section className="exam-case"><div className="exam-case-label">CLINICAL SCENARIO</div><p>{q.caseStudy}</p>{q.exhibit&&!q.caseRecord&&<details><summary>View clinical exhibit</summary><p>{q.exhibit}</p></details>}</section>}{!q.caseStudy&&(q.clinicalScenario||q.exhibit)&&<section className="exam-case exam-inline-scenario"><div className="exam-case-label">CLINICAL SCENARIO</div><p>{q.clinicalScenario??q.exhibit}</p></section>}
     {q.caseRecord&&<section className="exam-review-record"><div className="exam-review-record-tabs" role="tablist" aria-label="Client record sections">{reviewRecordTabs.map(tab=><button type="button" role="tab" key={tab.key} aria-selected={activeRecordTab===tab.key} className={activeRecordTab===tab.key?"active":""} onClick={()=>setActiveRecordTab(tab.key)}>{tab.label}</button>)}</div><div className="exam-review-record-content" role="tabpanel"><strong>{reviewRecordActive?.label??"Client record"}</strong><p>{reviewRecordActive?.content??""}</p></div></section>}
     {qData.trend?.length?<section className="ngn-trend exam-review-trend"><h3>Clinical trend</h3><div className="ngn-trend-tabs" role="tablist" aria-label="Clinical trend time points">{qData.trend.map((entry,i)=><button type="button" role="tab" aria-selected={activeTrendIndex===i} className={activeTrendIndex===i?"active":""} key={i} onClick={()=>setActiveTrendIndex(i)}>{entry.time}</button>)}</div><div className="ngn-trend-current" role="tabpanel"><strong>{qData.trend[Math.min(activeTrendIndex,qData.trend.length-1)]?.time}</strong><p>{qData.trend[Math.min(activeTrendIndex,qData.trend.length-1)]?.findings}</p></div></section>:null}
     <h2 className="exam-review-stem">{q.prompt}</h2>
     {["single-response","multiple-response","select-n","extended-multiple-response","trend","graphics-based"].includes(q.itemType??"single-response")&&qData.choices?.length?<div className="exam-review-options">{qData.choices.map((choice,i)=>{const chosen=response.includes(String(i));const keyed=expectedResponse.includes(String(i));const standard=(q.itemType??"single-response")==="single-response";return <div className={"exam-review-option "+(keyed?"correct":chosen?"incorrect":"")} key={i}>{!standard&&<span className="exam-review-option-letter">{LETTERS[i]??i+1}</span>}<span className="exam-review-option-text">{choice}</span><span className="exam-review-option-mark">{keyed&&chosen?"✓ Your response · Correct answer":keyed?"✓ Correct answer":chosen?"✕ Your response":""}</span></div>;})}</div>:<><div className="exam-review-answer-block"><strong>Your response</strong>{actualLabels.map((label,i)=><div className={"exam-review-answer "+(isCorrect?"correct":"incorrect")} key={i}>{label}</div>)}</div><div className="exam-review-answer-block"><strong>Correct response</strong>{correctLabels.map((label,i)=><div className="exam-review-answer correct" key={i}>{label}</div>)}</div></>}
    </main>
    <aside className="exam-review-right"><div className="exam-review-rationale-kicker">CLINICAL RATIONALE</div><h2>Rationale</h2><p>{q.rationale||"No rationale has been supplied for this item."}</p>{qData.optionRationales?.length?<div className="exam-review-option-rationales"><h3>Option explanations</h3>{qData.optionRationales.map((r,i)=><p key={i}><strong>{LETTERS[i]??i+1}.</strong> {r}</p>)}</div>:null}{q.clinicalJudgmentStep&&<div className="exam-review-cjmm"><strong>Clinical judgment step</strong><span>{q.clinicalJudgmentStep.replace(/-/g," ")}</span></div>}{status!=="Correct"&&(q.topic||q.category)&&<div className="exam-review-remediation"><strong>Targeted remediation</strong><p>Reinforce this missed item's clinical concept with focused practice.</p><div>{q.topic&&<button type="button" onClick={()=>onPracticeTopic?.(q.topic)}>Drill topic: {q.topic}</button>}{q.category&&<button type="button" onClick={()=>onPracticeCategory?.(q.category)}>Practice {q.category}</button>}</div></div>}</aside>
   </div>
   <footer className="exam-review-footer"><button type="button" className="exam-prev" disabled={reviewIndex===0} onClick={()=>{setReviewIndex(i=>Math.max(0,i-1));setActiveRecordTab("notes");setActiveTrendIndex(0);}}><ArrowLeft size={16}/> Previous</button><span>Item {reviewIndex+1} of {exam.length}</span><button type="button" className="exam-next" disabled={reviewIndex===exam.length-1} onClick={()=>{setReviewIndex(i=>Math.min(exam.length-1,i+1));setActiveRecordTab("notes");setActiveTrendIndex(0);}}>Next <ArrowRight size={16}/></button><button type="button" className="exam-review-dashboard" onClick={onExit}>Return to dashboard</button></footer>
  </div>;
 }
 return <div className="exam-screen">
  <header className="exam-header"><QuickRNBrand className="exam-brand" tagline="RN LICENSURE PRACTICE" compact /><div className="exam-header-center"><strong>QUESTION {current+1} OF {exam.length}</strong></div><div className="exam-header-tools">{mode!=="self-study"&&<span className="exam-countdown exam-header-countdown" aria-live="off">{String(Math.floor(remainingSeconds/3600)).padStart(2,"0")}:{String(Math.floor((remainingSeconds%3600)/60)).padStart(2,"0")}:{String(remainingSeconds%60).padStart(2,"0")}</span>}{mode==="self-study"&&<button type="button" className="exam-tool-button" onClick={()=>setShowNotes(true)}><FileText size={16}/> Notes</button>}<button type="button" className="exam-tool-button" onClick={()=>setShowCalculator(true)}><Calculator size={16}/> Calculator</button><button type="button" className="exam-exit" onClick={()=>setFinished(true)}>End exam</button></div></header>
  <div className="exam-session-progress"><span>{done} of {exam.length} answered</span><span>{Math.round(exam.length?done/exam.length*100:0)}% complete</span><span>{exam.length-done} remaining</span></div><div className="exam-progress-track" role="progressbar" aria-label="Examination completion" aria-valuemin={0} aria-valuemax={exam.length} aria-valuenow={done}><span style={{width:`${exam.length?done/exam.length*100:0}%`}}/></div>
  <div className={hasClinicalRecord?"exam-layout exam-layout-case":"exam-layout"}>
   {hasClinicalRecord&&<aside className="exam-record-panel"><div className="exam-record-heading"><div><span>{item.caseRecord?"CLIENT RECORD":"CLINICAL SCENARIO"}</span>{isUnfoldingCase&&<strong>{`Case screen ${caseScreen} of ${currentCaseItems.length}`}</strong>}</div><FileText size={19}/></div>{!item.caseRecord&&(item.clinicalScenario||item.caseStudy||item.exhibit)&&<section className="exam-case exam-left-scenario"><p>{item.clinicalScenario??item.caseStudy??item.exhibit}</p></section>}{item.exhibit&&item.clinicalScenario&&<section className="exam-case exam-left-exhibit"><div className="exam-case-label">CLINICAL RECORD</div><p>{item.exhibit}</p></section>}{data.trend?.length?<section className="exam-trend-left"><h3>Findings over time</h3><div className="ngn-trend-tabs" role="tablist" aria-label="Clinical trend time points">{data.trend.map((t,i)=><button type="button" role="tab" aria-selected={activeTrendIndex===i} className={activeTrendIndex===i?"active":""} key={i} onClick={()=>setActiveTrendIndex(i)}>{t.time}</button>)}</div><div className="ngn-trend-current" role="tabpanel"><strong>{data.trend[Math.min(activeTrendIndex,data.trend.length-1)]?.time}</strong><p>{data.trend[Math.min(activeTrendIndex,data.trend.length-1)]?.findings}</p></div></section>:null}{item.caseRecord&&<><div className="exam-record-tabs" role="tablist" aria-label="Client record sections">{visibleRecordTabs.map(tab=><button type="button" role="tab" key={tab.key} aria-selected={selectedRecordTab?.key===tab.key} className={selectedRecordTab?.key===tab.key?"active":""} onClick={()=>setActiveRecordTab(tab.key)}>{tab.label}</button>)}</div><section className="exam-record-content" role="tabpanel" aria-label={selectedRecordTab?.label??"Client record"}><div className="exam-record-content-heading"><strong>{selectedRecordTab?.label??"Client record"}</strong><span>{selectedRecordTab?.key==="vitals"?"OBSERVATIONS":selectedRecordTab?.key==="labs"?"DIAGNOSTICS":selectedRecordTab?.key==="orders"?"CARE PLAN":"PATIENT CHART"}</span></div><p>{activeRecordContent}</p></section><div className="exam-record-footer">Review the chart as new information becomes available throughout the case.</div></>}</aside>}
   <main className={hasClinicalRecord?"exam-main exam-main-case":"exam-main"}>
    <div className="exam-main-top"><div className="exam-question-meta"><span className="exam-category-pill">{item.category}</span><span className="exam-type-pill">{type.replace(/-/g," ")}</span>{type==="select-n"&&<span className="exam-format-pill">SELECT {data.selectCount??2}</span>}{item.difficulty&&<span className="exam-difficulty-pill">{item.difficulty}</span>}</div>{mode==="self-study"&&<div className="exam-item-actions"><button type="button" className={flagged.includes(item.id)?"exam-flag active":"exam-flag"} onClick={()=>toggleFlaggedQuestion(item.id)}>{flagged.includes(item.id)?<BookmarkCheck size={17}/>:<Bookmark size={17}/>} {flagged.includes(item.id)?"Remove flag":"Flag for review"}</button></div>}</div>
    
    
    
    <section className="exam-question-card"><div className="exam-card-kicker">ITEM {String(current+1).padStart(2,"0")}</div>{!hasClinicalRecord&&(item.clinicalScenario||item.exhibit||item.caseStudy)&&<section className="exam-inline-scenario"><div className="exam-case-label">CLINICAL SCENARIO</div><p>{item.clinicalScenario??item.exhibit??item.caseStudy}</p></section>}<h1 className="exam-stem">{item.prompt}</h1>{type!=="numeric-entry"&&type!=="highlight-text"&&!/(select all that apply|select\s+\d+|select one|choose one|choose two|choose the best|select the best)/i.test(item.prompt)&&!((data.instruction??"").trim().toLowerCase()===item.prompt.trim().toLowerCase())&&<p className="exam-instruction">{data.instruction??(type==="multiple-response"||type==="extended-multiple-response"?"Select all that apply.":"Select the best response.")}</p>}{renderInteraction()}</section>
    <div className="exam-report-action"><button type="button" className="exam-tool-button" onClick={()=>{setReportError("");setShowReport(true);}}><MessageSquareWarning size={16}/> Report to Webmaster</button></div>
    <div className="exam-controls">{mode==="self-study"&&<button type="button" className="exam-nav-review" onClick={()=>{setReviewFilter("all");setShowReview(true);}}><ClipboardList size={16}/> Question navigator</button>}<span className="exam-response-status">{selected.length?"Response saved":"No response yet"} · {done}/{exam.length} answered</span>{current===exam.length-1&&mode==="cat"&&exam.length>=85&&exam.length<150?<><button type="button" className="exam-next" disabled={!hasAnsweredCurrent} onClick={()=>{setReviewFilter("all");setShowReview(true);}}>End CAT <ArrowRight size={17}/></button><button type="button" className="exam-next" disabled={!hasAnsweredCurrent} onClick={advanceAdaptive}>Next <ArrowRight size={17}/></button></>:current===exam.length-1&&mode!=="cat"||current===exam.length-1&&mode==="cat"&&exam.length>=150?<button type="button" className="exam-next" disabled={mode!=="self-study"&&!hasAnsweredCurrent} onClick={()=>{setReviewFilter("all");setShowReview(true);}}>Review and submit <ArrowRight size={17}/></button>:<button type="button" className="exam-next" disabled={mode!=="self-study"&&!hasAnsweredCurrent} onClick={advanceAdaptive}>Next <ArrowRight size={17}/></button>}</div>
   </main>
  </div>
  {showReport&&<div className="exam-modal-backdrop exam-report-backdrop"><section className="exam-report-modal" role="dialog" aria-modal="true" aria-labelledby="exam-report-title"><div className="exam-notes-head"><div><strong id="exam-report-title">Report question feedback</strong><span>Question {current+1} · {item.id}</span></div><button type="button" onClick={()=>setShowReport(false)} aria-label="Close report"><X size={18}/></button></div><p>Tell the webmaster what needs attention in this question. Include the issue and any suggested correction.</p><textarea aria-label="Feedback for webmaster" value={reportText} onChange={event=>setReportText(event.target.value)} placeholder="Describe the problem with the question, answer, rationale, or interaction..." rows={6}/>{reportError&&<p className="exam-report-error" role="alert">{reportError}</p>}<div className="exam-notes-foot"><span>Includes the question ID and item details automatically.</span><button type="button" className="exam-next" disabled={!reportText.trim()||reportSubmitting} onClick={()=>void submitItemReport()}>{reportSubmitting?"Submitting…":"Submit report"}</button></div></section></div>}
  {showNotes&&mode==="self-study"&&<div className="exam-modal-backdrop"><section className="exam-notes-modal"><div className="exam-notes-head"><div><strong>Question notes</strong><span>Question {current+1}</span></div><button type="button" onClick={()=>setShowNotes(false)} aria-label="Close notes"><X size={18}/></button></div><textarea value={notes[item.id]??""} onChange={e=>setNotes(old=>({...old,[item.id]:e.target.value}))} placeholder="Write notes to review during this examination..." rows={8}/><div className="exam-notes-foot"><span>Notes are kept for this examination session.</span><button type="button" className="exam-next" onClick={()=>setShowNotes(false)}>Done</button></div></section></div>}
  {showCalculator&&<div className="exam-calculator" style={calculatorPosition?{left:calculatorPosition.left,top:calculatorPosition.top,right:"auto",bottom:"auto"}:undefined}><div className="exam-calculator-drag" onPointerDown={event=>{const rect=event.currentTarget.parentElement!.getBoundingClientRect();setCalculatorPosition({left:rect.left,top:rect.top});setCalculatorDrag({offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top});event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={event=>{if(!calculatorDrag)return;setCalculatorPosition({left:Math.max(0,Math.min(window.innerWidth-250,event.clientX-calculatorDrag.offsetX)),top:Math.max(0,Math.min(window.innerHeight-280,event.clientY-calculatorDrag.offsetY))});}} onPointerUp={()=>setCalculatorDrag(null)} onPointerCancel={()=>setCalculatorDrag(null)}><strong>Calculator · Drag to move</strong><button type="button" onPointerDown={event=>event.stopPropagation()} onClick={()=>setShowCalculator(false)}><X size={16}/></button></div><input readOnly value={calcValue}/><button type="button" className="exam-calculator-clear" onClick={()=>setCalcValue("0")}>Clear</button><div className="exam-calc-grid">{["7","8","9","÷","4","5","6","×","1","2","3","−","C","0",".","+","="].map(k=><button type="button" key={k} onClick={()=>{if(k==="C")setCalcValue("0");else if(k==="="){try{const m=calcValue.replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-").match(/^(-?\d+(?:\.\d+)?)([+*/-])(-?\d+(?:\.\d+)?)$/);if(m){const a=Number(m[1]),b=Number(m[3]);const v=m[2]==="+"?a+b:m[2]==="-"?a-b:m[2]==="*"?a*b:b===0?NaN:a/b;setCalcValue(Number.isFinite(v)?String(v):"Error");}}catch{setCalcValue("Error");}}else setCalcValue(v=>v==="0"?k:v+k);}}>{k}</button>)}</div></div>}
  {showBreakPrompt&&!submitted&&<div className="exam-modal-backdrop"><section className="exam-modal exam-break-modal"><div className="exam-modal-icon"><span>Ⅱ</span></div><h2>Optional NCLEX break</h2><p>You have reached an optional break point. You may take a short break or continue. The examination timer continues during breaks.</p><div className="exam-modal-actions"><button type="button" onClick={()=>setShowBreakPrompt(false)}>Continue exam</button><button type="button" className="exam-final-submit" onClick={()=>{setShowBreakPrompt(false);setBreakSeconds(10*60);setShowBreakScreen(true);}}>Take break</button></div></section></div>}
  {showBreakScreen&&!submitted&&<div className="exam-modal-backdrop exam-break-screen"><section className="exam-modal"><div className="exam-modal-icon"><span>Ⅱ</span></div><h2>Break in progress</h2><p>This optional break lasts up to 10 minutes. Your examination timer continues during the break.</p><strong className="exam-break-timer">{String(Math.floor(breakSeconds/60)).padStart(2,"0")}:{String(breakSeconds%60).padStart(2,"0")} break time remaining</strong><span className="exam-break-exam-clock">Exam time remaining: {String(Math.floor(remainingSeconds/3600)).padStart(2,"0")}:{String(Math.floor((remainingSeconds%3600)/60)).padStart(2,"0")}:{String(remainingSeconds%60).padStart(2,"0")}</span><div className="exam-modal-actions"><button type="button" className="exam-final-submit" onClick={()=>setShowBreakScreen(false)}>Resume examination</button></div></section></div>}
  {showReview&&<div className="exam-modal-backdrop"><section className="exam-review-modal"><div className="exam-review-head"><div><small>EXAM REVIEW</small><h2>Review your responses</h2><p>Check unanswered and flagged items before submitting.</p></div><button type="button" onClick={()=>setShowReview(false)} aria-label="Close review"><X size={20}/></button></div><div className="exam-modal-stats"><div><strong>{done}</strong><span>Answered</span></div><div><strong>{exam.length-done}</strong><span>Unanswered</span></div><div><strong>{flagged.length}</strong><span>Flagged</span></div></div><div className="exam-review-filters">{(["all","unanswered","flagged"] as const).map(f=><button type="button" key={f} className={reviewFilter===f?"active":""} onClick={()=>setReviewFilter(f)}>{f==="all"?"All items":f[0].toUpperCase()+f.slice(1)}</button>)}</div><div className="exam-review-list" aria-label="Question list">{reviewItems.map(({q,i})=>{const answered=(answers[q.id]??[]).some(value=>value!=="");const isCurrent=i===current;return <button type="button" key={q.id} className={(isCurrent?"current ":"")+(answered?"answered":"unanswered")} aria-current={isCurrent?"step":undefined} onClick={()=>go(i)}><span className="exam-review-num">{i+1}</span><span><strong>Question {i+1}{isCurrent?" · Current":""}</strong><small>{answered?"Response saved":"Not answered"}{flagged.includes(q.id)?" · Flagged":""}</small></span><span className="exam-nav-state">{flagged.includes(q.id)?"Flagged":answered?"Answered":"Unanswered"}</span><ArrowRight size={16}/></button>})}</div><div className="exam-modal-actions"><button type="button" onClick={()=>setShowReview(false)}>Return to exam</button><button type="button" className="exam-final-submit" onClick={()=>{setShowReview(false);setFinished(true);}}>End and submit</button></div></section></div>}
  {finished&&!submitted&&<div className="exam-modal-backdrop"><section className="exam-modal"><div className="exam-modal-icon"><ClipboardList size={25}/></div><h2>End this examination?</h2><p>You have answered {done} of {exam.length} items. You can return to the examination or submit your responses now.</p><div className="exam-modal-stats"><div><strong>{done}</strong><span>Answered</span></div><div><strong>{exam.length-done}</strong><span>Unanswered</span></div><div><strong>{flagged.length}</strong><span>Flagged</span></div></div><div className="exam-modal-actions"><button type="button" onClick={()=>setFinished(false)}>Continue exam</button><button type="button" className="exam-final-submit" onClick={submitExam}>Submit examination</button></div><p className="exam-modal-disclaimer">QuickRN is an independent practice platform and is not affiliated with or endorsed by NCSBN.</p></section></div>}

 </div>;
}

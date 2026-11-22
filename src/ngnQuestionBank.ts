import type { CanonicalNclexItemType, NclexItemType, Question, QuestionInteraction } from "./questions";
import curatedNgnBatch from "./curatedQuestionBatch100.json";
import { questionBank500 } from "./questionBank";

export const NCLEX_ITEM_TYPES: CanonicalNclexItemType[] = [
  "single-response","multiple-response","select-n","drop-down-cloze","drop-down-rationale",
  "highlight-text","matrix-multiple","matrix-single","numeric-entry","ordered-response",
  "bow-tie","drag-drop","trend","graphics-based"
];

type CuratedNgnItem={id:string;topic:string;subtopic:string;difficulty:string;question_type:string;clinical_scenario:any;stem:string;interaction:Record<string,any>;correct_response:Record<string,any>;rationales:Record<string,any>;clinical_judgment:Record<string,any>;case_study_id:string|null;};
const curatedNgnRaw=(curatedNgnBatch as {questions:CuratedNgnItem[]}).questions;
function formatNgnContent(value:any):string{
 if(value===null||value===undefined)return "";
 if(typeof value==="string")return value;
 if(Array.isArray(value))return value.map(formatNgnContent).filter(Boolean).join("\n");
 if(typeof value==="object")return Object.entries(value).map(([key,entry])=>{
  const label=key.replace(/_/g," ").replace(/\b\w/g,char=>char.toUpperCase());
  const text=formatNgnContent(entry);return text?label+": "+text:"";
 }).filter(Boolean).join("\n");
 return String(value);
}
function curatedCaseRecord(record:any,follow:any){
 const progress=[formatNgnContent(follow?.clinical_development),formatNgnContent(follow?.new_information)].filter(Boolean).join("\n");
 return {progressNotes:progress,history:formatNgnContent(record?.patient_profile),medicationList:formatNgnContent(record?.medications),assessment:formatNgnContent(record?.assessment),vitalSigns:formatNgnContent(record?.vital_signs),labs:formatNgnContent(record?.laboratory_results),providerOrders:formatNgnContent(record?.provider_orders),flowSheet:formatNgnContent(follow)};
}
function curateNgnQuestion(raw:CuratedNgnItem,index:number):Question{
 const data=raw.interaction??{},key=raw.correct_response??{},r=raw.rationales??{};
 const optionRows=Array.isArray(data.options)?data.options as {id:string;text:string}[]:[];
 const optionTexts=optionRows.map(option=>option.text);
 const idx=(id:unknown,options=optionRows)=>options.findIndex(option=>option.id===String(id));
 const scenario=formatNgnContent(raw.clinical_scenario);
 const patientRecord=data.patient_record,follow=data.follow_up;
 const group=raw.case_study_id==="QRN-CASE-0001"?"ngn-case-01":raw.case_study_id==="QRN-CASE-0002"?"ngn-case-02":undefined;
 const isGroupedCase=raw.question_type==="case_study"&&!!group;
 let itemType:NclexItemType="single-response";
 let interaction:QuestionInteraction={instruction:"Select the one best response.",choices:optionTexts,correctResponse:["0"]};
 let options=optionTexts,answer=0;
 let prompt=raw.stem.replace(/^Case Study \d+ \(Stage \d+ of \d+ — [^)]+\):\s*/,"");
 const wrongRationales=Array.isArray(r.incorrect)?r.incorrect as {option:string;rationale:string}[]:[];
 const optionRationales=optionRows.map(option=>wrongRationales.find(entry=>entry.option===option.id)?.rationale??"");
 const selection=(raw.question_type==="case_study"||raw.question_type==="multiple_choice"||raw.question_type==="multiple_response"||raw.question_type==="extended_multiple_response"||raw.question_type==="trend")
  ?(key.selected_option?[key.selected_option]:(key.selected_options??[])):[];

 if(["multiple_choice","multiple_response","case_study"].includes(raw.question_type)){
  const indexes=selection.map((id:string)=>idx(id)).filter((value:number)=>value>=0);
  if(!indexes.length||indexes.length!==selection.length) throw new Error(`NGN item ${raw.id} has an invalid or missing authored answer key.`);
  itemType=raw.question_type==="multiple_choice"||(raw.question_type==="case_study"&&data.selection_mode==="single")?"single-response":"multiple-response";
  interaction={instruction:itemType==="multiple-response"?"Select all responses that apply.":"Select the one best response.",choices:optionTexts,correctResponse:indexes.map(String),optionRationales};
  answer=indexes[0]??0;
 }else if(raw.question_type==="extended_multiple_response"){
  const indexes=(key.selected_options??[]).map((id:string)=>idx(id)).filter((value:number)=>value>=0);
  if(!indexes.length||indexes.length!==(key.selected_options??[]).length) throw new Error(`NGN item ${raw.id} has an invalid or missing authored multi-response key.`);
  itemType=raw.id==="QRN-000026"?"select-n":"extended-multiple-response";
  if(itemType==="select-n")prompt="Select exactly five clinical manifestations and pathophysiological mechanisms that are consistent with neurogenic shock.";
  interaction={instruction:itemType==="select-n"?"Select exactly five responses.":"Select all responses that apply.",choices:optionTexts,correctResponse:indexes.map(String),selectCount:itemType==="select-n"?5:undefined,optionRationales};
  answer=indexes[0]??0;
 }else if(raw.question_type==="matrix"){
  const rows=Array.isArray(data.rows)?data.rows as {id:string;label?:string;text?:string}[]:[];
  const cols=Array.isArray(data.columns)?data.columns as {id:string;label:string}[]:[];
  const selections=key.selections??{};
  const selectedColumns=rows.map(row=>cols.findIndex(col=>col.id===selections[row.id]));
  if(rows.length<3||cols.length<2||selectedColumns.some(value=>value<0))throw new Error(`NGN matrix ${raw.id} has incomplete rows, columns, or answer keys.`);
  const correct=selectedColumns.map((column,i)=>i+":"+column);
  itemType="matrix-single";options=[];
  interaction={instruction:"Select one classification in each row.",choices:[],rows:rows.map(row=>row.label??row.text??""),columns:cols.map(col=>col.label),matrixMode:"single",correctResponse:correct,correctMatrix:Object.fromEntries(rows.map((row,i)=>[String(i),cols.find(col=>col.id===selections[row.id])?.label??""]))};
 }else if(raw.question_type==="cloze"){
  const segments=Array.isArray(data.segments)?data.segments as {id:string;text_before:string;text_after:string;options:{id:string;text:string}[]}[]:[];
  const clozeTemplate=segments.map((segment,i)=>segment.text_before+"[BLANK_"+(i+1)+"]"+segment.text_after).join(" ");
  const choicesByBlank=segments.map(segment=>segment.options.map(option=>option.text));
  const correctIndexes=segments.map(segment=>segment.options.findIndex(option=>option.id===key.selections?.[segment.id]));
  if(!segments.length||correctIndexes.some(value=>value<0))throw new Error(`NGN cloze ${raw.id} has an incomplete authored answer key.`);
  const correct=correctIndexes.map(String);
  itemType="drop-down-cloze";options=[];
  interaction={instruction:"Complete each clinical statement using the drop-down selections.",choices:[],clozeTemplate,clozeChoicesByBlank:choicesByBlank,correctResponse:correct};
 }else if(raw.question_type==="highlight_text"){
  const segments=Array.isArray(data.segments)?data.segments as {id:string;text:string}[]:[];
  const selectedIds=key.selected_segments??[],texts=segments.map(segment=>segment.text);
  itemType="highlight-text";options=[];
  interaction={instruction:"Highlight the clinical cues that require action.",choices:[],segments:texts,highlightableSegments:texts,correctResponse:segments.filter(segment=>selectedIds.includes(segment.id)).map(segment=>segment.text)};
  answer=Math.max(0,segments.findIndex(segment=>selectedIds.includes(segment.id)));
 }else if(raw.question_type==="highlight_table"){
  const rows=Array.isArray(data.rows)?data.rows as {id:string;cells:string[]}[]:[];
  const cells=Array.isArray(data.selectable_cells)?data.selectable_cells as {id:string;row_id:string;column_index:number}[]:[];
  const selected=key.selected_cells??[];
  if(!rows.length||!cells.length||cells.some(cell=>!rows.some(row=>row.id===cell.row_id)||!Number.isInteger(cell.column_index)||cell.column_index<0||cell.column_index>=rows.find(row=>row.id===cell.row_id)!.cells.length)||selected.some((id:string)=>!cells.some(cell=>cell.id===id)))throw new Error(`NGN highlight-table ${raw.id} has invalid authored cells or answer key.`);
  const segments=cells.map(cell=>{const row=rows.find(candidate=>candidate.id===cell.row_id)!;return row.cells[0]+" — "+row.cells[cell.column_index];});
  itemType="highlight-table";options=[];
  interaction={instruction:"Highlight the results that require immediate follow-up.",choices:[],segments,correctResponse:cells.map((cell,i)=>selected.includes(cell.id)?String(i):"").filter(Boolean)};
 }else if(raw.question_type==="trend"){
  const observations=Array.isArray(data.observations)?data.observations as any[]:[];
  const correctIndex=idx(key.selected_option);
  if(correctIndex<0||observations.length<3)throw new Error(`NGN trend ${raw.id} requires three observations and a valid authored answer key.`);
  itemType="trend";
  interaction={instruction:"Review the trend and select the best interpretation.",choices:optionTexts,correctResponse:[String(correctIndex)],trend:observations.map(observation=>({time:String(observation.time),findings:formatNgnContent({vital_signs:observation.vital_signs,assessment:observation.assessment,laboratory_results:observation.laboratory_results})})),optionRationales};
  answer=correctIndex;
 }else if(raw.question_type==="ordered_response"){
  const items=Array.isArray(data.items)?data.items as {id:string;text:string}[]:[];
  const ordered=key.ordered_items??[],orderIndexes=ordered.map((id:string)=>items.findIndex(item=>item.id===id));
  if(items.length<4||!ordered.length||orderIndexes.some(value=>value<0))throw new Error(`NGN ordered-response ${raw.id} has incomplete items or answer key.`);
  const correctOrder=orderIndexes;
  itemType="ordered-response";options=items.map(item=>item.text);answer=correctOrder[0]??0;
  interaction={instruction:"Arrange the nursing actions in the safest order.",choices:options,orderItems:options,correctOrder,correctResponse:correctOrder.map(String)};
 }else if(raw.question_type==="calculation"){
  const numeric=Number(key.value);
  if(!Number.isFinite(numeric))throw new Error(`NGN calculation ${raw.id} has an invalid authored numeric answer.`);
  itemType="numeric-entry";options=[];answer=Number.isFinite(numeric)?numeric:0;
  interaction={instruction:"Calculate and enter the requested value.",choices:[],correctResponse:[String(numeric)],numericUnit:String(data.required_unit??""),numericTolerance:Number(data.tolerance_radius??0)};
 }else if(raw.question_type==="bow_tie"){
  const conditions=data.condition_options??[],actions=data.action_options??[],parameters=data.parameter_options??[];
  const condition=idx(key.condition,conditions),actionIndexes=(key.actions??[]).map((id:string)=>idx(id,actions)),monitorIndexes=(key.parameters??[]).map((id:string)=>idx(id,parameters));
  const correctActions=actionIndexes.filter((v:number)=>v>=0),correctMonitoring=monitorIndexes.filter((v:number)=>v>=0);
  if(actionIndexes.length!==2||monitorIndexes.length!==2||actionIndexes.some((v:number)=>v<0)||monitorIndexes.some((v:number)=>v<0))throw new Error(`NGN bow-tie ${raw.id} has an invalid authored answer key.`);
  const monitoringOptions=parameters.map((x:any)=>x.text);
  if(conditions.length<3||actions.length<4||monitoringOptions.length<3||new Set(monitoringOptions).size!==monitoringOptions.length) throw new Error(`NGN bow-tie ${raw.id} requires three authored conditions, four actions, and three or more distinct monitoring parameters.`);
  if(condition<0||correctActions.length!==2||correctMonitoring.length!==2) throw new Error(`NGN bow-tie ${raw.id} has an incomplete or invalid answer key.`);
  itemType="bow-tie";options=[];answer=Math.max(0,condition);
  interaction={instruction:"Select the most likely condition, two priority actions, and two parameters to monitor.",choices:[],correctResponse:["c"+condition,...correctActions.map((v:number,i:number)=>"a"+i+"-"+v),...correctMonitoring.map((v:number,i:number)=>"m"+i+"-"+v)],bowTie:{conditions:conditions.map((x:any)=>x.text),actions:actions.map((x:any)=>x.text),monitoring:monitoringOptions,correctCondition:condition,correctActions,correctMonitoring}};
 }else if(raw.question_type==="hot_spot"){
  const topic=raw.stem.toLowerCase();let choices:string[]=[];
  if(topic.includes("ventrogluteal"))choices=["Ventrogluteal site","Dorsogluteal site","Deltoid muscle","Vastus lateralis muscle"];
  else if(topic.includes("apical impulse"))choices=["Left fifth intercostal space at the midclavicular line","Right second intercostal space at the sternal border","Left second intercostal space at the midclavicular line","Left fourth intercostal space at the anterior axillary line"];
  else if(topic.includes("lumbar spine"))choices=["L3–L4 or L4–L5 interspace","T12–L1 interspace","L1–L2 interspace","S1–S2 interspace"];
  else if(topic.includes("dorsalis pedis"))choices=["Dorsum of the foot, lateral to the extensor hallucis longus tendon","Medial ankle, posterior to the medial malleolus","Plantar surface beneath the first metatarsal head","Lateral ankle, posterior to the lateral malleolus"];
  else if(topic.includes("needle decompression"))choices=["Second intercostal space at the midclavicular line","Fifth intercostal space at the midaxillary line","Fourth intercostal space at the sternal border","Seventh intercostal space at the posterior axillary line"];
  if(!choices.length) throw new Error(`NGN hot-spot ${raw.id} has no authored anatomical landmark profile.`);const landmark=topic.includes("ventrogluteal")?{target:[29,55],others:[[14,43],[44,38],[73,78]]}:topic.includes("apical impulse")?{target:[23,31],others:[[70,25],[49,55],[80,70]]}:topic.includes("lumbar spine")?{target:[50,55],others:[[50,30],[30,65],[70,75]]}:topic.includes("dorsalis pedis")?{target:[80,81],others:[[55,80],[70,62],[90,65]]}:{target:[23,26],others:[[80,26],[50,55],[60,75]]};const coords=[landmark.target,...landmark.others];itemType="graphics-based";options=choices;answer=0;interaction={instruction:"Select the correct anatomical landmark on the reference image.",choices,correctResponse:["0"],graphic:{title:"Anatomical landmark identification",description:"Choose the numbered location that matches the landmark in the question.",labels:choices,correctLabels:[0],hotspots:coords.map((point,i)=>({x:point[0],y:point[1],label:choices[i]}))}};
 }
 const caseText=patientRecord?formatNgnContent(patientRecord.patient_profile):"";
 const record=patientRecord?curatedCaseRecord(patientRecord,follow):undefined;
 const clinicalScenario=isGroupedCase?undefined:(scenario||(patientRecord?formatNgnContent(patientRecord):""));
 const exhibit=(itemType==="bow-tie"||itemType==="trend")?"CLINICAL RECORD\n"+(clinicalScenario??formatNgnContent(patientRecord??raw.clinical_scenario)):formatNgnContent((raw.clinical_scenario as any)?.laboratory_results);
 const cjMap:Record<string,Question["clinicalJudgmentStep"]>={recognize_cues:"recognize-cues",analyze_cues:"analyze-cues",prioritize_hypotheses:"prioritize-hypotheses",generate_solutions:"generate-solutions",take_action:"take-action",evaluate_outcomes:"evaluate-outcomes"};
 const difficulty=raw.difficulty==="very_difficult"||raw.difficulty==="difficult"?"Advanced":raw.difficulty==="easy"?"Foundational":"Intermediate";
 const isMultiple=itemType==="multiple-response"||itemType==="extended-multiple-response"||itemType==="select-n";
 return {id:"ngn-"+String(index+1).padStart(3,"0"),category:raw.topic,topic:raw.subtopic,difficulty,prompt,options,answer,rationale:String(r.correct??r.summary??r.calculation??""),status:"published",format:isGroupedCase?"case-study":isMultiple?"multiple":"single",itemType,interaction,clinicalScenario,caseStudy:isGroupedCase?caseText:undefined,caseRecord:record,caseStudyId:isGroupedCase?group:undefined,exhibit:exhibit||undefined,clinicalJudgmentStep:cjMap[String(raw.clinical_judgment?.skill??"")],contentVersion:3,reviewStatus:"generated",reviewMetadata:{status:"not-clinically-verified",references:[],publicationStatus:"published"}};
}
function customNgnQuestion(id:string,category:string,topic:string,difficulty:Question["difficulty"],prompt:string,scenario:string,rationale:string,itemType:NclexItemType,interaction:QuestionInteraction):Question{
 return {id,category,topic,difficulty,prompt,options:interaction.choices??[],answer:0,rationale,status:"published",format:itemType==="multiple-response"||itemType==="select-n"||itemType==="extended-multiple-response"?"multiple":"single",itemType,interaction,clinicalScenario:scenario,exhibit:"CLINICAL RECORD\n"+scenario,contentVersion:3,reviewStatus:"generated",reviewMetadata:{status:"not-clinically-verified",references:[],publicationStatus:"published"},clinicalJudgmentStep:"analyze-cues"};
}
function buildCuratedExtension():Question[]{
 const customA=customNgnQuestion("ngn-009","Mental Health","Lithium toxicity","Advanced","Complete the clinical reasoning statement about the client's acute change.","A 31-year-old client with bipolar I disorder takes lithium 900 mg/day. After 2 days of vomiting and diarrhea, the client develops coarse hand tremors, unsteady gait, slurred speech, and confusion. Lithium level is 2.1 mEq/L; creatinine is 1.6 mg/dL, increased from 0.9 mg/dL. The client is due for the evening lithium dose.","A lithium level above the therapeutic range with gastrointestinal fluid loss, coarse tremor, ataxia, confusion, and rising creatinine indicates toxicity with neurologic and renal risk. Hold the next dose, urgently notify the provider, assess neurologic and cardiac status, and anticipate prescribed isotonic IV fluids and serial lithium/renal/electrolyte monitoring.","drop-down-rationale",{instruction:"Complete both blanks using the best clinical reasoning.",choices:[],correctResponse:["0","0"],rationaleTemplate:"The nurse should [BLANK_1] because the findings indicate [BLANK_2].",rationaleChoicesByBlank:[["hold lithium and urgently notify the provider","administer the scheduled lithium dose with food","restrict oral and IV fluids","give an NSAID for the tremor"],["lithium toxicity with neurologic and renal risk","an expected transient medication effect","acute mania without medication toxicity","serotonin syndrome from serotonergic excess"] ]});
 const customB={...customNgnQuestion("ngn-012","Pediatrics","Cystic fibrosis exacerbation","Advanced","For each clinical finding, select all nursing responses that apply.","A 12-year-old with cystic fibrosis is admitted with increased cough, thick green sputum, fatigue, and a 1.2-kg weight loss over 2 weeks. Temperature is 38.3°C, HR 116/min, RR 26/min, and SpO2 88% on room air (usual 96%). Sputum culture is obtained; the care plan includes prescribed bronchodilator, dornase alfa, hypertonic saline, airway clearance, and antipseudomonal therapy.","An oxygen saturation of 88% with increased work of breathing requires immediate escalation, oxygenation support, and reassessment. Fever with purulent sputum indicates an infectious pulmonary exacerbation requiring prompt culture review, prescribed antimicrobial treatment, and reassessment. Recent weight loss requires nutrition and pancreatic-enzyme review. Stable digital clubbing should be compared with baseline and monitored.","matrix-grid",{instruction:"Select all nursing responses that apply to each finding.",choices:[],correctResponse:["0:0","0:1","0:2","1:0","1:1","1:2","2:1","2:2","3:2"],matrixMode:"multiple",rows:["SpO2 88% on room air with increased work of breathing","New fever 38.3°C and thick green sputum","Weight loss of 1.2 kg over 2 weeks","Digital clubbing unchanged from baseline"],columns:["Escalate promptly","Implement prescribed interventions","Trend and reassess","No action needed"]}),caseRecord:{progressNotes:"New cough, thick green sputum, fatigue, and 1.2-kg weight loss over 2 weeks",history:"Cystic fibrosis with chronic pulmonary disease and pancreatic insufficiency",medicationList:"Prescribed bronchodilator, dornase alfa, hypertonic saline, pancreatic enzymes, and antipseudomonal antibiotic",assessment:"Increased cough and work of breathing; thick green sputum; digital clubbing unchanged from baseline",vitalSigns:"T 38.3°C · HR 116/min · RR 26/min · SpO2 88% on room air (usual 96%)",labs:"Sputum culture obtained; results pending",providerOrders:"Airway-clearance therapy and prescribed antimicrobial treatment",flowSheet:"Monitor oxygenation, work of breathing, sputum, intake, weight, and response to therapy"}};
 const customC=customNgnQuestion("ngn-014","Endocrine","Diabetic ketoacidosis with hypokalemia","Advanced","Complete the safest sequence for this client's initial DKA management.","A 19-year-old adult with type 1 diabetes presents with vomiting, abdominal pain, deep respirations, and dehydration. Glucose is 568 mg/dL, venous pH 7.18, bicarbonate 10 mEq/L, and serum potassium 3.1 mmol/L. An IV regular-insulin infusion has been prescribed; cardiac monitoring and IV fluids are initiated.","The 2024 hyperglycemic-crisis consensus recommends delaying insulin when potassium is below 3.5 mmol/L. Insulin shifts potassium intracellularly and can precipitate life-threatening dysrhythmias. Replace potassium as prescribed with cardiac monitoring, recheck the level, and begin insulin only when potassium is above 3.5 mmol/L.","drag-drop",{instruction:"Place the actions into the correct sequence.",choices:["Hold the insulin infusion and notify the provider about potassium 3.1 mmol/L","Administer prescribed potassium replacement with cardiac monitoring","Recheck serum potassium and confirm it is above 3.5 mmol/L before starting insulin","Start insulin immediately to correct acidosis","Administer routine IV sodium bicarbonate","Encourage oral fluids while vomiting continues"],correctResponse:["0","1","2"],dragDropTemplate:"The nurse should first [BLANK_1], then [BLANK_2], and start insulin only after [BLANK_3].",dragDropChoices:["Hold the insulin infusion and notify the provider about potassium 3.1 mmol/L","Administer prescribed potassium replacement with cardiac monitoring","Recheck serum potassium and confirm it is above 3.5 mmol/L before starting insulin","Start insulin immediately to correct acidosis","Administer routine IV sodium bicarbonate","Encourage oral fluids while vomiting continues"]});
 const replacements=new Map<string,Question>([["QRN-000009",customA],["QRN-000012",customB],["QRN-000014",customC]]);
 return curatedNgnRaw.map((raw,index)=>replacements.get(raw.id)??curateNgnQuestion(raw,index));
}
const curatedExtension:Question[]=buildCuratedExtension();

function migrateLegacy(q:Question):Question {
  if(q.itemType&&q.interaction){const metadata=q.reviewMetadata??{status:"not-clinically-verified" as const,references:[],publicationStatus:"published" as const};const reviewStatus=metadata.status==="clinically-verified"?"clinically-reviewed":metadata.status==="editorially-reviewed"?"editorially-reviewed":q.reviewStatus??"generated";return {...q,contentVersion:3,reviewStatus,reviewMetadata:metadata};}
  const itemType:NclexItemType=q.format==="multiple"?"multiple-response":"single-response";
  const metadata=q.reviewMetadata??{status:"not-clinically-verified" as const,references:[],publicationStatus:"published" as const};
  const reviewStatus=metadata.status==="clinically-verified"?"clinically-reviewed":metadata.status==="editorially-reviewed"?"editorially-reviewed":"generated";
  return {...q,itemType,reviewMetadata:metadata,interaction:{...q.interaction,instruction:q.interaction?.instruction??(itemType==="multiple-response"?"Select all responses that apply.":"Select the one best response."),choices:q.interaction?.choices??q.options,correctResponse:q.interaction?.correctResponse??[String(q.answer)],optionRationales:q.interaction?.optionRationales},contentVersion:3,reviewStatus};
}
export const questionBank500V2:Question[]=questionBank500.map(migrateLegacy);
export const questionBank100:Question[]=curatedExtension;
export const questionBank600:Question[]=[...questionBank500V2,...questionBank100];
const normalizeQuestionText=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const traditionalPrompts=new Set(questionBank500V2.map(q=>normalizeQuestionText(q.prompt)));
const duplicateCrossBankPrompts=questionBank100.filter(q=>traditionalPrompts.has(normalizeQuestionText(q.prompt)));
if(duplicateCrossBankPrompts.length)throw new Error("Duplicate prompts across traditional and NGN banks: "+duplicateCrossBankPrompts.map(q=>q.id).join(", "));
const traditionalScenarios=new Set(questionBank500V2.map(q=>normalizeQuestionText(q.clinicalScenario??q.caseStudy??"")).filter(Boolean));
const duplicateCrossBankScenarios=questionBank100.filter(q=>{const value=normalizeQuestionText(q.clinicalScenario??q.caseStudy??"");return !!value&&traditionalScenarios.has(value);});
if(duplicateCrossBankScenarios.length)throw new Error("Duplicate scenarios across traditional and NGN banks: "+duplicateCrossBankScenarios.map(q=>q.id).join(", "));
if(questionBank100.length!==100) throw new Error("NGN extension must contain exactly 100 items.");
if(new Set(questionBank600.map(q=>q.id)).size!==600) throw new Error("Question IDs must be unique across the 600-item bank.");
export const itemFormatCounts = NCLEX_ITEM_TYPES.map(type=>({type,count:questionBank100.filter(q=>q.itemType===type||(type==="matrix-multiple"&&q.itemType==="matrix-grid")).length}));
if(NCLEX_ITEM_TYPES.some(type=>!questionBank100.some(q=>q.itemType===type||(type==="matrix-multiple"&&q.itemType==="matrix-grid")))) throw new Error("Every supported NCLEX item format must have a published sample or an existing matrix-grid compatibility item.");
if(questionBank100.filter(q=>q.caseStudyId==="ngn-case-01").length!==6||questionBank100.filter(q=>q.caseStudyId==="ngn-case-02").length!==6) throw new Error("Each unfolding case must contain exactly six linked screens.");
const invalidFormatItems=questionBank100.filter(q=>{
 const d=q.interaction;if(!d)return true;
 switch(q.itemType){
  case "single-response": return !d.choices||d.choices.length<4||!d.correctResponse?.length;
  case "multiple-response": case "extended-multiple-response": case "select-n": return !d.choices||d.choices.length<4||!d.correctResponse||d.correctResponse.length<2;
  case "drop-down-cloze": return !d.clozeTemplate?.includes("[BLANK_1]")||!(d.clozeChoices?.length||d.clozeChoicesByBlank?.length);
  case "drop-down-rationale": return !d.rationaleTemplate?.includes("[BLANK_1]")||!d.rationaleTemplate.includes("[BLANK_2]")||!d.rationaleChoicesByBlank||d.rationaleChoicesByBlank.length<2;
  case "highlight-text": return !d.segments?.length||!d.highlightableSegments?.length||!d.correctResponse?.length;
  case "highlight-table": return !d.segments?.length||!d.correctResponse?.length;
  case "matrix-multiple": case "matrix-grid": return !((d.matrixGroups?.length??0)>0||(d.rows?.length??0)>=3)||!d.correctResponse?.length;
  case "matrix-single": return (d.rows?.length??0)<3||(d.columns?.length??0)<2||!d.correctResponse?.length;
  case "numeric-entry": return !d.numericUnit||!d.correctResponse?.length;
  case "ordered-response": return !d.orderItems||d.orderItems.length<4||!d.correctOrder||d.correctOrder.length!==d.orderItems.length;
  case "bow-tie": return !d.bowTie||d.bowTie.conditions.length<3||d.bowTie.actions.length<4||d.bowTie.monitoring.length<3||d.bowTie.correctCondition<0||d.bowTie.correctActions.length!==2||d.bowTie.correctMonitoring.length!==2;
  case "drag-drop": return !d.dragDropTemplate?.includes("[BLANK_3]")||!d.dragDropChoices||d.dragDropChoices.length<5;
  case "trend": return !d.trend||d.trend.length<3;
  case "graphics-based": return !d.graphic?.hotspots?.length||d.graphic.hotspots.length<4||!d.correctResponse?.length;
  default: return true;
 }
});
if(invalidFormatItems.length) throw new Error("NGN format remediation failed for: "+invalidFormatItems.map(q=>q.id+" ("+q.itemType+")").join(", "));
const bowTieItems=questionBank100.filter(q=>q.itemType==="bow-tie");
if(bowTieItems.some(q=>!q.exhibit?.includes("CLINICAL RECORD")&&!q.exhibit?.includes("EMERGENCY DEPARTMENT RECORD")||/Review the current assessment and record/i.test(q.exhibit??""))) throw new Error("Every bow-tie item must include an actual, non-placeholder clinical record.");
if(bowTieItems.some(q=>{const b=q.interaction?.bowTie;if(!b)return true;return new Set(b.actions).size!==b.actions.length||new Set(b.monitoring).size!==b.monitoring.length;})) throw new Error("Bow-tie choices must be distinct within each item.");
if(questionBank100.filter(q=>q.itemType==="trend").some(q=>!q.exhibit?.includes("CLINICAL RECORD")||!q.interaction?.trend||q.interaction.trend.length<3)) throw new Error("Every trend item must include a clinical record and at least three time points.");

if(questionBank600.some(q=>q.contentVersion!==3)) throw new Error("All 600 questions must use content version 3 before publication.");
if(questionBank600.some(q=>q.status!=="published"||!q.prompt.trim()||!q.rationale.trim()||!q.topic.trim()||!q.category.trim()||!q.itemType||!q.interaction||(!q.clinicalScenario&&!q.caseStudy))) throw new Error("Every published question must have a renderable prompt, rationale, topic, category, interaction, and clinical scenario or case record.");

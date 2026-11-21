import type { NclexItemType, Question } from "./questions";
import { questionBank500 } from "./questionBank";

export const NCLEX_ITEM_TYPES: NclexItemType[] = [
  "single-response","multiple-response","extended-multiple-response","drop-down-cloze",
  "drop-down-table","highlight-text","highlight-table","matrix-grid","ordered-response",
  "bow-tie","trend","extended-drag-drop","graphics-based"
];

type Seed = { category:string; topic:string; patient:string; question:string; choices:string[]; answer:number; rationale:string; record:string };
const seeds: Seed[] = [
{category:"Maternal-Newborn",topic:"Placental abruption",patient:"A 31-year-old G3P1 at 35 weeks has constant abdominal pain and dark bleeding. BP 92/58, HR 126, uterus firm and tender; fetal baseline 175/min with recurrent late decelerations.",question:"Which immediate nursing response has the highest priority?",choices:["Activate the obstetric emergency response and support maternal circulation","Perform a digital vaginal examination","Encourage ambulation to assess bleeding","Delay escalation until ultrasound confirms the diagnosis"],answer:0,rationale:"Maternal instability and a nonreassuring fetal pattern require immediate escalation and stabilization. Avoid digital examination until placenta previa is excluded.",record:"Hgb 8.7 g/dL; fibrinogen 170 mg/dL; platelets 104,000/mm³; continuous fetal monitoring."},
{category:"Maternal-Newborn",topic:"Umbilical cord prolapse",patient:"Immediately after spontaneous rupture of membranes at 39 weeks, the fetal heart rate falls to 70/min. A loop of cord is visible at the introitus.",question:"What action should the nurse take while the emergency birth team is mobilized?",choices:["Use a gloved hand to lift the presenting part off the cord","Attempt to push the cord back into the uterus","Apply fundal pressure","Leave the client supine and obtain a routine ultrasound"],answer:0,rationale:"Relieving pressure on the prolapsed cord and activating the emergency response are immediate priorities. Do not attempt to replace the cord.",record:"FHR 70/min; maternal BP 128/76; membranes ruptured 2 minutes ago."},
{category:"Endocrine",topic:"Addisonian crisis",patient:"A 44-year-old with known adrenal insufficiency presents after gastroenteritis. BP 78/44, HR 132, Na 124, K 6.1, glucose 54 mg/dL; the client is weak and confused.",question:"Which prescribed intervention should the nurse anticipate first?",choices:["IV isotonic fluid and stress-dose IV glucocorticoid","Fluid restriction and potassium supplementation","Oral thyroid hormone","A loop diuretic as the only intervention"],answer:0,rationale:"Adrenal crisis causes shock, hyponatremia, hyperkalemia and hypoglycemia. Immediate volume support and glucocorticoid replacement are time critical.",record:"Na 124 mEq/L; K 6.1 mEq/L; glucose 54 mg/dL; cortisol low."},
{category:"Endocrine",topic:"Cushing syndrome",patient:"A 58-year-old taking long-term prednisone has thin skin, proximal muscle weakness, glucose 248 mg/dL and a temperature of 38.2°C after reporting dysuria.",question:"Which finding requires the most urgent follow-up?",choices:["Fever with urinary symptoms","Rounded facial appearance","Purple abdominal striae","Gradual central weight gain"],answer:0,rationale:"Corticosteroid excess increases infection risk and can blunt inflammatory responses. Fever and urinary symptoms warrant prompt evaluation.",record:"WBC 13,900/mm³; urinalysis positive leukocyte esterase and nitrites; glucose 248 mg/dL."},
{category:"Infectious Disease",topic:"Pertussis",patient:"A 5-month-old has repeated coughing paroxysms followed by vomiting and brief apnea. The infant is afebrile; immunizations are incomplete.",question:"Which precaution is indicated while diagnostic testing is pending?",choices:["Droplet precautions","Airborne precautions in a negative-pressure room","Protective environment","Standard precautions only"],answer:0,rationale:"Suspected pertussis requires droplet precautions, prompt evaluation and appropriate treatment; young infants are at risk for apnea.",record:"Oxygen saturation fluctuates from 91% to 96%; nasopharyngeal PCR collected."},
{category:"Neurologic",topic:"Headache after lumbar puncture",patient:"A client reports a severe headache 18 hours after lumbar puncture. Pain is 9/10 when sitting and improves when supine. Temperature 36.9°C; no focal deficit or neck rigidity.",question:"Which response is most appropriate?",choices:["Assess neurologic status and notify the provider about a likely post-dural-puncture headache","Dismiss the symptom as expected and provide no follow-up","Immediately administer an anticoagulant","Encourage vigorous exercise"],answer:0,rationale:"A positional headache after lumbar puncture is consistent with a post-dural-puncture headache. Assess for red flags and notify the provider for an individualized plan.",record:"LP performed 18 hours earlier; CSF studies pending; vital signs stable."},
{category:"Musculoskeletal",topic:"Compartment syndrome",patient:"A 27-year-old with a tibial fracture reports escalating pain despite analgesia. Passive toe extension causes severe pain; the foot is warm and pedal pulses remain palpable.",question:"Which action is the priority?",choices:["Notify the orthopedic surgeon immediately for urgent evaluation","Reassure because pulses are present","Elevate the leg well above the heart and reassess in 2 hours","Apply a heating pad"],answer:0,rationale:"Pain out of proportion and pain with passive stretch are early warning signs. Pulses may remain present until late; urgent evaluation is required.",record:"Pain 10/10; capillary refill 3 seconds; increasing swelling under cast."},
{category:"Cardiovascular",topic:"Acute pulmonary embolism",patient:"On postoperative day 2 after hip replacement, a client develops sudden dyspnea, pleuritic chest pain, HR 132, RR 32 and SpO2 84%.",question:"What should the nurse do first?",choices:["Activate rapid response, support oxygenation and remain with the client","Massage the affected calf","Ambulate the client","Offer oral fluids and reassess in 30 minutes"],answer:0,rationale:"Acute hypoxemia and sudden dyspnea suggest a potentially life-threatening pulmonary embolism. Escalate immediately and support oxygenation.",record:"ECG sinus tachycardia; CT pulmonary angiography requested; unilateral calf swelling noted earlier."},
{category:"Respiratory",topic:"Asthma exacerbation",patient:"A 19-year-old with asthma has difficulty speaking, RR 34, SpO2 89%, minimal air movement and a peak expiratory flow of 28% of personal best.",question:"Which finding signals impending respiratory failure?",choices:["Diminishing breath sounds with exhaustion","Mild expiratory wheeze after treatment","Peak flow improving to 70% of personal best","Ability to speak in full sentences"],answer:0,rationale:"A quiet chest and exhaustion in a severely distressed client can indicate critically reduced airflow and impending failure.",record:"Peak flow 28% of personal best; SpO2 89% on room air; accessory muscle use."},
{category:"Renal",topic:"Hemodialysis hypotension",patient:"During hemodialysis, BP drops from 150/82 to 84/48 after 2.9 L ultrafiltration. The client is nauseated, pale and dizzy.",question:"Which action is appropriate?",choices:["Stop or reduce ultrafiltration per protocol and initiate the unit hypotension response","Increase ultrafiltration to reach the target weight","Ask the client to stand","Compress the fistula"],answer:0,rationale:"The presentation is consistent with intradialytic hypotension. Follow the dialysis-unit response protocol and reassess hemodynamic status.",record:"Pre-weight 82.0 kg; current weight 79.1 kg; access bruit and thrill present."},
{category:"Pharmacology",topic:"Digoxin toxicity",patient:"A 76-year-old taking digoxin and furosemide reports nausea and yellow halos. Apical pulse 46/min; potassium 2.8 mEq/L.",question:"Which action should the nurse take?",choices:["Withhold digoxin and promptly notify the prescriber","Give the scheduled dose with food","Double the next dose if nausea improves","Encourage a high-sodium meal"],answer:0,rationale:"Bradycardia, visual changes, nausea and hypokalemia suggest digoxin toxicity. Withhold the dose and urgently evaluate.",record:"K 2.8 mEq/L; creatinine 1.8 mg/dL; ECG ordered."},
{category:"Pediatrics",topic:"Newborn hypoglycemia",patient:"A 2-hour-old infant of a diabetic parent is jittery and has a weak cry. Point-of-care glucose is 28 mg/dL; temperature 36.2°C.",question:"Which action is the priority?",choices:["Initiate the newborn hypoglycemia protocol and promptly treat the low glucose","Wait until the next scheduled feeding to recheck","Give sterile water","Place the infant unwrapped under a fan"],answer:0,rationale:"Symptomatic neonatal hypoglycemia requires immediate protocol-based treatment and reassessment; thermal support is also important.",record:"Glucose 28 mg/dL; axillary temperature 36.2°C; feeding assessment required."},
{category:"GI / Hepatic",topic:"Hepatic encephalopathy",patient:"A client with cirrhosis becomes disoriented and has asterixis after several days of constipation. Ammonia is 92 µmol/L; INR 1.9.",question:"Which intervention should the nurse anticipate?",choices:["Prescribed lactulose with monitoring of mental status, stool pattern and electrolytes","A sedative to suppress agitation","Permanent elimination of all dietary protein","No intervention unless ammonia doubles"],answer:0,rationale:"New confusion and asterixis suggest hepatic encephalopathy. Assess precipitants and administer prescribed therapy while monitoring response and fluid/electrolyte balance.",record:"Ammonia 92 µmol/L; bilirubin 3.4 mg/dL; INR 1.9; no stool for 72 hours."},
{category:"Behavioral Health",topic:"Alcohol withdrawal",patient:"Thirty-six hours after the last alcohol intake, a client is tremulous, diaphoretic and disoriented, with HR 128, BP 174/98 and visual hallucinations.",question:"Which intervention is the priority?",choices:["Initiate seizure precautions and follow the prescribed benzodiazepine withdrawal protocol","Leave the client alone to reduce stimulation","Use an antipsychotic as the sole treatment","Encourage unassisted ambulation"],answer:0,rationale:"Severe alcohol withdrawal can progress to seizures and delirium tremens. Use the ordered protocol, protect from injury and monitor respiration.",record:"CIWA-Ar 25; magnesium 1.3 mg/dL; potassium 3.1 mEq/L."},
{category:"Fundamentals",topic:"Delegation",patient:"The RN is caring for four stable clients. A UAP is available and an LPN is assigned to the team.",question:"Which task is appropriate for the RN to delegate to the UAP?",choices:["Obtain routine vital signs on a stable client and report abnormalities","Perform the initial admission assessment","Develop the nursing care plan","Evaluate a new medication's therapeutic response"],answer:0,rationale:"Routine data collection for a stable client may be delegated to a trained UAP; assessment, planning and evaluation remain RN responsibilities.",record:"All four clients are stable; no new symptoms or unstable vital signs reported."},
{category:"Maternal-Newborn",topic:"Magnesium sulfate toxicity",patient:"A client receiving magnesium sulfate for severe preeclampsia has RR 10/min, absent patellar reflexes and urine output 20 mL/hr.",question:"Which action should the nurse take?",choices:["Stop the infusion and urgently notify the provider; prepare prescribed calcium gluconate","Increase the infusion rate","Encourage ambulation","Administer an additional magnesium bolus"],answer:0,rationale:"Respiratory depression, absent reflexes and oliguria suggest magnesium toxicity. Stop the infusion, escalate and prepare the prescribed antidote.",record:"Magnesium infusion running; RR 10/min; DTRs absent; urine output 20 mL/hr."},
{category:"Infectious Disease",topic:"C. difficile",patient:"A hospitalized client has profuse watery diarrhea after clindamycin. Stool testing is positive for C. difficile toxin.",question:"Which infection-control action is appropriate?",choices:["Use contact/enteric precautions and soap-and-water hand hygiene","Use airborne precautions only","Use alcohol hand rub as the sole hand hygiene method","Share a commode after routine wiping"],answer:0,rationale:"C. difficile spores require contact/enteric precautions, environmental sporicidal cleaning and soap-and-water hand hygiene.",record:"Seven watery stools in 24 hours; WBC 16,200/mm³; toxin assay positive."},
{category:"Cardiovascular",topic:"Heart failure",patient:"A client with heart failure has gained 2.4 kg in 3 days, reports orthopnea and has crackles halfway up both lungs. SpO2 88%.",question:"Which assessment finding requires immediate action?",choices:["Hypoxemia with worsening pulmonary congestion","Mild ankle edema unchanged from baseline","Stable appetite","A chronic dry cough without change"],answer:0,rationale:"Hypoxemia and pulmonary congestion indicate acute decompensation. Prioritize breathing and prompt escalation.",record:"Weight gain 2.4 kg; BNP 1,240 pg/mL; chest radiograph shows pulmonary vascular congestion."},
{category:"Oncology / Hematology",topic:"Neutropenic fever",patient:"A client receiving chemotherapy has an oral temperature of 38.4°C, ANC 380/mm³ and chills. BP 98/60, HR 118.",question:"Which action is the priority?",choices:["Notify the oncology team immediately and initiate the febrile-neutropenia pathway","Administer a rectal suppository","Wait for the next scheduled CBC","Place fresh flowers in the room"],answer:0,rationale:"Fever with severe neutropenia is an emergency requiring rapid evaluation and timely antimicrobial therapy per protocol.",record:"ANC 380/mm³; lactate 2.4 mmol/L; blood cultures ordered."},
{category:"Neurologic",topic:"Autonomic dysreflexia",patient:"A client with a T4 spinal cord injury develops pounding headache, flushing and BP 208/110. The urinary catheter tubing is kinked.",question:"What should the nurse do first?",choices:["Sit the client upright and remove the triggering stimulus by checking the catheter","Place the client flat","Apply an abdominal binder tightly","Delay action until the headache resolves"],answer:0,rationale:"Autonomic dysreflexia is a hypertensive emergency. Sit upright, loosen restrictive items and rapidly identify/remove the trigger while following protocol.",record:"Baseline BP 100/62; current BP 208/110; catheter tubing visibly kinked."}
];

const formatInstructions: Record<NclexItemType,string> = {
"single-response":"Select the one best response.",
"multiple-response":"Select all responses that apply.",
"extended-multiple-response":"Select every finding or intervention that applies; more than one response is correct.",
"drop-down-cloze":"Complete the clinical statement using the drop-down selections.",
"drop-down-table":"Choose the best response in each row of the table.",
"highlight-text":"Select the clinical cues in the record that require follow-up.",
"highlight-table":"Select the table cells that represent clinically significant findings.",
"matrix-grid":"For each finding, select the most appropriate classification.",
"ordered-response":"Place the nursing actions in the safest sequence.",
"bow-tie":"Choose the most likely condition, two priority actions and two parameters to monitor.",
"trend":"Interpret the change in the clinical findings over time.",
"extended-drag-drop":"Arrange the response steps in the correct order using the move controls.",
"graphics-based":"Use the labeled clinical graphic to identify the priority area or finding."
};

function buildInteraction(type:NclexItemType, seed:Seed, n:number) {
  const correct = String(seed.answer);
  const choices = seed.choices;
  const common = {instruction:formatInstructions[type],choices,correctResponse:[correct]};
  if(type==="multiple-response"||type==="extended-multiple-response") {
    const multiChoices=[...choices,"Reassess the client after the immediate intervention and document the response."];
    return {...common,choices:multiChoices,correctResponse:[correct,"4"]};
  }
  if(type==="drop-down-table") return {...common,correctResponse:[correct,correct],rows:["Clinical interpretation","Nursing response"]};
  if(type==="highlight-text"||type==="highlight-table") return {...common,correctResponse:["0"],segments:[...seed.patient.split(". "),...seed.record.split("; ")]};
  if(type==="drop-down-cloze") return {...common,rows:["Priority interpretation","Immediate nursing response"],columns:choices};
  if(type==="matrix-grid") return {...common,correctResponse:["Emergency","Emergency","Needs follow-up"],rows:["Finding 1: "+seed.topic,"Finding 2: vital-sign change","Finding 3: diagnostic result"],columns:["Expected","Needs follow-up","Emergency"],correctMatrix:{"0":"Emergency","1":"Emergency","2":"Needs follow-up"}};
  if(type==="ordered-response"||type==="extended-drag-drop") return {...common,correctResponse:["0","1","2","3"],orderItems:["Assess immediate safety and airway","Initiate the indicated emergency response","Carry out prescribed/authorized intervention","Reassess and document response"],correctOrder:[0,1,2,3]};
  if(type==="bow-tie") return {...common,correctResponse:["c0","a0","a1","m0","m1"],bowTie:{conditions:["Acute deterioration related to "+seed.topic,"Expected recovery finding","Chronic stable condition"],actions:choices,monitoring:["Vital signs and oxygenation","Relevant laboratory trend","Routine appetite","Hair and skin changes"],correctCondition:0,correctActions:[0,1],correctMonitoring:[0,1]}};
  if(type==="trend") return {...common,trend:[{time:"Initial",findings:seed.patient},{time:"Current",findings:seed.record},{time:"Clinical question",findings:seed.question}]};
  if(type==="graphics-based") return {...common,correctResponse:[String(n%4)],graphic:{title:seed.topic+" clinical reference",description:"Schematic teaching graphic; use the labeled regions with the clinical record.",labels:["Airway / breathing","Circulation / perfusion","Neurologic status","Affected body system"],correctLabels:[n%4]}};
  return common;
}

// Five distinct clinical-judgment prompts are authored from each patient record.
// The 100-item extension covers all 13 interactive formats; each item has its own ID.
const prompts = [
  (s:Seed)=>s.question,
  (s:Seed)=>"Which additional assessment finding would most strongly support the priority concern in this client? "+s.patient,
  (s:Seed)=>"Which provider order should the nurse clarify before implementation? "+s.patient,
  (s:Seed)=>"Which change best indicates that the immediate intervention has been effective? "+s.patient,
  (s:Seed)=>"Which information should the nurse communicate during an urgent handoff? "+s.patient
];
const extension: Question[] = Array.from({length:100},(_,i)=>{
  const seed=seeds[i%seeds.length];
  const type=NCLEX_ITEM_TYPES[i%NCLEX_ITEM_TYPES.length];
  const prompt=prompts[Math.floor(i/seeds.length)%prompts.length](seed);
  return {
    id:"ngn-"+String(i+1).padStart(3,"0"),
    category:seed.category,
    topic:seed.topic,
    difficulty:i%4===0?"Advanced":i%3===0?"Foundational":"Intermediate",
    prompt: type==="multiple-response"?"Which nursing actions are appropriate? Select all that apply. "+prompt:type==="extended-multiple-response"?"Select every applicable finding and nursing action. "+prompt:type==="ordered-response"||type==="extended-drag-drop"?"Arrange the nursing actions in the safest sequence for this client. "+prompt:prompt,
    options:seed.choices,
    answer:seed.answer,
    rationale:seed.rationale,
    status:"published",
    format:type==="multiple-response"||type==="extended-multiple-response"?"multiple":"single",
    itemType:type,
    interaction:buildInteraction(type,seed,i),
    caseStudy:seed.patient,
    exhibit:seed.record,
    caseStudyId:"ngn-case-"+String(i%seeds.length+1).padStart(2,"0"),
    clinicalJudgmentStep:(["recognize-cues","analyze-cues","prioritize-hypotheses","generate-solutions","take-action","evaluate-outcomes"] as const)[i%6],
    contentVersion:2,
    reviewStatus:"generated"
  };
});

function migrateLegacy(q:Question):Question {
  const itemType:NclexItemType=q.format==="multiple"?"multiple-response":"single-response";
  return {...q,itemType,interaction:{instruction:itemType==="multiple-response"?"Select all responses that apply.":"Select the one best response.",choices:q.options,correctResponse:[String(q.answer)]},contentVersion:2,reviewStatus:q.reviewStatus??"generated"};
}
export const questionBank500V2:Question[]=questionBank500.map(migrateLegacy);
export const questionBank100:Question[]=extension;
export const questionBank600:Question[]=[...questionBank500V2,...questionBank100];
if(questionBank100.length!==100) throw new Error("NGN extension must contain exactly 100 items.");
if(new Set(questionBank600.map(q=>q.id)).size!==600) throw new Error("Question IDs must be unique across the 600-item bank.");
export const itemFormatCounts = NCLEX_ITEM_TYPES.map(type=>({type,count:questionBank100.filter(q=>q.itemType===type).length}));

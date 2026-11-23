import fs from "node:fs";
import path from "node:path";
const TARGET=Number(process.env.TARGET_QUESTION_COUNT||3600), BASELINE=Number(process.env.BASELINE_QUESTION_COUNT||600);
const DEADLINE=new Date(process.env.DEADLINE_UTC||"2026-11-29T16:00:00Z"), BATCH_SIZE=10, MAX_BATCHES=10;
const OLLAMA_HOST=(process.env.OLLAMA_HOST||"http://127.0.0.1:11434").replace(/\\/$/, ""), MODEL=process.env.OLLAMA_MODEL||"qwen2.5:7b-instruct";
const OUT="question-bank-generated", MANIFEST=path.join(OUT,"automation-manifest.json");
const read=p=>JSON.parse(fs.readFileSync(p,"utf8")), write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n");
const schema=read("docs/question-bank/quickrn-question-schema.json"), rules=read("docs/question-bank/quickrn-validation-rules.json");
const blueprint=read("docs/question-bank/quickrn-topic-blueprint.json");
const now=new Date(); if(!fs.existsSync(OUT))fs.mkdirSync(OUT,{recursive:true});
const manifest=fs.existsSync(MANIFEST)?read(MANIFEST):{target_total:TARGET,baseline_count:BASELINE,accepted_count:0,rejected_count:0,repaired_count:0,batches:[]};
const files=fs.readdirSync(OUT).filter(f=>f.endsWith(".json")&&f!=="automation-manifest.json");
const priorIds=new Set(), stems=new Set();
for(const f of files){const b=read(path.join(OUT,f));for(const q of b.questions||[]){priorIds.add(q.id);stems.add(norm(q.stem));}}
function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
const accepted=Math.max(manifest.accepted_count||0,priorIds.size), remaining=Math.max(0,TARGET-BASELINE-accepted);
const campaignStart=new Date("2026-11-23T00:00:00Z");
const elapsedFraction=Math.max(0,Math.min(1,(now-campaignStart)/(DEADLINE-campaignStart)));
const cumulativeTarget=Math.min(TARGET,BASELINE+Math.ceil((TARGET-BASELINE)*elapsedFraction));
const due=Math.max(0,cumulativeTarget-(BASELINE+accepted));
const runBudget=Math.min(remaining,due,BATCH_SIZE*MAX_BATCHES);
if(remaining){try{const ping=await fetch(OLLAMA_HOST+"/api/version");if(!ping.ok)throw new Error("Ollama server unavailable");}catch(e){console.error("Ollama is required and must be running locally:",e.message);process.exit(2);}}
const types=rules.question_integrity.valid_question_types.filter(type=>type!=="hot_spot");
const topics=(blueprint.domains||[]).map(d=>({domain:d.name,topics:d.topics,conditions:d.seed_conditions}));
function validate(q,id){
 const req=schema.$defs.question.required;
 if(!q||typeof q!=="object")return "not_object";
 for(const k of req)if(!(k in q))return "missing_"+k;
 if(q.id!==id)return "id_mismatch";
 if(!q.topic?.trim()||!q.subtopic?.trim()||!q.stem?.trim()||norm(q.stem).length<35)return "empty_or_short_text";
 if(!rules.question_integrity.valid_difficulty_values.includes(q.difficulty)||!types.includes(q.question_type))return "invalid_enum";
 if(!q.rationales?.correct?.trim()||!Array.isArray(q.rationales.incorrect)||!q.clinical_judgment?.explanation?.trim())return "missing_rationale";
 if(!Number.isInteger(q.estimated_time_seconds)||q.estimated_time_seconds<15)return "invalid_time";
 if(stems.has(norm(q.stem)))return "duplicate_stem";
 const opts=q.interaction?.options||[];
 if(q.question_type==="multiple_choice"&&(!q.correct_response?.selected_option||opts.length<4||!opts.some(o=>o.id===q.correct_response.selected_option)))return "invalid_mcq";
 if(q.question_type==="multiple_response"&&(!Array.isArray(q.correct_response?.selected_options)||q.correct_response.selected_options.length<2||q.correct_response.selected_options.some(id=>!opts.some(o=>o.id===id))))return "invalid_multi";
 if(q.question_type==="case_study"&&!q.case_study_id)return "missing_case_id";
 if(q.question_type==="hot_spot")return "hotspot_requires_asset";
 return null;
}
async function generate(count,first,repairText="",explicitIds=null){
 const ids=explicitIds||Array.from({length:count},(_,i)=>"QRN-"+String(first+i).padStart(6,"0"));
 const assigned=ids.map((_,i)=>types[(first+i-1)%types.length]);
 const prompt="Return ONLY JSON {questions:[...]}. Generate exactly "+count+" original QuickRNv2 NCLEX-RN/NGN questions with IDs "+ids[0]+" through "+ids.at(-1)+". Exact question schema: "+JSON.stringify(schema)+". Rules: "+JSON.stringify(rules)+". Topic blueprint: "+JSON.stringify(topics)+". Required types in order: "+JSON.stringify(assigned)+". Every item must have a unique topic-specific patient presentation, internally consistent relevant findings, a defensible answer, complete correct and incorrect rationales, and no repeated template or invented unsupported clinical data. Do not claim clinical verification. "+repairText;
  const res=await fetch(OLLAMA_HOST+"/api/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({model:MODEL,stream:false,format:schema,messages:[{role:"user",content:prompt}],options:{temperature:0.35,num_ctx:16384,num_predict:30000},keep_alive:"10m"})});
  if(!res.ok)throw new Error("Ollama HTTP "+res.status+" "+(await res.text()).slice(0,500));
  const data=await res.json(), raw=data.message?.content;
  if(!raw)throw new Error("Empty Ollama response");return JSON.parse(raw.replace(/^\\s*```(?:json)?/i,"").replace(/```\\s*$/,""));
}
let runAccepted=0,runRejected=0,attempts=0;
let nextId=priorIds.size?Math.max(546,...[...priorIds].map(id=>Number(String(id).replace("QRN-",""))||0))+1:547;
while(runAccepted+runRejected<runBudget&&attempts<MAX_BATCHES){
 const count=Math.min(BATCH_SIZE,runBudget-runAccepted-runRejected), first=nextId;
 try{
  const data=await generate(count,first);
  if(!Array.isArray(data.questions)||data.questions.length!==count)throw new Error("wrong_item_count");
  const bad=[];
  for(let i=0;i<count;i++){const q=data.questions[i],id="QRN-"+String(first+i).padStart(6,"0"),issue=validate(q,id);if(issue)bad.push({id,issue,original:q});else stems.add(norm(q.stem));}
  let good=data.questions.filter((q,i)=>!bad.some(x=>x.id==="QRN-"+String(first+i).padStart(6,"0")));
  if(bad.length){
   const fixed=await generate(bad.length,first,"Repair these failed items in the exact order and IDs; fix the issues: "+JSON.stringify(bad.map(x=>({id:x.id,issue:x.issue,original:x.original}))),bad.map(x=>x.id));
   for(let i=0;i<bad.length;i++){const q=fixed.questions?.[i],issue=validate(q,bad[i].id);if(!issue){good.push(q);stems.add(norm(q.stem));manifest.repaired_count++;}}
  }
  if(good.length){
   good.sort((a,b)=>a.id.localeCompare(b.id));
   const seq=manifest.batches.length+1,batchId="QRN-BATCH-"+String(seq).padStart(3,"0");
   const batch={schema_version:schema.schema_version||"1.0.0",bank:"QuickRNv2",batch:{batch_id:batchId,sequence:seq,requested_count:count,generated_count:good.length,first_question_id:good[0].id,last_question_id:good.at(-1).id,status:good.length===count?"complete":"partial"},questions:good};
   const file=batchId.toLowerCase()+".json";write(path.join(OUT,file),batch);
   manifest.batches.push({batch_id:batchId,file:OUT+"/"+file,requested:count,accepted:good.length,rejected:count-good.length,created_at:new Date().toISOString()});
   runAccepted+=good.length;runRejected+=count-good.length;
  }else runRejected+=count;
 }catch(e){console.error("Generation batch failed:",e.message);runRejected+=count;manifest.failures=[...(manifest.failures||[]),{at:new Date().toISOString(),first_id:first,count,error:e.message}];}
 attempts++;nextId+=count;
}
manifest.target_total=TARGET;manifest.baseline_count=BASELINE;manifest.accepted_count=accepted+runAccepted;
manifest.rejected_count=(manifest.rejected_count||0)+runRejected;manifest.deadline_utc=DEADLINE.toISOString();
manifest.remaining_count=Math.max(0,TARGET-BASELINE-manifest.accepted_count);
manifest.daily_required=Math.ceil(manifest.remaining_count/Math.max(1,Math.ceil((DEADLINE-new Date())/86400000)));
manifest.last_run_at=new Date().toISOString();manifest.last_run_accepted=runAccepted;manifest.last_run_rejected=runRejected;
write(MANIFEST,manifest);
console.log(JSON.stringify({total:BASELINE+manifest.accepted_count,target:TARGET,accepted_this_run:runAccepted,rejected_this_run:runRejected,remaining:manifest.remaining_count,daily_required:manifest.daily_required,deadline:manifest.deadline_utc},null,2));

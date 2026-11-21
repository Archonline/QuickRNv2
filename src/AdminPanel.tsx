import { useState, type FormEvent } from "react";
import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

type ImportItem = { id?: string; category: string; topic: string; difficulty: "Foundational" | "Intermediate" | "Advanced"; prompt: string; options: string[]; answer: number; rationale: string };
const example = JSON.stringify([{category:"Fundamentals",topic:"Patient safety",difficulty:"Foundational",prompt:"Example question text",options:["Option A","Option B","Option C","Option D"],answer:0,rationale:"Example rationale."}],null,2);
export default function AdminPanel({onImported}:{onImported:()=>void}) {
  const [json,setJson]=useState(example); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent) {
    event.preventDefault(); setMessage("");
    if(!db){setMessage("Firebase is not configured.");return;}
    let items: ImportItem[];
    try { const parsed: unknown=JSON.parse(json); if(!Array.isArray(parsed) || parsed.length===0 || parsed.length>100) throw new Error("Provide an array of 1–100 question objects."); items=parsed as ImportItem[]; }
    catch(e){setMessage(e instanceof Error ? e.message : "Invalid JSON.");return;}
    for(const [i,q] of items.entries()){
      if(!q.category || !q.topic || !q.prompt || !q.rationale || !Array.isArray(q.options) || q.options.length<2 || !Number.isInteger(q.answer) || q.answer<0 || q.answer>=q.options.length || !["Foundational","Intermediate","Advanced"].includes(q.difficulty)) {setMessage("Question "+(i+1)+" is missing required fields or has an invalid answer index.");return;}
    }
    setBusy(true);
    try {
      const batch=writeBatch(db);
      items.forEach((q)=>{
        const id=(q.id || crypto.randomUUID()).replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,100);
        batch.set(doc(collection(db,"questions"),id),{category:q.category,topic:q.topic,difficulty:q.difficulty,prompt:q.prompt,options:q.options,answer:q.answer,rationale:q.rationale,status:"published",updatedAt:new Date()});
      });
      await batch.commit(); setMessage(items.length+" questions published to the learner bank."); onImported();
    } catch(e){setMessage(e instanceof Error ? e.message : "Import failed. Confirm admin custom claims and Firestore rules.");}
    finally{setBusy(false);}
  }
  return <section className="admin-panel"><div className="eyebrow">ADMINISTRATION</div><h2>Bulk question importer</h2><p>Paste a JSON array of question objects. Imported content is immediately visible to signed-in learners and should be treated as generated study material, not official or clinically validated NCLEX content.</p><form onSubmit={submit}><textarea value={json} onChange={e=>setJson(e.target.value)} rows={12} spellCheck={false}/><div className="admin-actions"><span>{message}</span><button className="button primary" disabled={busy}>{busy?"Publishing…":"Publish question batch"}</button></div></form></section>;
}

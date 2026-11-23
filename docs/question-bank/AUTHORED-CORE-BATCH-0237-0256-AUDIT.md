# Core Replacement Batch Audit — qrn-0237–qrn-0256

**Batch:** 20 individually authored core replacement drafts  
**Integration:** stable-ID replacement in the 500-item core bank  
**Status:** development / draft; not clinically verified

## Item inventory

| ID | Topic | Primary decision task |
|---|---|---|
| qrn-0237 | Guillain-Barré syndrome | Recognize bulbar weakness and declining vital capacity as impending ventilatory failure |
| qrn-0238 | Meningitis | Defer lumbar puncture and escalate when new findings raise concern for increased intracranial pressure |
| qrn-0239 | Aphasia | Use supported communication strategies for expressive aphasia |
| qrn-0240 | Increased intracranial pressure | Escalate neurologic deterioration and protect oxygenation/venous drainage |
| qrn-0241 | Acute stroke | Maintain NPO status until swallowing safety is established |
| qrn-0242 | Severe headache after lumbar puncture | Assess and escalate a positional post-dural puncture headache |
| qrn-0243 | Seizure | Protect from injury and avoid unsafe oral or intraoral interventions during a seizure |
| qrn-0244 | Autonomic dysreflexia | Sit upright and assess for bladder obstruction as a likely trigger |
| qrn-0245 | Alzheimer disease | Use person-centered redirection and safety measures for evening agitation |
| qrn-0246 | Cerebral palsy | Recognize aspiration/nutrition risk and request swallowing assessment |
| qrn-0247 | Guillain-Barré syndrome | Recognize autonomic instability and respiratory decline requiring continuous monitoring |
| qrn-0248 | Meningitis | Prioritize sepsis escalation and time-critical antimicrobial/resuscitation treatment |
| qrn-0249 | Aphasia | Treat a new language deficit as possible recurrent acute stroke |
| qrn-0250 | Increased intracranial pressure | Recognize findings concerning for impending herniation |
| qrn-0251 | Buck traction | Restore freely suspended traction weights |
| qrn-0252 | Compartment syndrome | Recognize early compartment syndrome despite palpable distal pulses |
| qrn-0253 | Long-bone fracture | Protect an open fracture, immobilize, and reassess distal neurovascular status |
| qrn-0254 | Fat embolism | Recognize hypoxemia, neurologic change, and petechiae after femoral fixation |
| qrn-0255 | Total hip replacement | Protect a potentially dislocated prosthesis and avoid manipulation/weight bearing |
| qrn-0256 | Osteoporosis | Teach safe weekly oral alendronate administration |

## Structural and duplication checks performed

- 20 new IDs present; no duplicate IDs within the 120-item authored inventory.
- 20 new prompt records parsed.
- Cross-batch normalized prompt comparison: **120 unique prompts; no remaining exact normalized prompt duplicates**.
- Each new item has four response options.
- Each answer index is an integer within the four-option range.
- Each new item has four option-specific rationales.
- Each new item has a distinct clinical scenario and task; the stable category/topic sequence was checked against the original core inventory positions.
- The first duplicate-stem pass identified five generic prompt repetitions. All five were replaced with item-specific decision prompts, then the cross-batch duplicate check was rerun with no remaining exact prompt collisions.
- All new items are integrated by stable question ID, not array position.

## Clinical and release limitations

This audit is not a clinical validation. The items have not yet received item-level evidence verification or qualified clinical review of the answer key, distractors, and rationales. Their `reviewMetadata.references` arrays remain empty and their publication status remains `draft`. Do not publish them based on automated checks alone.

The next release gate must attach traceable evidence for each clinical claim and obtain qualified reviewer adjudication. TypeScript/build, automated question-bank audit, unit tests, and browser regression results are tracked by the associated pull request and must be checked before merge.

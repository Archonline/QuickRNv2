# QuickRNv2 600-item bank reconciliation

**Reconciled against:** `src/questionBank.ts` and `src/ngnQuestionBank.ts` on the current main branch.

## Count

| Segment | Export | Count |
|---|---|---:|
| Core topic bank | `questionBank500` | 500 |
| NGN format extension | `questionBank100` | 100 |
| **Published combined bank** | **`questionBank600`** | **600** |

The 500-item core export name caused the previous report to understate the published total. The NGN module explicitly combines both segments and checks that all 600 IDs are unique.

## Content-quality findings

The source-level audit found that the count is not equivalent to 600 individually authored clinical cases:

- The 500-item core bank is generated from 14 broad category seeds and topic lists. Many topics inherit the same category-level patient scenario, priority action, rationale, and distractor pool unless a topic-specific override exists.
- The core generator also synthesizes demographic and vital-sign values arithmetically. Those values are not evidence that the clinical presentation was individually authored or clinically reconciled.
- The 100-item NGN extension is generated from a small seed set using modulo cycling. This creates repeated patient contexts across different item formats and question tasks.
- A limited set of topic overrides exists, but it does not cover every topic in the 600-item bank.
- Existing automated build checks establish compilation and structural invariants; they do not establish that every answer key, rationale, or distractor is clinically correct.

## Required remediation

1. Preserve all 600 IDs unless an item is explicitly identified as a duplicate and replaced with a distinct, topic-aligned item.
2. Build a per-item content audit covering scenario-to-topic alignment, finding-to-answer support, rationale accuracy, distractor plausibility, and format-specific scoring.
3. Replace category-level scenario reuse and synthetic clinical values with individually authored, internally consistent patient records.
4. Reconcile the NGN extension independently; do not treat a format conversion as a clinical-content rewrite.
5. Run schema, answer-key, duplicate, clinical-consistency, and rendering tests after each revision batch.
6. Report counts as 500 core + 100 NGN = 600 total, with separate counts for revised, unchanged, flagged, and replaced items.


## Remediation progress — first authored content batches

The following topic-specific clinical profiles have now been added to the core-bank generator. Each profile supplies its own patient presentation, focused findings, priority action, three clinically plausible distractors, rationale, and relevant record data:

- **Maternal-newborn:** 16 newly authored profiles, including abruption, cord prolapse, severe preeclampsia, late decelerations, PROM, postpartum hemorrhage, shoulder dystocia, preterm labor, intra-amniotic infection, gestational diabetes, fetal variability, amniotic fluid embolism, ectopic pregnancy, hyperemesis, breastfeeding problems, and newborn thermoregulation. Four additional maternal topics already had dedicated overrides.
- **Cardiovascular:** 16 newly authored profiles, including atrial fibrillation, acute MI, tamponade, DVT, PAD, symptomatic bradycardia, vasospastic angina, ICD teaching, hypertensive emergency, dissection, endocarditis, cardiogenic shock, acute limb ischemia, anticoagulation bleeding, unstable tachycardia, and ACS. Heart failure and pulmonary embolism already had dedicated overrides.
- **Respiratory:** 9 newly authored profiles, including COPD exacerbation, asthma, inhaler technique, pulse oximetry, laryngectomy airway, pneumonia, acute respiratory failure, chest-tube air leak, and fresh-tracheostomy dislodgement. Pulmonary embolism already had a dedicated override.

These are topic-specific profiles, not a claim that every item has an individually unique vignette: repeated questions assigned to the same topic currently draw from the same topic profile. The six existing unfolding case studies also replace the first 36 core-bank positions and still need their six-screen prompts, findings, and answers rewritten as case-specific sequences rather than generic follow-up templates.

**Remaining work:** author topic profiles for the other core-bank topics; rewrite all six unfolding case studies screen-by-screen; then replace the cyclic NGN seed set with topic-specific NGN cases and item tasks. Run TypeScript/build/tests and clinical consistency checks after the full remediation pass.

**Status:** Count reconciled; 41 new topic profiles committed, with pre-existing topic overrides retained. The full 600-item clinical remediation remains in progress and is not certified as complete or clinically validated.

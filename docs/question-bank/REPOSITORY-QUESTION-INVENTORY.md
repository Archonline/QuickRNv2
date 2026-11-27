# QuickRNv2 Repository Question Inventory

**Inventory date:** 2026-11-26 (run 4 audit update)  
**Branch inspected:** `feat/3600-question-bank-expansion` at `97b16f9165932db1feceea5b05e5632ca1cf5c1b`  
**Scope:** source files assembled into the runtime question bank, source-level replacement batches, the separate development examples, and the standalone NGN 300-project archive.

## Executive count

| Inventory | Count | Counting rule |
|---|---:|---|
| Traditional/core runtime bank | 500 | `questionBank500` in `src/questionBank.ts` |
| Standalone NGN runtime extension | 100 | `questionBank100` in `src/ngnQuestionBank.ts` |
| **Assembled runtime bank** | **600** | `questionBank600 = [...questionBank500V2, ...questionBank100]` |
| Separate development/example questions | 4 | `questions` in `src/questions.ts`; not included in `questionBank600` |
| **Distinct repository question records including examples** | **604** | 600 runtime bank records + 4 separate examples; not all are production-bank items |

The two curated JSON files are source inputs to the 500/100 banks. They must not be added again to the runtime total.

## Core-bank composition

The 500-item core bank is composed as follows:

| Core content | Count | Notes |
|---|---:|---|
| Unfolding case-study screens | 36 | Six screens for each of six cases; inserted into the first 36 core positions |
| Curated traditional items | 100 | Loaded from `src/curatedQuestionBatch2_100.json` |
| Rewritten core items | 364 | Authored replacement batches integrated by stable IDs |
| **Total** | **500** | These are mutually exclusive positions in the assembled core bank |

### Recent authored replacement batches

| Source file | Entries | ID range |
|---|---:|---|
| `src/authoredCoreRewriteBatch.ts` | 100 | qrn-0137 onward |
| `src/authoredCoreRewriteBatch2.ts` | 20 | qrn-0237–qrn-0256 |
| `src/authoredCoreRewriteBatch3.ts` | 244 | qrn-0257–qrn-0500 |
| **Total replacement entries** | **364** | Replacements, not 364 additional bank positions |

All 364 replacement entries are integrated into the 500-item core bank by stable ID. They replace prior core items; they do not increase the core-bank total from 500 to 864.

## Review and publication status

Do not equate runtime `status: published` with clinical approval.

- The 364 replacement items are authored as development drafts with `reviewStatus: generated`, `reviewMetadata.status: not-clinically-verified`, and `publicationStatus: draft`. The core assembly currently maps these items to runtime `status: published` and sets `auditRequired: true`. This is a learner-accessibility/runtime status, not evidence of clinical approval.
- The 100 curated traditional items carry `review_metadata.status: not_clinically_verified` in their source JSON. They are mapped to runtime published records, but are not clinically verified by that metadata.
- The 100 NGN extension items are mapped to runtime `status: published`, while their generated records carry `reviewStatus: generated` and `reviewMetadata.status: not-clinically-verified`.
- The 36 unfolding case-study screens have runtime `status: published`, but the current case-screen construction does not attach item-level clinical review metadata. Their clinical approval status is therefore unsubstantiated by the inspected source.

### Conservative review tally

| Review classification | Count |
|---|---:|
| Explicitly marked not clinically verified / draft | 564 |
| Missing item-level review metadata in case-study screens | 36 |
| Confirmed clinically verified in inspected source | 0 |
| **Total runtime bank** | **600** |

The 0 confirmed count means the inspected repository source does not substantiate clinical verification; it is not a claim that no human has ever reviewed any item outside the repository. A qualified reviewer must record approval in item-level metadata before these items are represented as clinically approved.

## New NGN 300-project count

The separate project archive is `src/question-batches/ngn/manifest.json`.

| NGN project measure | Count |
|---|---:|
| Question records in manifest | 0 |
| Batch JSON files currently archived | 0 |
| FINALIZED-DRAFT records | 0 |
| BLOCKED records | 0 |
| REJECTED records | 0 |
| Historical QR-NGN candidates reported in previous conversations but not archived | 30 |
| New QR-NGN items verified in the repository archive | 0 |

The 30 historical candidates (QR-NGN-001–QR-NGN-030) are not present as recoverable question records in the current GitHub NGN archive. They are not counted as available repository questions and must not be assumed to exist solely from prior conversation summaries.

## Counting rules

1. Count the exported runtime arrays, not every source file independently.
2. Count the 364 authored rewrite records as integrated replacements within the 500 core items, not additional items.
3. Count the 100 NGN extension items once, as part of the 600 runtime bank.
4. Keep the four `dev-001`–`dev-004` examples separate from the runtime bank.
5. Do not count prompts, audit reports, handoff notes, test fixtures, or unarchived historical claims as question records.
6. Report runtime publication state separately from clinical verification state.

## Next recommended work

The highest-value next task is an item-level release audit of the 364 rewritten core items, starting with the 244-entry third rewrite tranche. Source inspection already shows some entries with clinical scenario mismatches; they must be audited and corrected before being described as clinically approved. In parallel, add explicit review metadata to the 36 case-study screens and keep the NGN 300-project manifest as a separate count.


## 2026-11-25 item-level audit progress

- Audit tranche: `src/authoredCoreRewriteBatch3.ts`
- Items inspected this run: 20 (`qrn-0257`–`qrn-0276`)
- Static triage result: 20 require substantive remediation; 0 passed for clinical release in this triage pass.
- Common defects: obstetric topics paired with non-obstetric ages/contexts; unrelated laboratory and vital-sign abnormalities; missing pregnancy/postpartum/newborn context; generic stems, options, and rationales that do not test the named topic.
- Representative IDs: `qrn-0258`, `qrn-0259`, `qrn-0263`, `qrn-0269`, `qrn-0271`.
- No question content was modified, no learner-history ID was replaced, no clinical review was recorded, and no runtime inventory count changed.
- Next item-level audit ID: `qrn-0277`; 224 records remain in the 244-item tranche after this first 20-item triage.
- These flags are not clinical validation. Items remain not clinically verified and must not be represented as approved.
- The 3,600-specific Webmaster tracker is currently absent; use the interim ledger `3600-expansion-ledger.json` until a dedicated tracker is restored.


## 2026-11-26 feature-branch baseline triage checkpoint

- Runtime assembly inspection reconfirmed 500 core items, 100 NGN extension items, and a combined 600-ID uniqueness assertion in `src/ngnQuestionBank.ts`. The two curated JSON inputs are not counted again. The 364 authored rewrite entries remain replacements within the 500 core positions.
- The next 20 third-tranche records, `qrn-0277`–`qrn-0296`, were statically audited. All 20 were classified `revise` with qualified educator review required; 0 passed for clinical release.
- Defects include mismatched maternal/newborn patient context, absent topic-defining cues, unrelated physiologic findings, generic/recycled option sets (four families reused five times each), and generic rationales/CJMM mismatches. The detailed item-by-item record is in `3600-expansion-ledger.json` and `runs/2026-11-26-run-03.md`.
- Cumulative third-tranche audit: 40/244 triaged; 40 require substantive revision and educator review; 204 remain. Next ID: `qrn-0297`.
- Runtime inventory remains 600 unique IDs; core credit 600/3,000; Booster 0/600. Net-new questions authored/integrated: 0; runtime delta: 0.
- The 3,600 Webmaster tracker component remains absent. `src/QuestionGenerationTracker.tsx` is linked to the separate NGN 300-draft manifest and is not a substitute.
- No question source, answer key, learner history, runtime selection, clinical review status, or approval record was changed. These static flags do not establish clinical validation.


## 2026-11-26 — third 20-item triage batch (run 4)

- Starting branch head inspected: `9349cacd8bfb4fb746fc52a0732f4f79954c59f0`.
- Source: `src/authoredCoreRewriteBatch3.ts`; IDs `qrn-0297`–`qrn-0316`.
- Static disposition: 20 revise; all 20 require qualified educator review; 0 passed for clinical release.
- Common defects: generic reassessment stem and repeated option/rationale templates; unrelated acute findings create competing emergencies; topic-specific diagnostic cues and relevant patient history are absent; single-response format does not represent the planned NGN format breadth; boilerplate rationales do not support the named clinical decision.
- Representative problems: hypertensive emergency without elevated BP (`qrn-0297`); aortic dissection without aortic/pain/imaging context (`qrn-0298`); infective endocarditis without infection evidence (`qrn-0299`); cardiogenic shock without cardiac/perfusion evidence (`qrn-0300`); warfarin bleeding without anticoagulant/INR/bleeding evidence (`qrn-0302`); VT without rhythm evidence (`qrn-0303`); pacemaker failure without ECG/device context (`qrn-0310`); status asthmaticus without asthma/airflow context (`qrn-0316`).
- Cumulative third-tranche progress: 60/244 triaged; 184 remain; next ID `qrn-0317`.
- Runtime inventory remains 600 unique IDs (500 core + 100 NGN extension); replacement work remains non-additive; Booster remains 0 and no Booster namespace is assigned.
- No source item, answer key, ID, learner history, pool membership or clinical review metadata was changed. Static triage is not clinical verification.
- Latest available Actions evidence was successful on older head `68930635d07f7fb39a9a12e6208a195cf9e74b94`; current-head Vercel status is success. No fresh Actions run was triggered by audit-only documentation changes.


## 2026-11-26 item-level audit — run 5

- Inspected `qrn-0317`–`qrn-0336` in `src/authoredCoreRewriteBatch3.ts`.
- Static disposition: 20 revise; 20 qualified educator review required; 0 clinically cleared.
- Recurring findings: repeated generic reassessment stem and four generic answer/rationale families; all 20 single-response; respiratory/airway and endocrine topics lack defining context; newborn/device/procedure mismatches; unrelated acute laboratory/vital-sign findings create competing priorities.
- Cumulative third-tranche audit: 80/244; 164 remain; next ID `qrn-0337`.
- Runtime count unchanged: 600 unique IDs (500 core + 100 NGN). The 364 rewrite entries remain replacements, not additive inventory. Booster count remains zero; namespace unassigned.
- No clinical content, answer key, stable ID, learner history, pool membership or review record changed. Static triage is not clinical validation.
- Starting-head Vercel status was success. Latest full GitHub Actions checks passed on older head `68930635d07f7fb39a9a12e6208a195cf9e74b94`; no new workflow run was available for the inspected starting head. This audit changed documentation only.


## 2026-11-26 — third-tranche audit run 6

- Start-of-run branch head: `f964f5f0daf8cb6fd7c774daa1e5393148502db8`.
- Re-read runtime assembly: 500 unique core + 100 unique NGN extension = 600 unique runtime IDs; the 364 authored rewrites remain replacements. No Booster namespace is assigned and Booster remains 0.
- Statically audited `qrn-0337`–`qrn-0356`: 20 revise; all 20 require qualified educator review; 0 clinically cleared. Endocrine/renal topics are unsupported by defining histories, assessments, diagnostics or treatment timelines; unrelated acute findings compete with the named topics; generic reassessment stems, four rotating option/rationale families and single-response-only format recur throughout.
- Representative issues: thyroid storm without thyrotoxic findings (`qrn-0337`); myxedema coma without hypothyroid context (`qrn-0338`); SIADH without sodium/osmolality evidence (`qrn-0341`); insulin-pump interruption assigned to a newborn (`qrn-0347`); hemodialysis hypotension without a dialysis session (`qrn-0352`); hyperkalemia with ECG evidence but no renal-failure context (`qrn-0356`).
- Cumulative third-tranche audit: 100/244; 144 remain; next ID `qrn-0357`. All 100 require revision/educator review; none passed clinical release.
- No item content, answer key, ID, learner history, pool membership or clinical review metadata changed. Static triage is not clinical validation.
- 3,600 Webmaster tracker remains absent; `QuestionGenerationTracker` remains the separate NGN 300-draft archive tracker.
- Latest full Actions evidence remains green on older commit `68930635d07f7fb39a9a12e6208a195cf9e74b94`; starting-head Vercel status was success; no fresh Actions run on the docs-only starting head.


## 2026-11-27 — third-tranche audit run 7

- Start-of-run branch head: `99278d262d650c8d227bb551851ae4411f762822`.
- Re-read runtime assembly: 500 core entries with a 500-unique-ID guard + 100 NGN entries = 600 assembled runtime IDs with a combined uniqueness guard. The 364 authored rewrite records remain replacements; Booster is 0 and its namespace is unassigned.
- Statically audited `qrn-0357`–`qrn-0376`: 20 revise; all 20 require qualified educator review; 0 clinically cleared. The items use one normalized generic reassessment prompt, four repeated option/rationale families, and single-response format only. Named topics lack defining histories, focused assessment, diagnostics or treatment context; unrelated acute abnormalities and unsupported patient contexts compete with the topic.
- Representative findings: post-TURP irrigation without a TURP/irrigation record and with hyperkalemic ECG changes (`qrn-0357`); urinary retention without voiding/bladder evidence and with coagulopathic bleeding (`qrn-0358`); renal calculi assigned to a newborn without stone evidence (`qrn-0361`); status epilepticus without seizure-duration/recovery criteria (`qrn-0369`); autonomic dysreflexia without spinal cord injury/trigger cues (`qrn-0370`); myasthenic crisis assigned to a newborn without maternal/neonatal neuromuscular context (`qrn-0375`).
- Cumulative third-tranche audit: 120/244; 124 remain; next ID `qrn-0377`. All 120 require revision/educator review; none passed clinical release.
- No question content, answer key, ID, learner history, pool membership or clinical review metadata changed. Static triage is not clinical validation.
- The 3,600-specific Webmaster tracker remains absent; `QuestionGenerationTracker` is the separate NGN 300-draft archive tracker.
- CI at start: Vercel success on the starting head; latest full Actions workflows green on older commit `68930635d07f7fb39a9a12e6208a195cf9e74b94`; no newer Actions run available. Docs-only update; no code/schema tests rerun.

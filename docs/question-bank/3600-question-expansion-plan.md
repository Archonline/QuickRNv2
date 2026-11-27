# QuickRN 3,600-Question NCLEX-RN Expansion

**Status:** Phase 1 — baseline reconciliation and expansion architecture; net-new authoring is gated pending item-level baseline audit  
**Target inventory:** 3,000 core items + 600 Booster items  
**Working branch:** feat/3600-question-bank-expansion

## Executive decision

Expand the existing QuickRN bank to 3,600 distinct, original NCLEX-RN learning items. Preserve usable existing items, rewrite weak/repetitive items, and add new items only after the baseline inventory has been reconciled. Do not inflate counts by counting a case study and its component questions twice, counting source JSON seeds as runtime items, or treating format conversions as new clinical content.

This is an independent learning product. Use only independently authored questions and materials; do not reproduce third-party proprietary content or branding.

## Verified repository baseline (main, 2026-11-23)

The current runtime bank is documented and guarded in source as:

| Runtime segment | Export | Count |
|---|---|---:|
| Core topic bank | questionBank500 | 500 |
| NGN format extension | questionBank100 | 100 |
| **Combined published bank** | **questionBank600** | **600** |

Sources: src/questionBank.ts, src/ngnQuestionBank.ts, and docs/question-bank/600-item-reconciliation.md.

Important quality qualification: the existing count is structurally enforced, but the repository's reconciliation explicitly identifies category/topic seed reuse in the core generator and cyclic seed reuse in the NGN extension. The current items carry not-clinically-verified review metadata. Therefore, 600 is the verified runtime inventory count, not a claim that 600 individually authored, clinically validated items already exist.

The two curated 100-item JSON files are generator inputs imported by the TypeScript bank modules. They must not be added to the runtime total a second time.

## Target composition

### Core bank — 3,000 items

| Segment | Target | Counting rule |
|---|---:|---|
| Traditional NCLEX-style items | 2,100 | One scored question = one item |
| Standalone NGN items | 300 | One scored interaction = one item |
| Unfolding NGN case-study items | 600 | 100 cases × 6 separately scored items |
| **Total** | **3,000** | Distinct stable item IDs |

### Booster — 600 additional items

A separate collection of 600 new item IDs and distinct clinical learning tasks. It must not overlap the core bank by ID, normalized stem, clinical scenario, answer key, or substantive learning objective. Target a balanced mix of traditional, standalone NGN, and case-study items after the core-bank audit identifies remaining coverage gaps.

### Inventory progression

The current 600-item bank is a baseline, not an automatic addition to the target. Each existing item must be classified as retain, revise, replace, or retire. The 3,000 core target is the final approved inventory after reconciliation, not 3,000 plus the current 600.

## Blueprint and content metadata

Every item must include, as applicable:

- Stable unique ID and collection (core or booster).
- Client Needs category and subcategory aligned to the applicable NCSBN RN Test Plan.
- Specialty, topic, and specific learning objective.
- Clinical Judgment Measurement Model function(s): recognize cues, analyze cues, prioritize hypotheses, generate solutions, take action, evaluate outcomes.
- Cognitive demand and calibrated difficulty (not arbitrary labels alone).
- Item format and renderer-compatible interaction schema.
- Patient setting, age/context when relevant, focused assessment data, and internally consistent vital signs/labs/medications.
- Correct response and scoring rule.
- Rationale for the correct response and meaningful explanations for distractors or incorrect response paths.
- Source/reference metadata, authoring provenance, review status, and content version.
- Case-study linkage and sequence position for unfolding cases.

Use the official test plan in force at release for category weighting. Do not hard-code old percentages or treat this blueprint's internal production mix as an exam delivery weighting.

## Required quality gates

An item is eligible for publication only when it passes all applicable gates:

1. **Identity and duplication:** unique ID; no exact or near-duplicate stem; no repeated clinical template disguised by changed names, ages, or numbers.
2. **Clinical coherence:** setting, history, symptoms, vital signs, labs, medication details, and timeline are mutually consistent.
3. **Answer integrity:** one defensible best answer unless the format intentionally supports multiple/selectable responses; key agrees with the rationale.
4. **Distractor quality:** plausible, clinically meaningful, and not accidentally correct under the stated facts.
5. **Blueprint alignment:** category, topic, objective, and clinical judgment skill match what the item actually assesses.
6. **NGN interaction integrity:** renderer schema, response shape, scoring, partial credit where applicable, and rationale mapping are tested per format.
7. **Case integrity:** six sequential items share a coherent evolving patient record; later findings and decisions depend on the timeline without revealing answers prematurely.
8. **References and review:** evidence source recorded; high-risk clinical content receives qualified clinical review before being represented as clinically validated.
9. **Runtime integrity:** published item loads in practice and exam modes, persists responses, and is scored consistently.
10. **Regression:** inventory, rendering, scoring, CAT selection, and exam-session tests pass.

Generated content must remain visibly marked as not clinically verified until the review process is complete. Build success and schema validation are not clinical validation.

## Expansion phases

### Phase 1 — baseline audit and content architecture

- Reconcile the 600 runtime items and stable IDs.
- Measure category, topic, format, case-study, difficulty, and review-status coverage.
- Detect duplicate IDs, repeated stems, shared scenario templates, and answer/rationale inconsistencies.
- Establish an item-level audit report and a versioned content schema.
- Preserve a record of every retained, revised, replaced, or retired item.

### Phase 2 — repair and expand core content

- Rewrite repetitive items as distinct patient situations and learning objectives.
- Fill blueprint gaps with original content.
- Build and validate unfolding cases as six-item sequences.
- Expand to the 3,000-item core target only as items pass the quality gates.

### Phase 3 — Booster

- Author 600 additional, non-overlapping items.
- Keep Booster inventory and completion metrics separate from core.
- Unlock Booster after 75% of the core bank is completed, without making Booster items appear in core completion denominators.

### Phase 4 — exam-engine integration and validation

- Ensure practice, CAT, and readiness exams select from eligible collections according to their own rules.
- Prevent accidental duplication within a session and manage item exposure.
- Test timers, navigation, answer persistence, submission, scoring, and analytics.
- Ensure readiness reporting uses completed assessments and does not treat question-bank volume as evidence of readiness.

## Reporting standard

Every progress report must state:

- Core published / target.
- Booster published / target.
- Unique runtime item IDs.
- Traditional, standalone NGN, and case-study item counts.
- Number of distinct unfolding cases.
- Retained, revised, replaced, retired, and pending-review counts.
- Duplicate/near-duplicate findings.
- Clinical review status and unresolved blockers.

Never describe generated, unreviewed items as clinically validated or imply endorsement by NCSBN.


## 2026-11-25 run checkpoint — baseline audit gate

The feature branch head is `74f1a1a3184d064abba94bdae851ed0912ef4d04` and is identical to `main`. PR #9 has already been merged (merge commit `7fcdee70467e2665cd6eb6b6ef826cd96e38158c`), so it is no longer an open draft and cannot receive further commits as an open PR.

The runtime inventory remains 600 unique IDs (500 core topic-bank + 100 NGN extension). The 364 authored rewrite records are replacements already included in the 500 core positions. They add zero net-new IDs. The current 600-item baseline is credited toward the 3,000 core target; Booster inventory is 0/600. No new question was authored or integrated in this run.

The 3,600-specific Webmaster tracker, `src/QuestionBankAutomationTracker.tsx`, was removed in commit `7c453b58b5dc9b0115afa71d3b29f793b2df541a`. The remaining `src/QuestionGenerationTracker.tsx` is scoped to the separate NGN 300-draft archive and must not be used as the 3,600 tracker. A durable interim ledger is maintained at `docs/question-bank/3600-expansion-ledger.json`.

A static item-level triage inspected the first 20 records in the 244-item third rewrite tranche: `qrn-0257`–`qrn-0276`. All 20 were flagged for substantive remediation due to topic/scenario mismatches, implausible patient demographics, unrelated physiologic findings, missing context, or generic non-discriminating stems/options. Representative examples include:
- `qrn-0258`: a 7-year-old child described as having umbilical cord prolapse, with an unrelated elevated INR and gross hematuria.
- `qrn-0259`: a 79-year-old client described as having severe preeclampsia, with hyponatremia and seizure findings but no pregnancy context.
- `qrn-0263`: a 3-day-old newborn assigned a postpartum-hemorrhage scenario with adult hemodynamic and bleeding findings.
- `qrn-0269`: a 7-year-old child described as having reduced fetal variability.
- `qrn-0271`: a 68-year-old client described as having an ectopic pregnancy without reproductive context.

These are static quality flags, not independent clinical validation. The 20 records remain unmodified and not clinically verified; no false review records were created. The next audit ID is `qrn-0277`. Do not add net-new core or Booster items until Phase 1 classifies the existing runtime inventory and resolves the 244-item rewrite tranche's quality defects. The next run should audit the next bounded group of 20 existing records.

Latest CI at `74f1a1a` passed the authoring audit, question-batch validation, unit tests, Chromium regression, production build, and secret scan. Passing automation does not establish clinical correctness.


## 2026-11-26 run 3 checkpoint — continued baseline triage

The latest inspected feature-branch head at the start of this run was `430e46292c2c5b58164ecd29e43d8a6e233c5e75`. Source-level runtime assembly still enforces 500 unique core IDs plus 100 NGN extension IDs, combined as 600 unique runtime IDs. The 364 rewrite records remain replacements within the core bank and contribute zero net-new inventory. Core target credit remains 600/3,000; Booster remains 0/600. No new questions were authored or integrated.

The next 20 items in `src/authoredCoreRewriteBatch3.ts`, `qrn-0277`–`qrn-0296`, were statically triaged. All 20 are classified `revise` and require qualified educator review before any clinical-release disposition. Findings include maternal/newborn topic-demographic/context contradictions, absent topic-defining assessment data, unrelated high-risk findings, repeated generic stem and rationale templates, four reused answer-option families, and CJMM/option-task mismatches. The per-item findings are recorded in `3600-expansion-ledger.json` and `runs/2026-11-26-run-03.md`.

Cumulative progress in the 244-item tranche: **40/244 triaged**, **40 require substantive revision/educator review**, **0 passed for clinical release**, and **204 remain**. The next audit ID is `qrn-0297`. No item was modified, retired, quarantined, or removed from learner selection; stable IDs and learner-history references remain unchanged. No clinical review or approval was fabricated.

The 3,600-specific Webmaster tracker remains absent. `src/QuestionGenerationTracker.tsx` still reads the separate `src/question-batches/ngn/manifest.json` NGN 300-draft archive and is not a 3,600 tracker. PR #9 remains merged/closed; follow-up draft PR #18 remains open. The latest pre-commit CI at `430e46292c2c5b58164ecd29e43d8a6e233c5e75` passed authoring audit, batch validation, unit tests, Chromium regression, production build, secret scan, and Vercel status. This run changed documentation only; no question content or schema changed.

No clinical approval, merge, or deployment was performed.


## 2026-11-26 Phase 1 progress — run 5

- Third rewrite tranche static triage: `qrn-0257`–`qrn-0336`, 80 of 244 items audited.
- All 80 have been classified for substantive revision and qualified educator review; no item is clinically cleared by this static audit.
- Next audit ID: `qrn-0337`; 164 items remain in this tranche.
- The current runtime inventory remains 600 unique IDs (500 core + 100 NGN). The 364 authored rewrites remain replacements within existing core positions.
- No net-new core or Booster items may be authored until the full Phase 1 reconciliation is complete. Booster namespace remains unassigned.
- Webmaster 3,600-specific UI tracker remains absent; maintain this ledger as the durable source of progress. The separate NGN 300-draft tracker must not be used to infer 3,600-bank progress.
- Run 5 findings and exact item-level dispositions are recorded in `docs/question-bank/runs/2026-11-26-run-05.md` and the ledger.


## 2026-11-26 run 6 checkpoint — third-tranche audit

The start-of-run feature branch head was `f964f5f0daf8cb6fd7c774daa1e5393148502db8`. Source assembly was re-read and confirms 500 unique core IDs plus 100 unique NGN extension IDs, combined into 600 unique runtime IDs. The 364 rewrite entries remain replacements within the 500 core positions. Core credit remains 600/3,000; Booster remains 0/600 and its namespace is unassigned. No new questions were authored or integrated.

The next 20 records in `src/authoredCoreRewriteBatch3.ts`, `qrn-0337`–`qrn-0356`, were statically triaged. All 20 are classified `revise` and require qualified educator review; 0 passed for clinical release. Findings include endocrine/renal topics without defining history, focused assessment or diagnostic data; patient-context mismatches; unrelated acute abnormalities creating competing priorities; and repeated generic stems, four reusable option/rationale families, and single-response-only format. Item-specific evidence is in `3600-expansion-ledger.json` and `runs/2026-11-26-run-06.md`.

Cumulative progress in the 244-item tranche: **100/244 triaged**, **100 require substantive revision/educator review**, **0 clinically cleared**, and **144 remain**. The next audit ID is `qrn-0357`. No item was modified, retired, quarantined or removed from learner selection; stable IDs and learner-history references remain unchanged. No clinical review or approval was fabricated.

The 3,600-specific Webmaster tracker remains absent; `src/QuestionGenerationTracker.tsx` is for the separate NGN 300-draft archive. The 3,600 ledger remains the durable tracker. Latest full Actions evidence remains successful on older head `68930635d07f7fb39a9a12e6208a195cf9e74b94`; starting-head Vercel status was success. No fresh Actions run was available for the docs-only starting head. Passing automation does not establish clinical correctness.


## 2026-11-27 run 7 checkpoint — third-tranche audit

The start-of-run feature branch head was `99278d262d650c8d227bb551851ae4411f762822`. Runtime assembly was re-read: 500 core entries are guarded for 500 unique IDs; 100 NGN extension entries are guarded at 100; the assembled `questionBank600` is guarded for 600 unique IDs and cross-bank normalized prompt/scenario duplicates. The 364 rewrite records remain stable-ID replacements within the core bank. Core credit remains 600/3,000; Booster remains 0/600 and its namespace is unassigned. No net-new questions were authored or integrated.

The next 20 records in `src/authoredCoreRewriteBatch3.ts`, `qrn-0357`–`qrn-0376`, were statically triaged. All 20 are classified `revise` and require qualified educator review; 0 passed for clinical release. They share one normalized generic reassessment prompt, four option families and four rationale families each reused five times, and single-response format only. Named topics lack defining history, focused assessment, diagnostics or treatment context; unrelated acute abnormalities and unsupported demographic contexts compete with the assigned topics. The correct-response index matches the option-rationale correct marker, but the available facts do not establish a defensible topic-specific key. CJMM labels rotate without distinct task alignment. Source metadata remains generated/not-clinically-verified/draft with empty references.

Cumulative progress in the 244-item tranche: **120/244 triaged**, **120 require substantive revision/educator review**, **0 clinically cleared**, and **124 remain**. The next audit ID is `qrn-0377`. No item was modified, retired, quarantined or removed from learner selection; stable IDs and learner-history references remain unchanged. No clinical review or approval was fabricated.

The 3,600-specific Webmaster tracker remains absent; `src/QuestionGenerationTracker.tsx` is for the separate NGN 300-draft archive. The durable 3,600 ledger remains the source of progress. CI at start showed Vercel success on the inspected head; latest full Actions checks were successful on older commit `68930635d07f7fb39a9a12e6208a195cf9e74b94`, with no newer Actions run available. This run changed documentation only; no code/schema test suite was rerun. Passing automation does not establish clinical correctness.

# QuickRN 3,600-Question NCLEX-RN Expansion

**Status:** Phase 1 — baseline reconciliation and expansion architecture  
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

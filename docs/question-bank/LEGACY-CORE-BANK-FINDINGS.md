# Legacy Core Bank: Source-Level Risk Findings

**Scope:** source inspection of `src/questionBank.ts` and `src/authoredCoreRewriteBatch.ts` on the question-authoring quality-gates branch. This is not a clinical validation report and does not certify individual questions.

## Confirmed findings

1. **Publication metadata is contradictory for generated core items.** The `make()` factory assigns `status: "published"` and `publicationStatus: "published"`, while the same records carry `reviewStatus: "generated"`, `reviewMetadata.status: "not-clinically-verified"`, and an empty references array. The 40 authored replacement items have been moved to development/draft, but the factory-level contradiction remains for the other generated items. Changing runtime availability requires an explicit migration/release decision.

2. **The first 40 authored replacement items contained repeated generic prompt wording.** Source inspection found seven repeated prompt strings across different clinical scenarios (for example, repeated variants of “What should the nurse do first?”). Those prompts have now been rewritten to ask a more scenario-specific clinical decision. The audit script now rejects duplicate normalized prompts within this authored replacement batch. This check reduces template repetition; it does not establish clinical validity.

3. **Six topic labels were reused across category profiles; category-specific variants are now implemented.** Source inspection found duplicate topic entries for Newborn thermoregulation, Pulmonary embolism, Meningitis, Pertussis, RSV, and Autism spectrum disorder. Added category-specific scenario, prompt, priority action, distractors, and rationale variants for the second category in each pair. The generator now resolves a category-plus-topic override before falling back to the shared topic profile. The 324-item subset audit separately identifies four of these cross-category topics that occur in the generated subset.
4. **Distractors are selected by cyclic rotation from topic profiles.** The generator selects three distractors using a modulo-based start position. This guarantees variation in selection order, not that all possible combinations are the closest clinically defensible alternatives for the particular stem. Each generated item still needs item-level adversarial review.

5. **Unfolding-case fallback behavior has been removed.** Previously, a missing case-specific screen could silently fall back to a generic question shared across unrelated emergencies. The generator now throws an error if a case-specific follow-up is missing. The six case studies must still be reviewed for clinical progression, evidence, and answer defensibility.

6. **Automated structural checks cannot establish clinical validity.** Four options, an in-range key, nonempty rationales, and unique IDs are necessary but do not prove a single defensible answer, accurate evidence, or appropriate clinical prioritization.

## Inventory clarification

The 500-item core source inventory consists of 324 topic-profile-generated items, 40 authored replacement drafts, 36 unfolding-case screens, and 100 curated traditional items. The separate NGN extension contains 100 items. Counts describe source composition, not clinical approval or release readiness.

## Recommended remediation order

1. Resolve the publication contradiction through an explicit release decision. Do not silently change runtime availability in a way that unexpectedly empties learner exams; define a reviewed/unreviewed state and make the UI distinguish it.
2. Remediate the 324 topic-profile-generated items using the findings in `GENERATED-CORE-324-AUDIT.md`: 315 items currently belong to repeated scenario groups, all 324 lack per-option rationales and item-level evidence metadata, and distractor/key defensibility remains unverified.
3. Review the 40 authored replacement drafts and 36 unfolding-case screens independently; the prompt uniqueness guard is only a structural check.
4. Verify each distractor against its specific stem: why a novice might choose it, what makes it unsafe/incomplete, and the precise cue that makes the keyed answer superior.
5. Add item-level review records and a reproducible audit report. Automated/model review should be labeled as screening; authorized clinical review remains a separate release gate.

## Release note

The quality-gate work improves future batch intake and prevents several structural and metadata defects. It does **not** rewrite or clinically approve the legacy 500-item core bank, nor does it establish that the 100-item NGN extension or the curated inventory has passed item-by-item clinical review.

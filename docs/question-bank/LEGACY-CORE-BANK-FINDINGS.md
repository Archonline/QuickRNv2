# Legacy Core Bank: Source-Level Risk Findings

**Scope:** source inspection of `src/questionBank.ts` and `src/authoredCoreRewriteBatch.ts` on the question-authoring quality-gates branch. This is not a clinical validation report and does not certify individual questions.

## Confirmed findings

1. **Publication metadata is contradictory for the generated core items.** The `make()` factory assigns `status: "published"` and `publicationStatus: "published"`, while the same records carry `reviewStatus: "generated"`, `reviewMetadata.status: "not-clinically-verified"`, and an empty references array. The authored replacement batch has already been moved to development/draft, but that does not resolve the factory-level contradiction for the remaining generated records.

2. **Topic-specific content is combined with rotating category-level prompt lenses.** The factory chooses a prompt from `clinicalCaseLenses` using the category and occurrence number whenever a topic profile does not provide its own prompt. This can make multiple topics share the same question task even when their clinical profiles differ. The presence of a topic-specific scenario does not by itself make the reasoning task topic-specific.

3. **Distractors are selected by cyclic rotation from a topic profile.** The factory selects three distractors using a modulo-based start position. This guarantees variation in selection order, not that all three distractors are the closest clinically defensible alternatives for the particular stem. That requires item-level adversarial review.

4. **Six unfolding cases use a shared generic follow-up set as a fallback.** The case construction selects `caseSpecificFollowups[c]?.[j] ?? followups[j]`. A missing case-specific screen silently falls back to a generic question that refers to a collection of unrelated emergencies. That is a design escape hatch and should be removed: every case stage must be explicitly authored for its own patient and timeline.

5. **Automated structural checks cannot establish clinical validity.** Four options, an in-range key, nonempty rationales, and unique IDs are necessary but do not prove a single defensible answer, accurate evidence, or appropriate clinical prioritization.

## Recommended remediation order

1. Resolve the publication contradiction through an explicit release decision. Do not silently change runtime availability in a way that unexpectedly empties learner exams; instead, define the approved legacy-review state and make the UI distinguish reviewed from unreviewed content.
2. Remove generic case-study fallback behavior. Fail loudly if any case stage lacks a case-specific authored screen.
3. Replace rotating category lenses with an item-level prompt authored for the clinical decision in that scenario.
4. Require each distractor to be documented against the specific stem: why a novice might choose it, what makes it unsafe/incomplete, and the precise cue that makes the keyed answer superior.
5. Add item-level review records and a reproducible audit report. Automated/model review should be labeled as a screening step; authorized clinical review remains a separate release gate.

## Release note

The quality-gate work in this branch improves future batch intake and prevents several metadata/structure defects. It does **not** rewrite or clinically approve the legacy 500-item core bank, nor does it establish that the 100 NGN extension or the curated inventory has passed item-by-item clinical review.

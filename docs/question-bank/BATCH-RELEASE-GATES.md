# QuickRN question batch intake

## Release contract

Core question batches are staged as `core-batch-NNN.json` and contain exactly 100 records in the canonical `Question` shape from `src/questions.ts`.

A batch is **not integrated** merely because its JSON or schema checks pass. Every item must be developed under [AUTHORING-QUALITY-STANDARD.md](./AUTHORING-QUALITY-STANDARD.md) and the batch must pass all five gates:

1. **Uniqueness and blueprint alignment:** stable IDs and normalized prompts are unique against the current curated inventories and every staged batch; scenario, clinical decision, and learning objective are not recycled under new wording.
2. **Answer-key and distractor integrity:** valid answer structure; exactly one defensible best answer for single-best-answer items; all distractors are clinically plausible and wrong for a clear case-specific reason; no answer cues.
3. **Rationale integrity:** a substantive rationale for the correct answer and a separate, case-specific explanation for every alternative or response component.
4. **Clinical evidence and review:** current authoritative source provenance is recorded; an authorized clinical reviewer verifies scenario, acuity, answer, distractors, and rationales. Automated checks and model-generated critiques never set this status.
5. **Rendering and interaction:** browser tests render each item type and verify selectable options, answer submission, scoring, and review display.

A batch is not considered passed when only its average quality is acceptable. Every included item must pass. Remove and replace rejected items rather than repeatedly patching fundamental defects.

## Required item-level authoring record

Before intake, each item must have a blueprint defining the client-needs area, topic, competency, cognitive demand, setting/acuity, key evidence, targeted novice error, format, and source(s).

Each item must then have:
- a clinical key explanation showing why the answer is best at the stated point in the timeline;
- a separate rationale for every option or response component;
- an independent adversarial challenge that attempts to defend distractors and identify ambiguity/cueing;
- a disposition of `ACCEPT FOR CLINICAL REVIEW`, `ONE TARGETED REVISION`, or `REJECT / RE-AUTHOR`.

A model critique is a challenge aid, not a clinical sign-off. A revision must be rechecked; a fundamentally weak item must be rejected and replaced with a new ID.

## Draft metadata

Every new item must remain `status: "development"`, `reviewStatus: "generated"`, `reviewMetadata.status: "not-clinically-verified"`, and `reviewMetadata.publicationStatus: "draft"` until clinical approval and rendering tests are complete.

## Batch validation

Run `npm run validate:question-batches`. This checks staged 100-item core batches, duplicate IDs/prompts against the current curated JSON inventories and staged batches, option structure, answer-key consistency, rationale completeness, and draft/review metadata.

These automated checks do **not** establish semantic uniqueness, clinical correctness, distractor quality, or rationale validity. Heuristics may flag suspicious patterns for review but must not be represented as clinical certification. A successful automated check is not clinical approval.

Do not import a batch into `questionBank500` or the combined runtime bank until all five gates are recorded as passed. Report accepted, revised, rejected, and pending counts accurately; do not claim a 100-item batch is complete if fewer than 100 items pass.

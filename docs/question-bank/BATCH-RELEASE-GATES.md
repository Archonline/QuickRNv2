# QuickRN question batch intake

## Release contract

Core question batches are staged as `core-batch-NNN.json` and contain exactly 100 records in the canonical `Question` shape from `src/questions.ts`.

A batch is **not integrated** merely because its JSON or schema checks pass. It must pass all five gates:

1. Duplicate detection: stable IDs and normalized prompts are unique against the current curated inventories and every staged batch.
2. Answer-key validation: integer answer index, four distinct options, and matching `interaction.correctResponse`.
3. Rationale validation: one substantive rationale for the correct answer and one for each of the four options.
4. Clinical review: an authorized clinical reviewer must verify the scenario, acuity, answer, distractors, and rationales. Automated checks never set this status.
5. Rendering: browser tests must render each item type and verify selectable options, answer submission, and review display.

## Draft metadata

Every new item must remain `status: "development"`, `reviewStatus: "generated"`, `reviewMetadata.status: "not-clinically-verified"`, and `reviewMetadata.publicationStatus: "draft"` until clinical approval and rendering tests are complete.

## Batch validation

Run `npm run validate:question-batches`. This checks staged 100-item core batches, duplicate IDs/prompts against the current curated JSON inventories and staged batches, option structure, answer-key consistency, rationale completeness, and draft/review metadata.

A successful automated check is not clinical approval. Do not import a batch into `questionBank500` or the combined runtime bank until all five gates are recorded as passed.

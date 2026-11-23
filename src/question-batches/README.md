# Automatic question-draft staging

New authored core batches are staged into Webmaster > Uncommitted Questions Review.

## Batch handoff
1. The question authoring process writes core-batch-NNN.json into src/question-batches/.
2. Each file has exactly 100 QuickRN Question objects in a top-level questions array. batch_metadata must contain a matching batch_id, bank: core, and pending clinical review.
3. npm run validate:question-batches checks IDs, duplicates, answer keys, rationales, distractors, scenarios, and draft metadata.
4. Committing the batch to main triggers GitHub Actions to validate and stage each question into Firestore questionDrafts.
5. Drafts stay separate from the live bank until an administrator verifies clinical accuracy and explicitly publishes them.

## One-time GitHub configuration
- Add Actions secret FIREBASE_SERVICE_ACCOUNT_JSON with the complete JSON key for a dedicated service account with Firestore write access.
- Add Actions variable FIREBASE_PROJECT_ID with the Firebase project ID.
- Never commit service-account credentials or expose them as Vite/browser variables.

## Retry behavior
Question ID is the Firestore document ID. Re-running the same batch is idempotent; an ID collision with another batch stops the workflow rather than overwriting data. Writes remain below Firestore's 500-write batch limit.

This pipeline stages generated content; it does not generate the questions itself or clinically approve them.

# Automatic question-draft staging

New authored core batches are staged into Webmaster > Uncommitted Questions Review.

## Batch handoff
1. The authoring process writes `core-batch-NNN.json` into `src/question-batches/`.
2. Each file contains exactly 100 QuickRN Question objects in a top-level `questions` array. `batch_metadata` must contain a matching `batch_id`, `bank: "core"`, and pending clinical review.
3. Every question must include an `authoring` record:
   - `blueprint`: `clientNeedsArea`, `competency`, `cognitiveDemand`, `setting`, `acuity`, `keyEvidence`, and `targetedNoviceError`.
   - `clinicalEvidence`: at least one source with `organization`, `title`, `publishedOrUpdated`, `locator`, and `claimSupported`. Do not invent sources, dates, URLs, or recommendations.
   - `adversarialReview`: `disposition: "pass_for_clinical_review"`, `closestCompetingOption`, `ambiguityAssessment`, and `cueingAssessment`. This records a challenge pass only; it is not clinical approval.
4. `npm run validate:question-batches` checks IDs, duplicate prompts, answer keys, option-level rationales, required authoring evidence, draft metadata, and flags highly similar scenarios for human adjudication. Similarity warnings are not proof of duplication; absence of a warning is not proof of originality.
5. Committing a batch to main triggers GitHub Actions to validate and stage each question into Firestore `questionDrafts`.
6. Drafts stay separate from the live bank until an authorized clinical reviewer verifies accuracy and an administrator explicitly publishes them.

## What the gate does not certify
The validator checks presence and structure of the authoring record. It does not verify that a cited source exists, that the source supports the claim, that the clinical answer is correct, or that distractors are defensible. A human reviewer must inspect the source and the entire item. A model-generated adversarial review is a challenge aid, not a clinical sign-off.

## One-time GitHub configuration
- Add Actions secret `FIREBASE_SERVICE_ACCOUNT_JSON` with the complete JSON key for a dedicated service account with Firestore write access.
- Add Actions variable `FIREBASE_PROJECT_ID` with the Firebase project ID.
- Never commit service-account credentials or expose them as Vite/browser variables.

## Retry behavior
Question ID is the Firestore document ID. Re-running the same batch is idempotent; an ID collision with another batch stops the workflow rather than overwriting data. Writes remain below Firestore's 500-write batch limit.

This pipeline stages generated content; it does not generate questions itself or clinically approve them.

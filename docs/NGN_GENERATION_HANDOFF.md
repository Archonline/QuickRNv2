# QuickRNv2 NGN 300-Question Generation Handoff

Last updated: 2026-11-25 (Asia/Manila)

## Goal
Create 300 new original NGN NCLEX-RN questions for QuickRNv2. Work in batches of 25 (12 planned batches). Do not publish drafts automatically.

## Current generation state
- ChatGPT-authored draft items recorded in project conversation: 30.
- IDs already used: QR-NGN-001 through QR-NGN-030.
- QR-NGN-031 is only the expected next candidate ID; it is not verified as assignable while the ID registry remains unreconciled.
- Verified archived FINALIZED-DRAFT count: 0.
- Remaining to target based on the GitHub source-of-truth manifest: 300.
- Batch 001 was only 5 items; Batch 002 was 25 items. Do not misrepresent the first batch as a complete 25-item batch.
- These 30 are drafts, not independently clinically approved.
- They are not currently archived in the GitHub NGN project folder and are not counted. Their full question content was not recoverable during the 2026-11-25 run. Keep IDs 001-030 reserved; do not count them or assign new IDs until the registry is reconciled.

## Integrated per-question production process (current standard)
Do not generate a large unchecked batch and then repeat a separate batch-wide audit/fix cycle. Each item must complete this loop during generation before the next item is started:
1. Construct the clinical scenario and item directly to QuickRN schema and the intended NGN format.
2. Immediately audit clinical plausibility/safety, NCLEX-RN alignment, answer-key defensibility, distractors, scoring, rationale, schema compatibility, and duplication against available prior items/archive.
3. Fix every detected defect immediately in the same working pass.
4. Re-audit the correction and perform a final whole-item consistency check.
5. Mark FINALIZED-DRAFT only if all checks pass. Otherwise mark BLOCKED/REJECTED and explain the unresolved issue.

This is one integrated production pass per item, not a deferred second batch. Keep a concise audit/fix note per item. Do not count blocked/rejected items toward the 300 finalized-draft target. This automated/content pass is not independent clinical approval; qualified independent clinical review remains mandatory before approval/publication.

## Planned format distribution
- 120 unfolding case-study items
- 45 bow-tie
- 35 matrix/grid
- 30 trend interpretation
- 25 highlight text
- 25 dropdown cloze/rationale
- 20 extended multiple response / Select N

The prior 30 drafts are not a balanced realization of this distribution. Track actual counts by format and prioritize deficits in subsequent batches. A genuine unfolding case study should be a linked scenario with sequential items, not a standalone item merely labelled case study.

## Domain coverage
Rotate med-surg, cardiovascular, respiratory, neurologic, endocrine, renal, maternal-newborn, pediatrics, psychiatric nursing, pharmacology, infection prevention, prioritization, and delegation. Avoid near-duplicate scenarios and answer patterns.

## Automation facts
- Saved ChatGPT automation title: Generate QuickRN NGN Batch.
- Automation ID: 6b059c9960a88191bd6bb5d48e8a6ed0.
- Current schedule: daily, starting 2026-11-25 at approximately 08:00 Asia/Manila.
- The ChatGPT automation scheduler supports daily/weekly/monthly/one-time schedules, not hourly recurrence.
- Do not claim hourly scheduling has been configured.
- The 2026-11-25 run was blocked before generation and the automation was disabled pending reconciliation.
- Do not assume a manual run or daily schedule can bypass the unresolved ID/content/schema gates.
- If previous batch/archive context is missing, do not guess IDs or claim duplicate checking.

## Webmaster tracker and archive (verified 2026-11-25)
- Component: src/QuestionGenerationTracker.tsx
- Entry point: Webmaster tools > Question Bank > NGN Generation Tracker
- Current source of truth: committed GitHub files and `src/question-batches/ngn/manifest.json`.
- The current tracker imports the GitHub manifest and explicitly does not read or write Firestore. Earlier notes about Firestore-backed tracker counts are stale and must not be relied upon.
- The current `src/question-batches/ngn/` directory contains only `manifest.json`; no `ngn-batch-NNN.json` files were present.
- The manifest reports `questions: []`, `idRegistryStatus: unreconciled`, `nextQuestionId: null`, and 30 legacy candidates (QR-NGN-001 through QR-NGN-030) with status `reported-but-not-archived` and IDs reserved pending recovery/reconciliation.
- A repository code search for `QR-NGN-` returned no matching archived question records.
- The previous 30 question contents could not be recovered from the accessible prior-conversation context during the 2026-11-25 run. Cross-batch clinical-scenario/stem/learning-objective duplicate checking against those 30 items is therefore unavailable.
- Schema-contract discrepancy: `docs/question-bank/quickrn-question-schema.json` specifies IDs `QRN-000001` and batch IDs `QRN-BATCH-NNN`, while the NGN archive README/validator requires `QR-NGN-NNN`, `ngn-batch-NNN`, `batchId`, `status`, `itemType`, `topic`, `prompt`, and `rationale`. A project-specific canonical NGN archive schema/mapping must be established before claiming schema compatibility.
- The 2026-11-25 run generated no questions, assigned no IDs, and made no batch/manifest writes.
- Reinitialize tracker controls, if present in older UI code, are not a substitute for archive reconciliation.

## 2026-11-25 run checkpoint and resume gate
- Today's finalized-draft output: 0.
- Today's blocked/rejected question records: 0 (generation did not start; this is a project-level blocker, not 25 blocked items).
- Verified cumulative FINALIZED-DRAFT count in the GitHub manifest: 0/300; remaining: 300.
- Actual archived format counts: 0 for all seven project target formats. Deficits remain: case study 120, bow-tie 45, matrix/grid 35, trend 30, highlight text 25, dropdown cloze/rationale 25, extended multiple response/Select N 20.
- Completed internal sub-batches: 0 of 12. Work stopped before Batch 003 because the prior 30 item contents/registry and the project-specific schema contract could not be reconciled.
- No clinical content, GitHub batch file, manifest entry, Firestore record, or live-bank item was created or changed in this run.
- Resume only after the prior 30 item contents are recovered and reconciled, or an authorized decision explicitly accepts reserving 001-030 while proceeding from 031 with cross-batch duplicate checking unavailable; also resolve the ID/schema mapping. Until then, do not assign IDs or generate archive-bound items.

## Resume instruction for a new ChatGPT window
Read this handoff and inspect the current GitHub manifest and archive first. Do not assume QR-NGN-031 is assignable while `idRegistryStatus` is `unreconciled` and `nextQuestionId` is null. Resolve the 30 reserved historical candidates and the schema-contract discrepancy before generation. Once unblocked, generate up to 25 items per batch using the integrated per-question loop: construct -> immediate audit -> fix -> re-audit -> FINALIZED-DRAFT or BLOCKED. Keep the items in draft status, report actual counts, and never claim independent clinical approval or publication.

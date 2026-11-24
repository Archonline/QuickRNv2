# QuickRNv2 NGN 300-Question Generation Handoff

Last updated: 2026-11-24 (Asia/Manila)

## Goal
Create 300 new original NGN NCLEX-RN questions for QuickRNv2. Work in batches of 25 (12 planned batches). Do not publish drafts automatically.

## Current generation state
- ChatGPT-authored draft items recorded in project conversation: 30.
- IDs already used: QR-NGN-001 through QR-NGN-030.
- Next available ID: QR-NGN-031.
- Remaining to target: 270.
- Batch 001 was only 5 items; Batch 002 was 25 items. Do not misrepresent the first batch as a complete 25-item batch.
- These 30 are drafts, not independently clinically approved.
- They are not currently archived in the GitHub NGN project folder and therefore are not counted by the Webmaster Generation Tracker. Recover and reconcile them into the GitHub manifest before assigning further IDs.

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
- A manual run can be requested with the automation's Run now action; this runs one batch, not a self-chaining 12-batch loop.
- If previous batch/archive context is missing, do not guess IDs or claim duplicate checking.

## Webmaster tracker
- Component: src/QuestionGenerationTracker.tsx
- Entry point: Webmaster tools > Question Bank > NGN Generation Tracker
- Project tag: quickrn-ngn-300
- Firestore collections: questionDrafts, questions, questionGenerationControl/state
- Draft import through Webmaster tools tags incoming questions with generationProject=quickrn-ngn-300 and a batchId.
- Only tagged records are included in the 300-item tracker.
- Reinitialize tracker button records a restart request only. It does NOT invoke or restart the separate ChatGPT automation and does not delete questions.
- Firestore rules restrict control records to users with admin:true.

## Resume instruction for a new ChatGPT window
Continue from QR-NGN-031. Read this handoff first, inspect current tracker/archive records if available, reconcile counts and IDs, then generate exactly one next batch of up to 25 items. Use the integrated per-question loop: generate -> immediate audit -> fix -> re-audit -> FINALIZED-DRAFT or BLOCKED. Do not defer a batch-wide audit/fix cycle. Maintain actual format counts, clearly mark unresolved clinical checks, and do not claim publication or independent clinical approval.

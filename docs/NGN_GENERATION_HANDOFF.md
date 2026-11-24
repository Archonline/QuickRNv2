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
- They are not yet counted by the Webmaster Generation Tracker until imported into Firestore with the project tag.

## Required five-stage quality process
1. Clinical construction: realistic patient context, relevant findings, defensible nursing problem.
2. NCLEX alignment: client-needs relevance and clinical-judgment demand.
3. Answer validation: independently check answer key and scoring logic.
4. Rationale audit: explain the correct response and why alternatives are wrong.
5. Compatibility and duplication audit: validate QuickRN question schema, scoring, unique IDs, and duplicates against available archives.

Failing an audit means revise or reject; never silently pass. Clearly distinguish structural screening from clinical validation. Qualified independent clinical review is required before approval/publication.

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
Continue from QR-NGN-031. Read this handoff first, inspect current tracker/archive records if available, reconcile counts and IDs, then generate exactly one next batch of up to 25 drafts. Maintain actual format counts, run the five-stage audit, clearly mark unresolved clinical checks, and do not claim publication or approval.

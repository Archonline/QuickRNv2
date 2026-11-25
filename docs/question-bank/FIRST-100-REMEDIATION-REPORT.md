# First 100 Question Remediation Report

**Date:** 2026-11-25  
**Scope:** First 100 items in the assembled `questionBank600` runtime order  
**Source of truth:** `src/questionBank.ts` and `src/curatedQuestionBatch2_100.json`

## Scope reconciliation

The first 100 runtime items are not IDs 001–100. They are:
- Runtime positions 1–36: six unfolding case studies with six screens each (`qrn-case-1-1` through `qrn-case-6-6`).
- Runtime positions 37–100: curated traditional items `QRN-000447` through `QRN-000510` (64 items).

Existing IDs and runtime order are preserved.

## Remediation performed

### Case-study screens (36)
- Rewrote all 36 screen stems/options/rationales to use case-specific clinical decisions and plausible competing actions.
- Balanced the keyed answer positions: 9 each in A, B, C, and D; removed the all-A answer cue.
- Updated the stroke blood-pressure item to specify the IV-thrombolysis threshold rather than ambiguously referring to all reperfusion treatments.
- Updated the DKA case to use the current potassium threshold and ketone/pH-based resolution criteria.
- Added option-level rationales to all 36 screens and marked them editorially reviewed, while keeping independent clinical verification pending. Clinical-source pointers are recorded for stroke, intra-amniotic infection, DKA, compartment syndrome, pulmonary embolism, and COPD.

### Curated questions (64)
- Rebalanced all 48 single-best-answer items to 12 correct answers in each of A, B, C, and D.
- Reordered multiple-response options with answer keys and option rationales remapped together.
- Replaced generic summary rationales with item-specific explanations derived from the keyed option rationales.
- Corrected `QRN-000473` so its key includes all four responses supported by the option-level rationales; the option labels were then remapped with the answer-position balancing.
- Updated `QRN-000489` to the 2024 DKA potassium threshold of 3.5 mmol/L and added the 2024 consensus reference.
- Marked the 64 items `editorially_reviewed`; this is not clinical verification. Their existing runtime publication state was preserved, and no clinical approval was recorded.

## Validation gates

- IDs and question order preserved.
- First 36 case screens: answer-position distribution 9/9/9/9.
- Curated single-answer items: answer-position distribution 12/12/12/12.
- Multiple-response keys and option-rationale labels remapped with the reordered options.
- `QRN-000473` answer key reconciled against its four supported responses.
- Automated schema, build, and test workflows must pass before this remediation is considered technically complete.

## Clinical review limitation

This is an editorial and content-remediation pass, not independent clinical approval. All 100 items remain unverified by a qualified independent clinical reviewer. The new review metadata must not be interpreted as clinical sign-off.

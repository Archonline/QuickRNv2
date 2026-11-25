# QuickRNv2 Repository Question Inventory

**Inventory date:** 2026-11-25  
**Branch inspected:** `main`  
**Scope:** source files assembled into the runtime question bank, source-level replacement batches, the separate development examples, and the standalone NGN 300-project archive.

## Executive count

| Inventory | Count | Counting rule |
|---|---:|---|
| Traditional/core runtime bank | 500 | `questionBank500` in `src/questionBank.ts` |
| Standalone NGN runtime extension | 100 | `questionBank100` in `src/ngnQuestionBank.ts` |
| **Assembled runtime bank** | **600** | `questionBank600 = [...questionBank500V2, ...questionBank100]` |
| Separate development/example questions | 4 | `questions` in `src/questions.ts`; not included in `questionBank600` |
| **Distinct repository question records including examples** | **604** | 600 runtime bank records + 4 separate examples; not all are production-bank items |

The two curated JSON files are source inputs to the 500/100 banks. They must not be added again to the runtime total.

## Core-bank composition

The 500-item core bank is composed as follows:

| Core content | Count | Notes |
|---|---:|---|
| Unfolding case-study screens | 36 | Six screens for each of six cases; inserted into the first 36 core positions |
| Curated traditional items | 100 | Loaded from `src/curatedQuestionBatch2_100.json` |
| Rewritten core items | 364 | Authored replacement batches integrated by stable IDs |
| **Total** | **500** | These are mutually exclusive positions in the assembled core bank |

### Recent authored replacement batches

| Source file | Entries | ID range |
|---|---:|---|
| `src/authoredCoreRewriteBatch.ts` | 100 | qrn-0137 onward |
| `src/authoredCoreRewriteBatch2.ts` | 20 | qrn-0237–qrn-0256 |
| `src/authoredCoreRewriteBatch3.ts` | 244 | qrn-0257–qrn-0500 |
| **Total replacement entries** | **364** | Replacements, not 364 additional bank positions |

All 364 replacement entries are integrated into the 500-item core bank by stable ID. They replace prior core items; they do not increase the core-bank total from 500 to 864.

## Review and publication status

Do not equate runtime `status: published` with clinical approval.

- The 364 replacement items remain development drafts with `publicationStatus: draft`; the core assembly maps them to runtime `status: published` and sets `auditRequired: true`. The first 64 replacements (`qrn-0137`–`qrn-0200`) now carry `reviewStatus: editorially-reviewed` and `reviewMetadata.status: editorially-reviewed`; the remaining 300 retain `generated` / `not-clinically-verified`. Editorial review is not clinical verification, and learner-accessibility/runtime publication is not evidence of clinical approval.
- All 100 curated traditional items (`QRN-000447`–`QRN-000546`) now carry `review_metadata.status: editorially_reviewed`. The first 64 were reviewed during the first-100 remediation; the remaining 36 were reviewed and corrected during the second-100 remediation. Editorial review is not clinical verification. All 100 remain runtime-published.
- The 100 NGN extension items are mapped to runtime `status: published`, while their generated records carry `reviewStatus: generated` and `reviewMetadata.status: not-clinically-verified`.
- The 36 unfolding case-study screens now carry `reviewStatus: editorially-reviewed` and item-level option rationales, with source pointers for the relevant clinical decisions. They remain runtime-published and are not clinically approved.

### Conservative review tally

| Review classification | Count |
|---|---:|
| Explicitly marked not clinically verified (364 rewrites + 100 NGN extension + 36 curated items) | 500 |
| Editorially reviewed but not clinically verified (36 case screens + first 64 curated items) | 100 |
| Missing item-level review metadata | 0 |
| Confirmed clinically verified in inspected source | 0 |
| **Total runtime bank** | **600** |

The 0 confirmed count means the inspected repository source does not substantiate clinical verification; it is not a claim that no human has ever reviewed any item outside the repository. A qualified reviewer must record approval in item-level metadata before these items are represented as clinically approved.

## New NGN 300-project count

The separate project archive is `src/question-batches/ngn/manifest.json`.

| NGN project measure | Count |
|---|---:|
| Question records in manifest | 0 |
| Batch JSON files currently archived | 0 |
| FINALIZED-DRAFT records | 0 |
| BLOCKED records | 0 |
| REJECTED records | 0 |
| Historical QR-NGN candidates reported in previous conversations but not archived | 30 |
| New QR-NGN items verified in the repository archive | 0 |

The 30 historical candidates (QR-NGN-001–QR-NGN-030) are not present as recoverable question records in the current GitHub NGN archive. They are not counted as available repository questions and must not be assumed to exist solely from prior conversation summaries.

## Counting rules

1. Count the exported runtime arrays, not every source file independently.
2. Count the 364 authored rewrite records as integrated replacements within the 500 core items, not additional items.
3. Count the 100 NGN extension items once, as part of the 600 runtime bank.
4. Keep the four `dev-001`–`dev-004` examples separate from the runtime bank.
5. Do not count prompts, audit reports, handoff notes, test fixtures, or unarchived historical claims as question records.
6. Report runtime publication state separately from clinical verification state.

## Next recommended work

The next item-level release audit should cover runtime positions 201–300 (stable core IDs `qrn-0201`–`qrn-0300`). Continue to distinguish editorial review from independent clinical verification and keep the NGN 300-project manifest as a separate count.

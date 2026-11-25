# Question bank automation operations

## Target and verified baseline

- Target core inventory: 3,000 distinct question IDs.
- Target Booster inventory: 600 additional, non-overlapping question IDs.
- Total target: 3,600 unique runtime question IDs.
- Verified runtime baseline on 2026-11-25: 600 unique runtime items (500 core + 100 NGN extension).
- Remaining net-new inventory at baseline: 2,400 core + 600 Booster = 3,000 items.
- Forty authored replacement records (qrn-0137 through qrn-0176) replace existing generated records. They improve content quality but do not increase the inventory count.

The dedicated 3,600-bank Webmaster tracker is not present in the current source. `src/QuestionBankAutomationTracker.tsx` was removed in commit `7c453b58b5dc9b0115afa71d3b29f793b2df541a` on 2026-11-23. The current `src/QuestionGenerationTracker.tsx` tracks a separate NGN 300-draft archive only; it is not the 3,600 tracker. Until a dedicated UI tracker is restored, `docs/question-bank/3600-expansion-ledger.json` is the durable automation ledger. Always count unique IDs in the assembled runtime bank; replacements do not increase inventory.

## Unattended authoring cycle

A recurring ChatGPT task named **QuickRN Bank Expansion** was configured daily at approximately 08:00 Asia/Manila, starting November 24, 2026. It is currently in the Phase 1 baseline-audit gate; do not author net-new questions until the existing 600-item runtime baseline is reconciled. It is instructed to:

1. Inspect the current repository branch, inventory, tracker, plan, and latest CI state.
2. Author up to 20 distinct original items per run, following the topic blueprint and supported NCLEX item schema.
3. Preserve IDs and learner history for replacements; allocate stable new IDs only to net-new questions.
4. Integrate each batch and update the runtime inventory and tracker.
5. Run the authoring audit, tests, and production build; repair technical failures before continuing.
6. Keep the existing draft pull request and progress documentation current.
7. Mark generated items as not-clinically-verified and never fabricate review evidence.

The expected production pace is approximately 140 net-new items per week if every daily 20-item batch is accepted. The tracker uses this as a planning assumption, not a delivery guarantee.

## Release and safety gates

- Automated schema, identity, duplicate, scoring, and rendering checks can reject malformed or repetitive batches.
- CI passing does not establish clinical correctness.
- Generated items must retain not-clinically-verified metadata until a qualified reviewer records actual clinical verification and references.
- The automation must not merge or deploy unreviewed clinical content.
- It must notify the project owner if it encounters missing access, a credential requirement, or a clinical decision it cannot safely resolve.

## Current limitations

The tracker reflects the runtime inventory bundled in the application build; it is not a live GitHub Actions feed. The daily authoring task runs independently in ChatGPT and uses the connected GitHub integration. The project still needs deeper semantic duplicate detection and comprehensive NGN scoring/rendering audits as the bank grows.


## 2026-11-25 execution checkpoint

- Branch head: `74f1a1a3184d064abba94bdae851ed0912ef4d04`; the feature branch and `main` currently point to the same commit.
- Runtime inventory remains 600 unique IDs: 500 core topic-bank items plus 100 NGN extension items. The 364 authored core rewrites are replacements within the 500-item segment, not net-new inventory. The 600-item baseline is credited toward the 3,000 core target; Booster runtime inventory is 0/600.
- The 3600 expansion plan is still in Phase 1. The repository inventory records 564 items explicitly marked not clinically verified/draft and 36 case-study screens without item-level review metadata; the inspected source substantiates 0 clinically verified items.
- Static triage inspected `qrn-0257`–`qrn-0276` in `src/authoredCoreRewriteBatch3.ts`. All 20 need substantive remediation because the scenario, patient context, findings, or question objective are mismatched or too generic to support a defensible NCLEX decision. No content was changed, no clinical review was recorded, and no runtime ID/count changed. The next audit ID is `qrn-0277`.
- The 3,600-specific Webmaster tracker component was removed; the current NGN generation tracker is for a separate 300-item archive. Do not treat its empty manifest as the 3,600 inventory.
- PR #9 is closed and merged (merge commit `7fcdee70467e2665cd6eb6b6ef826cd96e38158c`); it cannot be updated as a draft. Use a follow-up draft PR for subsequent work.
- Latest CI at branch head `74f1a1a` passed: the authoring audit, question-batch validation, unit tests, Chromium regression, production build, and secret scan. See [QuickRN checks](https://github.com/Archonline/QuickRNv2/actions/runs/45518568083), [Production Build and Browser Regression](https://github.com/Archonline/QuickRNv2/actions/runs/45518568005), and [Secret scan](https://github.com/Archonline/QuickRNv2/actions/runs/45518568048).

The next run must continue the existing-item baseline audit from `qrn-0277`, not assign `qrn-0501` or create Booster IDs until a canonical ID registry and baseline reconciliation are complete. This checkpoint is an automation triage record, not clinical approval.

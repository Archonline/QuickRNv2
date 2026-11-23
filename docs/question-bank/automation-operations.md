# Question bank automation operations

## Target and verified baseline

- Target core inventory: 3,000 distinct question IDs.
- Target Booster inventory: 600 additional, non-overlapping question IDs.
- Total target: 3,600 unique runtime question IDs.
- Current runtime baseline at tracker implementation: 600 items (500 core + 100 NGN extension).
- Remaining net-new inventory at baseline: 2,400 core + 600 Booster = 3,000 items.
- Forty authored replacement records (qrn-0137 through qrn-0176) replace existing generated records. They improve content quality but do not increase the inventory count.

The Webmaster tracker deduplicates runtime items by question ID. It counts replacements as part of the existing inventory and reports clinical verification separately.

## Unattended authoring cycle

A recurring ChatGPT task named **QuickRN Bank Expansion** is scheduled daily at 08:00 Asia/Manila, starting November 24, 2026. It is instructed to:

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

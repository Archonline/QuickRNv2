# GitHub-backed question archive

GitHub is the source of truth for generated question batches. No Firestore collection, service account, database import, or cloud write is used by this workflow.

## NGN 300-item project
- NGN batches live in this directory as `ngn-batch-NNN.json`.
- Each batch contains a top-level `questions` array of up to 25 items.
- Each question has a unique `QR-NGN-NNN` ID, `batchId`, `status` (FINALIZED-DRAFT, BLOCKED, or REJECTED), `itemType`, `topic`, and full QuickRN question content.
- Update `manifest.json` whenever a batch is committed. The Webmaster NGN Generation Tracker reads this manifest at build time.
- Only FINALIZED-DRAFT records count toward the 300 target. Blocked and rejected records remain archived but do not count.
- The manifest's ID registry must be reconciled before new IDs are assigned. Reported legacy IDs are reserved, not assumed to exist.

## Existing core-bank validation
The existing `core-batch-NNN.json` validator remains available for its 100-item core-bank format. GitHub Actions validates files; it does not upload or stage them to Firestore.

## Review boundary
GitHub archival and structural validation do not constitute independent clinical approval. All items remain drafts until qualified clinical review and a separate publication process.

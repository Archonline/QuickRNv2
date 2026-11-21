# NGN format extension: 600-item bank

The application now has a versioned question schema and a 100-item NGN-format extension alongside the original 500-item bank.

## Supported item types

| Item type | Learner interaction |
|---|---|
| Single response | Select one answer |
| Multiple response | Select all applicable answers |
| Extended multiple response | Multi-select with an expanded response set |
| Drop-down cloze | Complete a statement with a selection |
| Drop-down table | Choose a response in each table row |
| Highlight text | Select relevant clinical-cue text segments |
| Highlight table | Mark relevant rows in a clinical-cue table |
| Matrix / grid | Classify each row using a column selection |
| Ordered response | Reorder steps using move controls |
| Bow-tie | Select a condition, actions and monitoring parameters |
| Trend | Review serial findings and answer a linked question |
| Extended drag-and-drop | Reorder steps with drag-and-drop or save controls |
| Graphics-based | Select labeled regions in an SVG clinical schematic |

The timed exam deliberately includes 72 legacy items and 13 extension items so a single exam session demonstrates every format. The full 600-item bank remains available to the app.

## Schema migration

The first 500 items are adapted at runtime with:
- `itemType`
- `interaction` (instructions, choices, answer key, and format-specific data)
- `contentVersion: 2`
- `reviewStatus: generated`

New items additionally carry a case-study identifier and a clinical-judgment step where applicable. The admin publisher writes the expanded fields to Firestore in batches of 450 documents to stay below Firestore's 500-write batch limit.

## Extension composition and quality status

The extension contains exactly 100 records distributed across all 13 item types (8 records for each of the first 9 types and 7 for each of the final 4 types). The current draft uses 20 underlying patient-record scenarios with five prompt variations per record. It is therefore a format-rendering and schema-completeness milestone, not 100 independently authored clinical vignettes. Some response patterns are intentionally generic scaffolds (notably matrix, bow-tie, trend and graphic interactions) and require item-level editorial and clinical review before the extension should be treated as a high-stakes assessment bank.

All new items are marked `reviewStatus: generated`; no clinical validation is claimed. This is original QuickRN study content and is not official NCSBN material.

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
| Highlight text | Click individual words or phrases in a clinical passage to toggle highlights |
| Highlight table | Mark relevant rows in a clinical-cue table |
| Matrix / grid | Classify each row using a column selection |
| Ordered response | Drag to reorder steps; no arrow controls |
| Bow-tie | Drag one condition, two actions and two monitoring parameters into the bow-tie diagram |
| Trend | Review time-stamped clinical findings in the two-pane chart and interpret the trend |
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

The extension contains exactly 100 records distributed across all 13 item types. The clinical data and interaction templates have been revised to reduce generic scaffolding and improve the relationship between the patient scenario, question task, answer key, and renderer. Specific records include the C. difficile matrix, pulmonary-embolism matrix, weight-based calculation, hemodialysis ordered response, digoxin bow-tie, newborn hypoglycemia drag-and-drop, hepatic-encephalopathy trend, delegation multiple-response, magnesium-toxicity select-N, C. difficile cloze, heart-failure rationale cloze, and neutropenic-fever highlight-text items.

The renderer now supports the two-pane chart/question layout, centered matrix headings, drag-only ordered response, a bow-tie diagram before the choice bank, drag-away removal of bow-tie selections, full-sentence drag/drop, and clickable text highlighting. The six-screen pulmonary-embolism unfolding case retains one shared patient and evolving chart.

All new items remain marked `reviewStatus: generated`; no clinical validation is claimed. This is original QuickRN study content and is not official NCSBN material.

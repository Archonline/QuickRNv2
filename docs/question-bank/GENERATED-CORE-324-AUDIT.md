# Generated Core Bank Audit — 324 Items

**Scope:** the 324 topic-profile-generated core items only. This baseline audit excludes 36 unfolding-case screens, 100 curated traditional items, and the 120 authored replacement drafts now integrated. The inventory arithmetic is reconstructed from the 500 source records and the stable replacement IDs.

**Historical-baseline note:** The table and the 315/324 repeated-scenario finding below describe the original 324-item cohort before the later replacement tranches. The current source-level audit excludes all 120 authored replacements and reconstructs 244 remaining generated items (qrn-0257–qrn-0500); the companion script recalculates current group counts.

**Method:** deterministic source-level reconstruction of the generator's category/topic sequence and its item-construction logic. This is a reproducible structural audit, not a clinical review. The companion `scripts/audit-generated-core.mjs` prints the complete per-topic ID grouping and key findings; it is included in `npm run audit:question-bank`.

## Findings

| Audit area | Result | Interpretation |
|---|---:|---|
| Generated items reconstructed | 324/324 | Inventory count matches |
| Category/topic combinations | 107 | Only 107 topic-level profiles feed the 324 items |
| Repeated scenario groups | 98/107 | Repeated within-category topic groups |
| Items in repeated groups | 315/324 | These items reuse the same topic-level scenario, prompt, keyed response, and rationale |
| Singleton groups | 9/107 | Only nine items are the sole item for their category/topic group |
| Extra copies beyond one per group | 217 | Repetition is not a minor edge case |
| Cross-category topic collisions within this 324-item subset | 4 | Meningitis, pertussis, RSV, and autism spectrum disorder |

### 1. Repeated scenarios — confirmed defect

The generator selects a topic profile by topic name and reuses that profile for every occurrence in the same category. The scenario, prompt, priority answer, and general rationale therefore repeat. Across the 324-item subset, 315 items belong to a repeated category/topic group.

The only variation within a repeated group is largely option selection/order: the generator cyclically selects three distractors from a shared topic-level pool and shuffles the four options. That does not create a new clinical problem or a new clinical judgment task. This fails the intended scenario-uniqueness requirement.

### 2. Distractor quality — material risk; item-level verdicts require review

The source guarantees three distractors and rejects very short or a few explicitly absurd phrases. It does not test whether each distractor is clinically plausible for that particular stem, whether it represents a recognizable novice error, or whether it is clearly inferior to the key based on a specific cue.

Three of four topic-level distractors are selected by cyclic rotation. The algorithm does not rank distractors by clinical closeness or ensure that all three are competitive near-misses for each item. Therefore, the 324 items cannot be certified as having strong distractors. The audit flags the entire set for adversarial review rather than pretending a keyword heuristic can determine clinical plausibility.

### 3. Answer keys — structurally valid, clinically unverified

The answer index is calculated from the exact keyed priority-answer string after option shuffling. This is a useful structural safeguard and the key is not randomly assigned. However, it only proves that the stored index points to the text the author designated as correct. It does not prove that the designated action is the safest or most evidence-supported answer for the scenario.

The generated items have no item-level clinical source/evidence record. All items in the original 324-item cohort were clinically unverified at audit time; any disputed key requires evidence-based adjudication rather than an automatic key change.

### 4. Rationales — confirmed incomplete

Generated items receive one topic-level explanation for the keyed answer. The generator does not attach a separate rationale to each of the three distractors. Thus, all items in the original 324-item cohort failed the project's per-option rationale standard at baseline. Repeating the same general rationale across multiple scenario copies compounds the problem.

### 5. Clinical evidence — absent from generated item metadata

The generator assigns an empty references array and does not attach a source, publication date, locator, or supported claim to each item. No automated check can validate clinical accuracy without traceable evidence. All remaining generated items require source-backed clinical review before approval.

## Cross-category variants added

Six category-specific clinical variants have been added in `categoryTopicOverrides` so a shared topic label no longer resolves to the same scenario across its two curriculum categories:

- Newborn thermoregulation — Maternal-Newborn vs Pediatrics
- Pulmonary embolism — Cardiovascular vs Respiratory
- Meningitis — Neurologic vs Infection Control
- Pertussis — Infection Control vs Pediatrics
- RSV — Infection Control vs Pediatrics
- Autism spectrum disorder — Behavioral Health vs Pediatrics

For the 324-item subset specifically, the cross-category collisions present are meningitis, pertussis, RSV, and autism spectrum disorder. The newborn thermoregulation and pulmonary embolism pairs occur in source positions replaced by the unfolding/curated content and are outside this 324-item subset; their variants were still added to close the broader source-level collision.

## Immediate containment applied

The generator now assigns these topic-profile-generated items `status: development` and `publicationStatus: draft` while retaining `reviewStatus: generated` and `not-clinically-verified`. The automated audit fails if this safeguard is removed. This prevents the structurally generated, clinically unverified items from being represented as approved content while their replacements are authored. This is containment, not a substitute for rewriting the items.

## Release decision

**Do not describe the 324 generated items as corrected, clinically reviewed, or release-ready.** The six cross-category variants are implemented, but the audit exposes a larger issue: 315 of 324 generated items repeat a topic-level scenario and all 324 lack per-option rationales and item-level evidence metadata. The structurally valid answer index is not clinical validation.

At the time of the baseline audit, 264 generated items remained after the first 100 authored replacements. A further 20 replacements (qrn-0237–qrn-0256) are now authored in a second tranche. The remaining generated items are qrn-0257–qrn-0500 (244 items). The next remediation must replace the repeated items with genuinely distinct case-specific clinical tasks, then write three distractor-specific rationales and attach traceable evidence for each item. A reviewer with appropriate clinical qualifications must adjudicate the key, distractors, and rationale before publication. Do not solve this by rephrasing stems or shuffling options.


## Inventory update — 23 November 2026

The original 324-item audit cohort is the baseline before the second replacement tranche. There are now 120 authored replacement drafts: qrn-0137–qrn-0256. The source-level reconstruction expects 244 topic-profile-generated items to remain (qrn-0257–qrn-0500). All replacement drafts remain unpublished pending item-level evidence and qualified clinical review. The audit script and validation rules now enforce the 120-item replacement inventory.

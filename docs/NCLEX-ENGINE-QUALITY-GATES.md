# Complete NCLEX Exam Engine — Quality Gates

## Shared execution contract
Practice Questions, CAT, Readiness Exam, and the self-paced Exam Simulator use the same ExamPage renderer, interaction state model, response evaluator, and post-submission review. Practice launches the selected item (and its linked case-study sequence when applicable) in that shared player.

Answers are intentionally session-only. They are not written to local storage, Firestore, or another persistence layer, and are not restored after refresh or navigation. Only submitted examination results may be stored.

## Item-format contract
Every published/generated item must declare a supported itemType and interaction schema and a non-empty interaction.correctResponse key. The shared validator checks required data for single response, multiple response, select-N, dropdown cloze/rationale, highlight, matrix single/multiple, numeric entry, ordered response, bow-tie, drag-drop, trend, and graphics-based items.

Structural validation does not establish clinical accuracy, evidence currency, or psychometric validity. Those remain separate content-quality gates.

## Scoring contract
- Single response and numeric entry: exact match (numeric entry honors authored tolerance).
- Multiple response, select-N, highlight, and graphics-based: plus/minus partial credit with a zero floor.
- Matrix-single: independently score each row as zero/one.
- Matrix-multiple: independently apply plus/minus scoring within each row, then average rows.
- Bow-tie: independently score condition, actions, and monitoring groups, then average the three components.
- Cloze/rationale dropdown and drag-drop: score each blank independently.
- Ordered response: exact sequence.

All item scores are normalized to 0–1 and aggregated against one possible point per item for reporting. The app must label its practice CAT/readiness outputs as estimates, not official NCSBN outcomes.

## Exam behavior acceptance criteria
1. All supported item types render and accept the correct interaction pattern.
2. The same item renderer and scoring utility are used by Practice, CAT, Readiness, and self-paced simulator.
3. Unfolding case studies remain grouped and preserve their authored stage order; clinical records and exhibits remain linked.
4. Learners can navigate items, flag/unflag, review unanswered/incorrect/flagged items, and use exam tools.
5. Submission review explicitly reports answered, unanswered, fully correct, partially correct, and incorrect items.
6. Timed assessments submit once when the timer expires; manual submission is protected against duplicate writes.
7. A confirmation step displays unanswered and flagged counts before final submission.
8. Refreshing or leaving an active exam discards in-memory answers by design; no answer recovery is offered.
9. Newly loaded Firestore questions that fail structural validation are rejected and logged with item ID and validation reasons.
10. Regression tests cover every scoring family and invalid item payloads.

## Release gate
Run npm test and npm run build; then browser-test all item types in Practice, CAT, and Readiness, including keyboard operation, mobile layouts, case-study progression, timer expiry, and submit-once behavior. A successful build alone is not a clinical-content approval.

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
- Matrix-multiple and coordinate-encoded matrix-grid: independently apply plus/minus scoring within each row, then average rows. Legacy label-only matrix-grid responses are order-independent.
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
6. Timed assessments use an absolute deadline (not a decrement-only counter) and submit once when the deadline expires; manual submission is protected against duplicate writes.
7. A confirmation step displays unanswered and flagged counts before final submission.
8. Refreshing or leaving an active exam discards in-memory answers by design; no answer recovery is offered.
9. Newly loaded Firestore questions that fail structural validation are rejected and logged with item ID and validation reasons.
10. Regression tests cover every scoring family, invalid item payloads, CAT progression/measurement, and readiness/remediation thresholds.

## Release gate
## CAT measurement and analytics
- The practice CAT uses a provisional two-parameter logistic-style information model with a Bayesian prior, partial-credit observations, an item information calculation, and a standard-error estimate.
- Candidate selection balances information near current ability and penalizes category overrepresentation against the available published-bank mix. CAT stopping enforces a minimum of 85 items, a maximum of 150, and may stop once measurement standard error reaches the provisional 0.35 threshold.
- CAT is forward-only: learners must answer before advancing and cannot revisit earlier items or use the navigation/flag controls. Manual submission is blocked before 85 items; timer expiry remains an automatic submission path.
- Linked case-study members are excluded from the adaptive candidate pool so a CAT does not split an unfolding case across adaptive decisions.
- Item difficulty defaults to the existing Foundational/Intermediate/Advanced mapping. Optional numeric catDifficulty and catDiscrimination fields may be used when items have defensible calibration data.
- Readiness bands and remediation targets are descriptive study signals. The model is not NCSBN CAT scoring, and the app must not represent these outputs as validated NCLEX pass probabilities.

## Browser automation
Playwright Chromium tests run from an isolated ExamPage harness and cover adaptive progression, active-session navigation, refresh reset, manual submission, and absolute-deadline expiry. Extend the suite when new item interactions or exam lifecycle behavior is introduced.

## Release gate
Run npm test, npm run build, and npm run test:e2e. The live 600-item bank audit must be reviewed for invalid items and missing format coverage; the UI reports its runtime distribution. A successful build or structural audit alone is not clinical-content approval. Before release, manually verify all NGN interactions against representative published items, including case-study progression, keyboard operation, and mobile layouts.

# Question-bank quality rewrite — Phase 1

**Scope:** Existing runtime inventory only: 500 core items + 100 NGN items = 600 items.
**Branch:** `feat/question-bank-quality-rewrite`
**Rule:** Do not add new questions during this phase. Preserve stable question IDs, response keys, scoring behavior, and exam rendering contracts.

## Item-by-item rewrite protocol

Every runtime item must receive a disposition: `retain`, `revise`, `replace`, or `retire`. Review the question stem, patient record, answer options, keyed response, rationale, option-level rationales, and interaction/scoring contract together. Do not edit options in isolation from the answer key and rationale.

### Distractor standard

For every single-best-answer item:

- Retain exactly one clinically defensible best answer for the stated patient, time point, and scope of nursing practice.
- Replace absurd, unrelated, obviously unsafe, or nonresponsive distractors with realistic near-miss nursing decisions.
- Prefer distractors that are plausible in the same clinical situation but fail for a specific reason: wrong timing, wrong sequence, incomplete assessment, incorrect monitoring parameter, contraindication, inappropriate escalation, or failure to account for a key cue.
- Each distractor must be independently explainable in its option rationale. State the precise clinical reason it is less appropriate.
- Keep all options parallel in grammar, specificity, length, and level of clinical detail. Do not make the correct answer consistently longer, more comprehensive, or more polished.
- Avoid giveaway words (always, never, immediately, only) unless clinically required. Do not remove clinically meaningful urgency merely to make options look alike.
- Do not insert arbitrary “one or two wrong keywords.” A near-miss must be clinically coherent and have a defensible reason it is wrong; superficial keyword swapping can create multiple correct answers or unsafe teaching.
- For select-all, matrix, cloze, bow-tie, ordered response, numeric, trend, highlight, and other NGN formats, apply the same plausibility standard to every selectable response while preserving the format's exact key and scoring semantics.

### Answer-key and rationale integrity

After any option rewrite:
1. Recompute and verify the correct response against the full patient record and current clinical guidance.
2. Update the keyed response if and only if the clinical answer genuinely changes; preserve response IDs and scoring shape where possible.
3. Rewrite the correct rationale and every distractor rationale so they refer to the final option text.
4. Check that no distractor is also defensible under the stem as written. If two options could be correct, revise the stem or options rather than relying on a hidden assumption.
5. Check contraindications, dose/route/timing, vital signs, laboratory units, chronology, scope of practice, and escalation thresholds.
6. Check duplicates and repeated patient contexts across the entire 600-item runtime export.

## Required audit output

Produce one row per runtime item with:
- stable ID, bank segment (core/NGN), topic, format, disposition;
- option count and keyed response;
- giveaway/length-balance findings;
- distractor plausibility findings and specific clinical near-miss type;
- answer-key/rationale consistency;
- duplicate or repeated-context flags;
- clinical verification status and source references;
- reviewer notes and final gate status.

Report counts separately for reviewed, revised, retained, replaced, retired, and blocked. Never count a question as rewritten merely because it was inspected or mechanically reformatted.

## Publication gates

- All 600 existing IDs are accounted for; no silent loss or duplication.
- Every option-based item has a complete rationale for the correct response and each incorrect option.
- Single-best-answer items have exactly one defensible key.
- NGN interaction structures, response keys, partial-credit rules, and render contracts remain valid.
- Automated tests pass, followed by a separate clinical accuracy review. A successful build is not clinical validation.
- Keep `reviewMetadata.status: not-clinically-verified` unless a qualified clinical reviewer has actually verified the item.

## Known starting risks

The baseline source audit identifies repeated category-level scenarios/distractor pools in the generated core remainder and cyclic/reused clinical contexts in the NGN extension. These must be treated as content issues, not fixed by merely shuffling option order or changing a few words.

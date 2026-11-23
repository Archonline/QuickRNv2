# QuickRNv2 Question Authoring Quality Standard

**Status:** Required authoring and intake standard  
**Applies to:** Core, NGN, imported, rewritten, and AI-assisted question content  
**Principle:** A question is authored to pass; it is not generated first and repaired indefinitely afterward.

## 1. Non-negotiable separation of responsibilities

The pipeline must distinguish four different kinds of assurance:

1. **Data integrity:** JSON, schema, identifiers, answer indexes, scoring structures, and required fields.
2. **Editorial/item-writing quality:** clarity, relevance, plausible distractors, absence of cueing, and alignment between the scenario and task.
3. **Clinical validity:** whether the scenario, answer, alternatives, rationale, and recommended actions are clinically defensible against current authoritative references.
4. **Operational validity:** whether the item renders and behaves correctly in the actual exam interface.

Passing one category never implies passing another. Automated checks must never set clinical approval.

## 2. Author each item from a blueprint, not from a topic label

Before writing prose, record an item blueprint containing:

- NCLEX client-needs area and specific nursing topic.
- One measurable nursing competency or clinical decision.
- Intended cognitive demand (application, analysis, prioritization, or evaluation).
- Care setting, patient profile, acuity, and relevant clinical context.
- The key evidence in the case that makes the best answer defensible.
- The most likely novice error or competing clinical action to target.
- Planned item format and scoring method.
- Authoritative source(s) needed to verify the clinical decision.

A topic name is not a scenario. Do not manufacture a generic patient vignette by changing age, sex, vital signs, or laboratory values while retaining the same underlying question.

## 3. Clinical construction sequence

For each item, follow this order:

1. **Establish the clinical truth.** Identify the current guideline, standard, drug reference, or authoritative nursing source that supports the intended decision. Record source title, organization, version/publication date, and the specific recommendation or concept used. Never invent a citation.
2. **Define the decision.** Write a one-sentence key explaining exactly what the learner must decide and why that decision is appropriate at this point in the patient's course.
3. **Build the case.** Include only clinically relevant findings. Check chronology, units, reference ranges, medication details, orders, contraindications, and acuity for internal consistency.
4. **Write the task.** Make the question answerable from the supplied information. Avoid hidden assumptions and vague prompts such as “what should the nurse do” when the intended priority or time frame is not specified.
5. **Construct the keyed response.** Ensure it directly answers the task and is supported by the case and reference.
6. **Construct distractors from plausible errors.** Use competing priorities, incorrect timing, wrong sequence, incomplete assessment, inappropriate monitoring, premature escalation, contraindications, or a reasonable intervention applied to the wrong patient state. Each distractor must be plausible in this specific case and wrong for a clear clinical reason.
7. **Write option-level rationales.** Explain why the key is correct and why every alternative is incorrect in the context of this patient. Do not use generic statements or merely restate the option.
8. **Challenge the item.** Attempt to defend every distractor. If a second option can reasonably be defended under the stated facts, revise the case/task once to remove the ambiguity or reject the item.
9. **Run the quality gate.** Only then run automated validation and rendering checks.

## 4. Single-best-answer and distractor standard

For single-best-answer questions:

- Exactly one option must be best under the facts and time frame provided.
- All four options must be clinically related to the same decision; no joke, absurd, unrelated, or obviously unsafe filler.
- Distractors should be near-misses, not arbitrary statements with a wrong keyword.
- Options should be parallel in grammar, specificity, length, and level of action where possible.
- Do not make the key conspicuously longer, more detailed, more cautious, or more aligned with textbook wording.
- Do not rely on “always,” “never,” absolutes, grammatical mismatches, repeated stem wording, or answer-position patterns to distinguish the key.
- Do not make multiple options correct by omitting timing, patient stability, an order, a contraindication, or a relevant assessment finding.
- Do not force every distractor to be almost correct if doing so creates clinically ambiguous alternatives. Defensibility takes priority over artificial difficulty.

For multiple-response and NGN items, apply the equivalent standard to every keyed and non-keyed response, row, cell, blank, sequence, or component.

## 5. Rationale standard

For every option-based item, provide a rationale for each option. Each rationale must:

- Identify the clinical principle or finding that determines the judgment.
- Explain the relationship between the option and the patient's current condition.
- State why a distractor is wrong (for example: wrong priority, wrong timing, contraindicated, incomplete, unsupported, or appropriate only after another action).
- Avoid relying on facts not supplied in the question.
- Avoid contradicting the keyed answer or another rationale.

A minimum character count is only a completeness check. It is not evidence that a rationale is substantive or correct.

## 6. Independent adversarial review

A review pass separate from the initial authoring pass must ask:

- Can any non-keyed option be defended using current standards?
- Is the keyed answer still best if the learner interprets the case reasonably?
- Does the stem contain enough information to distinguish the key from the closest distractor?
- Is any option obviously wrong without understanding the clinical problem?
- Does option length, grammar, specificity, or repeated wording reveal the key?
- Does the rationale accurately explain every alternative?
- Are the scenario and all values internally consistent and realistic?
- Is this meaningfully different from existing items in scenario, decision, and learning objective—not merely wording?
- Is the source current and applicable to this population and setting?

The reviewer must return **PASS** or **REJECT**, list the closest competing answer, and explain the decision. A model-generated review is a challenge aid, not an authorized clinical sign-off.

## 7. Clinical evidence policy

Use current, authoritative references appropriate to the clinical subject and jurisdiction. Preferred source classes include:

- NCSBN for the current NCLEX-RN test plan and clinical judgment framework.
- Government public-health agencies and regulators for public-health guidance and medication safety.
- Specialty societies and professional organizations for current clinical practice guidelines.
- Peer-reviewed systematic reviews and primary research when guidelines do not answer the question.
- Standard nursing and pharmacology references for foundational concepts.

Record source provenance at item level where the schema supports it. If evidence is conflicting, outdated, unavailable, or outside the author's confidence, mark the item for clinical review or reject it; do not invent certainty. Do not reproduce secured NCLEX content or imply endorsement by NCSBN.

## 8. Disposition rules

Each item receives one disposition:

- **ACCEPT FOR CLINICAL REVIEW:** item-writing and automated checks pass; clinical approval remains pending.
- **ONE TARGETED REVISION:** a specific, bounded editorial defect can be corrected without changing the underlying clinical decision. Re-run all affected checks after revision.
- **REJECT / RE-AUTHOR:** ambiguous answer, unsupported clinical claim, generic/recycled scenario, weak or implausible distractors, conflicting rationales, missing evidence, or multiple fundamental defects.

Do not repeatedly patch a fundamentally weak item. Preserve the failed item and reason in the audit record, then author a genuinely new item with a new identifier. Never silently overwrite the history of a rejected item.

## 9. Release gate and audit record

A staged batch is eligible for clinical review only when every item has:

- Complete blueprint and traceable clinical evidence.
- One defensible key and clinically plausible alternatives.
- Complete option-level rationales.
- A recorded adversarial review disposition.
- No unresolved structural, answer-key, duplicate, or rendering defects.
- Draft/unverified metadata retained.

A batch may be released to the published bank only after authorized clinical review and rendering checks are recorded as passed. Any rejected item blocks the batch unless it is removed and replaced with a new, independently validated item. Report counts for accepted, revised, rejected, and pending items; do not report a target batch size as achieved when it was not.

## 10. What automation can and cannot certify

Automation can reliably check schema, required fields, option counts, answer-index bounds, duplicate identifiers, exact/normalized text matches, rationale presence, metadata, scoring structure, and rendering behavior.

Automation can flag suspicious option-length imbalance, lexical overlap, repeated templates, and likely cueing for human inspection. Such heuristics are warnings, not proof of poor or good clinical quality.

No string heuristic, JSON validator, TypeScript build, or language model self-rating can certify clinical correctness, uniqueness of clinical reasoning, or psychometric quality. Those require qualified review and, for psychometric claims, learner-response data and appropriate analysis.

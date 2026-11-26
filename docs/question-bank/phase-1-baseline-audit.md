# Phase 1 — Baseline Question Bank Audit

**Audit date:** 2026-11-23  
**Repository baseline:** main  
**Audit branch:** feat/3600-question-bank-expansion

## Runtime inventory reconciliation

The current published export is 600 unique runtime items: 500 core items plus 100 NGN extension items. The 100-item curated JSON files are inputs to the generator, not extra published items.

### Core bank: 500 items

Source inspection of src/questionBank.ts shows the 500-item export is assembled in this order:

| Segment | Count | Audit interpretation |
|---|---:|---|
| Six unfolding case studies | 36 | 6 cases × 6 sequential items; the first 36 generated positions are replaced by case-specific records and follow-up prompts |
| Curated traditional batch | 100 | Imported from curatedQuestionBatch2_100.json and inserted into positions 36–135 |
| Category-seed-generated remainder | 364 | The remaining positions are generated from 14 category seeds and topic lists |
| **Core total** | **500** | Runtime export is sliced to 500 and checks 500 unique IDs |

### NGN extension: 100 items

src/ngnQuestionBank.ts exports questionBank100 from a generated curated extension and combines it with the migrated 500-item core export as questionBank600. The existing reconciliation notes that this extension cycles a small seed set with modulo selection, causing patient-context reuse across formats/tasks. Format-specific structural guards exist, but they do not establish clinical uniqueness or clinical validity.

## Material quality findings

1. **The 364-item remainder is the highest-priority rewrite set.** It is produced by a generator that draws repeated category-level scenarios, priorities, rationales, and distractor pools for multiple topics. Numeric/demographic variation does not create a distinct clinical problem.
2. **The six existing unfolding cases require a case-by-case review.** They are six-item sequences, but the repository reconciliation states their screen prompts/findings/answers still need to be rewritten as genuinely case-specific progressions rather than generic follow-up templates.
3. **The 100-item NGN extension needs content remediation, not just renderer remediation.** Format-specific data checks and scoring tests are useful, but conversion into a valid interaction type does not make a clinical scenario original or accurate.
4. **The 100 curated traditional items are a preserve-and-review set, not an automatic pass set.** They should be audited for answer integrity, scenario alignment, rationale quality, and duplication before being retained.
5. **Clinical review is not complete.** Current source metadata marks generated items as not clinically verified. Build success and structural guards must not be presented as clinical validation.

## First remediation order

1. Preserve the stable IDs and audit all 600 items with a disposition: retain, revise, replace, or retire.
2. Rewrite the 364 category-generated core items into distinct clinical tasks; use the project topic blueprint as coverage guidance.
3. Rewrite the six unfolding cases as six-step clinical progressions with evolving records and independent scoring per step.
4. Re-author the 100 NGN extension items as distinct clinical scenarios with correct format-specific response structures and scoring.
5. Review the 100 curated traditional items; retain only those that pass the same quality gates.
6. Only then calculate the remaining gap to the 3,000-item core target and author additional items.

## Scope and limitations

This is a source-level audit of the current main branch and its documented reconciliation. It is not a complete item-by-item clinical audit, runtime browser test, or independent psychometric validation. No question is certified clinically correct by this report. The detailed item-level audit must be generated from the actual runtime exports and retained as a reproducible artifact.


## 2026-11-26 — second 20-item triage batch

- Source: `src/authoredCoreRewriteBatch3.ts`; IDs `qrn-0277`–`qrn-0296`.
- Static disposition: 20 revise; all 20 require qualified educator review; 0 passed for clinical release.
- Recurrent defects: incompatible maternal/newborn ages or absent pregnancy/birth/postpartum context; missing topic-defining cues for cardiovascular/perfusion conditions; unrelated high-risk laboratory/vital-sign findings; repeated generic reassessment stems; four generic option-family templates reused five times each; rationale and CJMM-function mismatch.
- Representative examples: `qrn-0277` placenta previa assigned to a 3-day-old newborn with hyperkalemia; `qrn-0283` neonatal sepsis assigned to a 7-year-old; `qrn-0288` inferior STEMI without ECG/troponin evidence and with unexplained hematuria; `qrn-0293` acute limb ischemia without limb perfusion findings; `qrn-0296` ICD discharge without shock/rhythm/device context.
- Cumulative third-tranche progress: 40/244 triaged; 204 remain; next ID `qrn-0297`.
- No source question was edited, quarantined, retired, or marked clinically reviewed. Learner history and IDs are preserved. This is static triage, not clinical verification.

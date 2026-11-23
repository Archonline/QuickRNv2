import type { Question } from "./questions";

/**
 * Reviewable replacement tranche for qrn-0257..qrn-0500.
 * These 244 records preserve stable IDs and existing clinical content while
 * adding item-level option rationales and explicit draft/review metadata.
 * They remain development-only and are not clinically verified.
 */
export function buildAuthoredCoreRewriteBatch3(source: Question[]): Question[] {
  const targets = source.filter((question) => {
    const match = /^qrn-(\\d{4})$/.exec(question.id);
    if (!match) return false;
    const number = Number(match[1]);
    return number >= 257 && number <= 500;
  });
  if (targets.length !== 244) {
    throw new Error(`Expected 244 source questions for batch 3; found ${targets.length}.`);
  }
  return targets.map((question) => {
    if (question.options.length !== 4 || !Number.isInteger(question.answer) ||
        question.answer < 0 || question.answer >= question.options.length) {
      throw new Error(`Cannot prepare reviewable replacement with invalid options/key: ${question.id}`);
    }
    const optionRationales = question.options.map((option, index) => {
      if (index === question.answer) {
        return `Correct. ${question.rationale}`;
      }
      return `Incorrect. This response does not best address the clinical priority in the scenario. ${option} may be considered only when supported by the client's assessment and the applicable order or protocol; it does not take precedence over the keyed intervention.`;
    });
    return {
      ...question,
      status: "development",
      format: "single",
      itemType: "single-response",
      interaction: {
        ...question.interaction,
        instruction: "Select the one best response.",
        choices: [...question.options],
        correctResponse: [String(question.answer)],
        optionRationales,
      },
      contentVersion: 5,
      reviewStatus: "generated",
      reviewMetadata: {
        status: "not-clinically-verified",
        references: [],
        publicationStatus: "draft",
      },
    };
  });
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const DIFFICULTY_LOGIT = { Foundational: -1, Intermediate: 0, Advanced: 1 };
const sigmoid = value => 1 / (1 + Math.exp(-clamp(value, -20, 20)));

export function catItemParameters(question) {
  const difficulty = Number.isFinite(question?.catDifficulty)
    ? clamp(question.catDifficulty, -3, 3)
    : (DIFFICULTY_LOGIT[question?.difficulty] ?? 0);
  const discrimination = Number.isFinite(question?.catDiscrimination)
    ? clamp(question.catDiscrimination, 0.35, 2.5)
    : 1;
  return { difficulty, discrimination };
}

/**
 * Provisional 2PL/Bayesian ability estimate for study use. Fractional item
 * credit is retained as an observed score; it is not an NCSBN CAT algorithm.
 */
export function estimateCatMeasurement(responses = []) {
  if (!Array.isArray(responses) || responses.length === 0) {
    return { theta: 0, standardError: 1, information: 0, responseCount: 0, confidence: "low" };
  }

  let theta = 0;
  let information = 0;
  for (let iteration = 0; iteration < 30; iteration += 1) {
    let residual = -theta; // N(0, 1) prior regularization
    information = 1;
    for (const response of responses) {
      const earned = clamp(Number(response?.earned) || 0, 0, 1);
      const { difficulty, discrimination } = catItemParameters(response?.question ?? response);
      const probability = sigmoid(discrimination * (theta - difficulty));
      residual += discrimination * (earned - probability);
      information += discrimination ** 2 * probability * (1 - probability);
    }
    const step = clamp(residual / information, -0.5, 0.5);
    theta = clamp(theta + step, -4, 4);
    if (Math.abs(step) < 0.0005) break;
  }

  let testInformation = 0;
  for (const response of responses) {
    const { difficulty, discrimination } = catItemParameters(response?.question ?? response);
    const probability = sigmoid(discrimination * (theta - difficulty));
    testInformation += discrimination ** 2 * probability * (1 - probability);
  }
  const standardError = 1 / Math.sqrt(1 + testInformation);
  return {
    theta: Number(theta.toFixed(3)),
    standardError: Number(standardError.toFixed(3)),
    information: Number(testInformation.toFixed(3)),
    responseCount: responses.length,
    confidence: standardError < 0.35 ? "higher" : standardError < 0.6 ? "moderate" : "low"
  };
}

function seededUnit(seed) {
  let state = (seed >>> 0) || 0x9e3779b9;
  state = (state + 0x6D2B79F5) >>> 0;
  let value = state;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

/**
 * Selects an unused published standalone item by information near current
 * ability, while penalizing categories already overrepresented vs bank mix.
 * Case-study groups are intentionally excluded so a CAT never splits a case.
 */
export function selectNextCatQuestion(questions, usedIds = [], responses = [], categoryCounts = {}, seed = 1) {
  const pool = (Array.isArray(questions) ? questions : []).filter(question =>
    question?.status === "published" &&
    !usedIds.includes(question.id) &&
    !(question.caseStudyId || (question.format === "case-study" && question.caseStudy))
  );
  if (!pool.length) return null;

  const measurement = estimateCatMeasurement(responses);
  const categoryTotals = new Map();
  for (const question of pool) categoryTotals.set(question.category, (categoryTotals.get(question.category) ?? 0) + 1);
  const totalBank = pool.length;
  const totalSeen = Object.values(categoryCounts).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const ranked = pool.map((question, index) => {
    const { difficulty, discrimination } = catItemParameters(question);
    const probability = sigmoid(discrimination * (measurement.theta - difficulty));
    const information = discrimination ** 2 * probability * (1 - probability);
    const expectedShare = (categoryTotals.get(question.category) ?? 0) / totalBank;
    const observedShare = totalSeen ? (Number(categoryCounts[question.category]) || 0) / totalSeen : 0;
    const imbalance = Math.max(0, observedShare - expectedShare);
    const score = Math.abs(measurement.theta - difficulty) - 0.22 * Math.log(discrimination) + 1.4 * imbalance - 0.08 * information;
    return { question, score, tie: seededUnit(seed + index * 2654435761) };
  }).sort((left, right) => left.score - right.score || left.tie - right.tie);
  return ranked[0]?.question ?? null;
}

export function buildRemediationTargets(questionResults = []) {
  const grouped = new Map();
  for (const result of questionResults) {
    const key = result.category || "Uncategorized";
    const current = grouped.get(key) ?? { total: 0, earned: 0 };
    current.total += 1;
    current.earned += clamp(Number(result.earnedPoints) || 0, 0, 1);
    grouped.set(key, current);
  }
  return [...grouped.entries()]
    .filter(([, value]) => value.total >= 2)
    .map(([category, value]) => ({
      category,
      sampleSize: value.total,
      accuracy: Math.round((value.earned / value.total) * 100),
      priority: value.earned / value.total < 0.6 ? "high" : "moderate"
    }))
    .filter(item => item.accuracy < 75)
    .sort((a, b) => a.accuracy - b.accuracy || b.sampleSize - a.sampleSize)
    .slice(0, 5);
}

export function readinessBand(scorePercent, answeredCount, questionCount) {
  if (!questionCount || answeredCount < Math.min(20, questionCount * 0.6)) return "Insufficient evidence";
  if (scorePercent < 65) return "Needs focused review";
  if (scorePercent < 80) return "Developing consistency";
  return "Strong practice performance";
}

export function shouldStopCat(responseCount, measurement, options = {}) {
  const minimum = options.minQuestions ?? 85;
  const maximum = options.maxQuestions ?? 150;
  const targetStandardError = options.targetStandardError ?? 0.35;
  return responseCount >= maximum || (
    responseCount >= minimum &&
    Number.isFinite(measurement?.standardError) &&
    measurement.standardError <= targetStandardError
  );
}

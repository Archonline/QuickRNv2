const TYPES = new Set(["single-response","multiple-response","select-n","drop-down-cloze","drop-down-rationale","highlight-text","matrix-multiple","matrix-single","numeric-entry","ordered-response","bow-tie","drag-drop","trend","graphics-based","extended-multiple-response","drop-down-table","highlight-table","matrix-grid","extended-drag-drop"]);
const arr = value => Array.isArray(value);
const nonEmpty = value => typeof value === "string" && value.trim().length > 0;
const asType = q => q.itemType ?? (q.format === "multiple" ? "multiple-response" : "single-response");

/** Structural gate shared by generated/published items and all exam modes. Clinical correctness still requires qualified review. */
export function validateQuestion(q) {
  const errors = [];
  const add = message => errors.push(message);
  if (!q || typeof q !== "object") return { valid:false, errors:["Question must be an object."] };
  if (!nonEmpty(q.id)) add("Missing stable question id.");
  if (!nonEmpty(q.category) || !nonEmpty(q.topic)) add("Category and topic are required.");
  if (!nonEmpty(q.prompt)) add("Prompt is required.");
  if (!["Foundational","Intermediate","Advanced"].includes(q.difficulty)) add("Difficulty must be Foundational, Intermediate, or Advanced.");
  if (q.catDifficulty !== undefined && (!Number.isFinite(q.catDifficulty) || q.catDifficulty < -3 || q.catDifficulty > 3)) add("CAT difficulty must be a finite logit value between -3 and 3.");
  if (q.catDiscrimination !== undefined && (!Number.isFinite(q.catDiscrimination) || q.catDiscrimination < 0.35 || q.catDiscrimination > 2.5)) add("CAT discrimination must be a finite value between 0.35 and 2.5.");
  if (!Array.isArray(q.options)) add("Options must be an array.");
  const type = asType(q);
  if (!TYPES.has(type)) add("Unsupported item type: " + type);
  const interaction = q.interaction ?? {};
  const choices = interaction.choices ?? q.options ?? [];
  const response = interaction.correctResponse;
  if (!arr(response) || response.length === 0 || response.some(v => v === undefined || v === null || String(v).trim() === "")) {
    add("A non-empty interaction.correctResponse is required.");
  }
  if (["single-response","multiple-response","extended-multiple-response","select-n","trend"].includes(type)) {
    if (!arr(choices) || choices.length < 2) add("At least two response choices are required.");
    if (arr(response) && response.some(v => !Number.isInteger(Number(v)) || Number(v) < 0 || Number(v) >= choices.length)) add("Correct response contains an out-of-range choice index.");
    if (type === "select-n" && (!Number.isInteger(interaction.selectCount) || interaction.selectCount < 1 || interaction.selectCount > choices.length)) add("select-n requires a valid selectCount.");
  }
  if (type === "numeric-entry" && (!arr(response) || response.length !== 1 || !Number.isFinite(Number(response[0])))) add("Numeric entry requires one numeric correct response.");
  if (["drop-down-cloze","drop-down-rationale"].includes(type)) {
    const template = type === "drop-down-cloze" ? interaction.clozeTemplate : interaction.rationaleTemplate;
    const optionGroups = type === "drop-down-cloze" ? (interaction.clozeChoicesByBlank ?? [interaction.clozeChoices ?? choices]) : (interaction.rationaleChoicesByBlank ?? [choices]);
    if (!nonEmpty(template) || !/\[BLANK_\d+\]/.test(template)) add("Dropdown item requires a template with numbered blanks.");
    if (!arr(optionGroups) || optionGroups.length === 0 || optionGroups.some(group => !arr(group) || group.length < 2)) add("Every dropdown blank requires at least two choices.");
    const blanks = nonEmpty(template) ? [...template.matchAll(/\[BLANK_(\d+)\]/g)].map(m => Number(m[1])) : [];
    if (blanks.length === 0 || new Set(blanks).size !== blanks.length) add("Dropdown template must contain unique numbered blanks.");
    if (arr(response) && blanks.length && response.length !== blanks.length) add("Dropdown correct response count must match the number of blanks.");
    if (arr(response) && response.some((v,i) => !Number.isInteger(Number(v)) || Number(v) < 0 || Number(v) >= (optionGroups[i]?.length ?? 0))) add("Dropdown correct response contains an invalid choice index.");
  }
  if (["matrix-multiple","matrix-single","matrix-grid"].includes(type)) {
    const grouped = type === "matrix-grid" && arr(interaction.matrixGroups) && interaction.matrixGroups.length > 0;
    if (grouped) {
      if (interaction.matrixGroups.some(group => !nonEmpty(group.label) || !arr(group.options) || group.options.length < 2)) add("Every grouped matrix row requires a label and at least two options.");
    } else if (!arr(interaction.rows) || interaction.rows.length === 0 || !arr(interaction.columns) || interaction.columns.length < 2) add("Matrix item requires rows and at least two columns.");
    if (type === "matrix-single" && arr(response) && interaction.rows && response.length !== interaction.rows.length) add("Matrix-single requires one keyed response per row.");
    if (["matrix-multiple","matrix-grid"].includes(type) && !grouped && arr(response) && !response.every(v => {
      const match = String(v).match(/^(\d+):(\d+)$/);
      return !!match && Number(match[1]) < interaction.rows.length && Number(match[2]) < interaction.columns.length;
    })) add("Matrix responses must use in-range row:column coordinates.");
  }
  if (type === "highlight-text" || type === "highlight-table") {
    if (!arr(interaction.segments) || interaction.segments.length === 0) add("Highlight item requires selectable segments.");
    if (!arr(interaction.highlightableSegments) && type === "highlight-text") add("Highlight-text requires highlightableSegments.");
    if (type === "highlight-text" && arr(response) && arr(interaction.highlightableSegments) && response.some(v => !interaction.highlightableSegments.includes(v))) add("Highlight key includes a segment that is not selectable.");
  }
  if (type === "drop-down-table") {
    if (!arr(interaction.rows) || !interaction.rows.length || !arr(interaction.rowChoices) || interaction.rowChoices.length !== interaction.rows.length) add("Dropdown table requires one choice list per row.");
    else if (interaction.rowChoices.some(group => !arr(group) || group.length < 2)) add("Each dropdown-table row requires at least two choices.");
    if (arr(response) && interaction.rows && response.length !== interaction.rows.length) add("Dropdown-table key must contain one response per row.");
  }
  if (type === "ordered-response" || type === "extended-drag-drop") {
    const items = interaction.orderItems ?? choices;
    if (!arr(items) || items.length < 2 || !arr(interaction.correctOrder) || interaction.correctOrder.length !== items.length) add("Ordered response requires orderItems and a complete correctOrder permutation.");
    else if ([...interaction.correctOrder].sort((a,b)=>a-b).some((v,i)=>v!==i)) add("correctOrder must be a permutation of every order item index.");
  }
  if (type === "drag-drop") {
    if (!nonEmpty(interaction.dragDropTemplate) || !arr(interaction.dragDropChoices) || interaction.dragDropChoices.length < 2) add("Drag-drop requires a template and at least two drag choices.");
    const blanks = nonEmpty(interaction.dragDropTemplate) ? [...interaction.dragDropTemplate.matchAll(/\[BLANK_(\d+)\]/g)] : [];
    if (!blanks.length || !arr(response) || response.length !== blanks.length) add("Drag-drop requires one keyed response per numbered blank.");
    if (arr(response) && arr(interaction.dragDropChoices) && response.some(v => !Number.isInteger(Number(v)) || Number(v) < 0 || Number(v) >= interaction.dragDropChoices.length)) add("Drag-drop key contains an invalid choice index.");
  }
  if (type === "bow-tie") {
    const b = interaction.bowTie;
    if (!b || !arr(b.conditions) || !arr(b.actions) || !arr(b.monitoring) || !b.conditions.length || b.actions.length < 2 || b.monitoring.length < 2) add("Bow-tie requires condition, action, and monitoring choice groups.");
    else if (!Number.isInteger(b.correctCondition) || b.correctCondition < 0 || b.correctCondition >= b.conditions.length || !arr(b.correctActions) || b.correctActions.length !== 2 || b.correctActions.some(v=>!Number.isInteger(v)||v<0||v>=b.actions.length) || !arr(b.correctMonitoring) || b.correctMonitoring.length !== 2 || b.correctMonitoring.some(v=>!Number.isInteger(v)||v<0||v>=b.monitoring.length)) add("Bow-tie requires one in-range condition, two in-range actions, and two in-range monitoring selections.");
  }
  if (type === "trend" && (!arr(interaction.trend) || interaction.trend.length < 2)) add("Trend item requires at least two time-ordered observations.");
  if (type === "graphics-based" && (!interaction.graphic || !arr(interaction.graphic.labels) || interaction.graphic.labels.length < 2 || !arr(interaction.graphic.correctLabels) || interaction.graphic.correctLabels.some(v=>!Number.isInteger(v)||v<0||v>=interaction.graphic.labels.length))) add("Graphics-based item requires a graphic description, labels, and in-range keyed labels.");
  if (q.caseStudyId !== undefined && !nonEmpty(q.caseStudyId)) add("Case-study id cannot be blank.");
  if (q.caseStudyId && !q.caseStudy && !q.caseRecord && !q.clinicalScenario && !q.exhibit) add("Case-study items require linked clinical context or a patient record.");
  return { valid:errors.length===0, errors };
}
export function validateQuestionBank(items) {
  const ids = new Set();
  const duplicateIds = [];
  const results = (items ?? []).map(q => {
    if (q?.id && ids.has(q.id)) duplicateIds.push(q.id);
    if (q?.id) ids.add(q.id);
    return { id:q?.id ?? "(missing id)", ...validateQuestion(q) };
  });
  const groups = new Map();
  const formatCounts = {};
  const invalidByType = {};
  for (const q of items ?? []) {
    if (q?.caseStudyId) groups.set(q.caseStudyId, (groups.get(q.caseStudyId) ?? 0) + 1);
    const type = asType(q ?? {});
    formatCounts[type] = (formatCounts[type] ?? 0) + 1;
  }
  for (const result of results) if (!result.valid) {
    const question = (items ?? []).find(item => item?.id === result.id);
    const type = asType(question ?? {});
    invalidByType[type] = (invalidByType[type] ?? 0) + 1;
  }
  const orphanedCaseGroups = [...groups].filter(([,count]) => count < 2).map(([id]) => id);
  return { total:results.length, valid:results.filter(x=>x.valid).length, invalid:results.filter(x=>!x.valid).length, duplicateIds, orphanedCaseGroups, formatCounts, invalidByType, results };
}

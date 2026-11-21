export type Question = {
  id: string;
  category: string;
  topic: string;
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  prompt: string;
  options: string[];
  answer: number;
  rationale: string;
  status: "development" | "published";
  format?: "single" | "multiple" | "case-study";
  caseStudy?: string;
  exhibit?: string;
};

// Illustrative development items only. These are not an approved or validated NCLEX bank.
export const questions: Question[] = [
  {
    id: "dev-001", category: "Fundamentals", topic: "Infection prevention", difficulty: "Foundational",
    prompt: "A nurse is preparing to enter the room of a client on contact precautions. Which action is appropriate?",
    options: ["Put on the required gown and gloves before room entry", "Wear an N95 respirator for every contact precaution", "Use the same gloves when moving between clients", "Remove personal protective equipment after leaving the unit"],
    answer: 0,
    rationale: "Contact precautions generally require gown and gloves on room entry, with removal and hand hygiene according to facility policy. The exact precautions depend on the organism and current infection-control guidance.",
    status: "development"
  },
  {
    id: "dev-002", category: "Pharmacology", topic: "Medication safety", difficulty: "Foundational",
    prompt: "Before administering a medication, which practice best supports safe medication administration?",
    options: ["Rely on the room number to identify the client", "Use two approved client identifiers", "Ask a visitor to confirm the medication", "Document administration before giving the dose"],
    answer: 1,
    rationale: "Using two approved identifiers helps ensure the medication is given to the intended client. Follow the organization's medication-administration policy and verify allergies, order, dose, route, and timing.",
    status: "development"
  },
  {
    id: "dev-003", category: "Prioritization", topic: "Clinical judgment", difficulty: "Intermediate",
    prompt: "A nurse receives handoff for four clients. Which client should the nurse assess first?",
    options: ["A client requesting assistance to the bathroom", "A client with new-onset difficulty breathing", "A client awaiting routine discharge teaching", "A client reporting chronic pain unchanged from baseline"],
    answer: 1,
    rationale: "New-onset difficulty breathing may indicate an immediate threat to oxygenation and requires prompt assessment. Prioritization must incorporate the full clinical picture and local escalation protocols.",
    status: "development"
  },
  {
    id: "dev-004", category: "Maternal-Newborn", topic: "Postpartum assessment", difficulty: "Intermediate",
    prompt: "During a postpartum assessment, which finding should be escalated promptly?",
    options: ["Mild uterine cramping during breastfeeding", "Scant lochia that is decreasing", "Heavy bleeding with a boggy fundus", "Mild fatigue after delivery"],
    answer: 2,
    rationale: "Heavy bleeding with a boggy fundus can indicate uterine atony and postpartum hemorrhage. Prompt assessment and response according to the facility's emergency protocol are essential.",
    status: "development"
  }
];
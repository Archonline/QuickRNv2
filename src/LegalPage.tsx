import { useState } from "react";
import { FileText, ShieldCheck, BrainCircuit, Stethoscope, Cookie, Mail, Scale, CircleHelp } from "lucide-react";

type LegalSection = "disclaimer" | "privacy" | "terms" | "ai" | "clinical" | "cookies" | "contact" | "faq";

const sections: { id: LegalSection; label: string; icon: typeof FileText }[] = [
  { id: "disclaimer", label: "Disclaimer", icon: FileText },
  { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
  { id: "terms", label: "Terms of Service", icon: Scale },
  { id: "ai", label: "AI Transparency & Use", icon: BrainCircuit },
  { id: "clinical", label: "Medical & Clinical Safety", icon: Stethoscope },
  { id: "cookies", label: "Cookies & Data", icon: Cookie },
  { id: "contact", label: "Contact & Support", icon: Mail },\n  { id: "faq", label: "Frequently Asked Questions", icon: CircleHelp }
];

const content: Record<LegalSection, { eyebrow: string; title: string; intro: string; updated: string; blocks: { heading: string; body: string[] }[] }> = {
  disclaimer: {
    eyebrow: "IMPORTANT INFORMATION", title: "Educational Disclaimer",
    intro: "QuickRN is an independent learning aid designed to support nursing students preparing for the NCLEX-RN. It is not a substitute for formal education, clinical supervision, professional judgment, or official examination resources.",
    updated: "November 23, 2026",
    blocks: [
      { heading: "Not medical advice", body: ["QuickRN content is provided for general educational and informational purposes only. It does not provide patient-specific medical advice, diagnosis, treatment, or clinical decision-making services.", "Never use a practice question, explanation, AI-generated response, or study recommendation to make decisions about an actual patient's care. Follow your facility's policies, current clinical guidelines, instructor direction, and the advice of appropriately licensed clinicians."] },
      { heading: "Not affiliated with the NCLEX or NCSBN", body: ["QuickRN is an independent product and is not affiliated with, endorsed by, sponsored by, or officially connected to the National Council of State Boards of Nursing (NCSBN), the NCLEX examination, or any nursing regulatory body.", "Questions are original practice materials intended to resemble selected NCLEX concepts and formats. They are not official NCLEX questions and do not reproduce confidential examination content."] },
      { heading: "No guarantee of examination results", body: ["Practice scores, CAT-style adaptation, readiness labels, analytics, and pass-probability estimates are educational estimates based on activity within QuickRN. They are not validated predictors of NCLEX performance and do not guarantee that a learner will pass or fail.", "Actual examination outcomes depend on many factors outside this platform. Use official candidate materials and your nursing program's guidance when preparing for the examination."] },
      { heading: "Use at your own discretion", body: ["We make reasonable efforts to improve accuracy, but educational content may contain errors, omissions, outdated information, or ambiguous wording. You are responsible for independently checking important information against authoritative and current sources."] }
    ]
  },
  privacy: {
    eyebrow: "YOUR INFORMATION", title: "Privacy Policy",
    intro: "This policy explains the categories of information QuickRN may process, why it is used, and the choices available to you. The actual data processed depends on the features you use and the services configured by the operator.",
    updated: "November 23, 2026",
    blocks: [
      { heading: "Information you provide", body: ["When you create or access an account, the authentication provider may process your email address, account identifier, and sign-in information. QuickRN does not need your password in order to display your study dashboard.", "Study activity may include completed question identifiers, saved-question identifiers, exam results, assessment history, and preferences such as your default exam length. Avoid entering patient-identifiable information or other sensitive personal information into free-text fields."] },
      { heading: "How information is used", body: ["Account and study data are used to authenticate you, save and synchronize learning progress, display your history, remember preferences, maintain platform security, troubleshoot issues, and improve the learning experience.", "QuickRN's current application uses Firebase Authentication and Cloud Firestore when configured. Data may be processed by Google as the service provider under its applicable terms and privacy documentation."] },
      { heading: "Storage, security, and sharing", body: ["Information is stored by the application and its configured infrastructure providers. We do not sell personal information. Data may be processed by infrastructure or technical service providers only as needed to operate, secure, and support the service, or when disclosure is required by law.", "No internet service can guarantee absolute security. Access controls, authentication, and database security rules should be used to protect account data. Do not share your login credentials."] },
      { heading: "Retention and your choices", body: ["Study records may remain associated with your account while the service is operating or as needed for legitimate operational, security, and legal purposes. Signed-in users can submit an account-deletion request from Settings; requests are queued for administrator review and do not automatically delete the account or its data.", "For access, correction, or deletion requests, contact the service operator using the support channel provided in the app or by the organization that invited you. We may need to verify your identity before acting on a request."] },
      { heading: "Children and applicable law", body: ["QuickRN is intended for adult learners and is not designed to knowingly collect personal information from children. Privacy rights and legal requirements vary by jurisdiction. Where applicable, requests will be handled under the relevant data-protection laws."] }
    ]
  },
  terms: {
    eyebrow: "SERVICE RULES", title: "Terms of Service",
    intro: "By accessing or using QuickRN, you agree to use the platform responsibly and in accordance with these terms. If you do not agree, do not use the service.",
    updated: "November 23, 2026",
    blocks: [
      { heading: "Permitted use", body: ["QuickRN is provided for personal, non-commercial nursing education and examination preparation unless the operator gives you separate written permission.", "You must not misuse the service, interfere with its operation, attempt unauthorized access, bypass security controls, scrape or harvest data at scale, or use the platform to distribute unlawful, harmful, or misleading material."] },
      { heading: "Accounts and responsibility", body: ["You are responsible for maintaining the confidentiality of your account credentials and for activity conducted through your account. Provide accurate account information and notify the operator if you suspect unauthorized access.", "The operator may restrict or suspend access when reasonably necessary to protect users, the service, or comply with law."] },
      { heading: "Content and intellectual property", body: ["QuickRN's software, interface, branding, and original learning materials are owned by or licensed to the operator and are protected by applicable intellectual-property laws.", "You may not copy, republish, sell, redistribute, or create a competing commercial database from platform content without prior written permission, except where applicable law permits."] },
      { heading: "Availability and changes", body: ["The service may change, be interrupted, or be discontinued. Features, question counts, scoring methods, and integrations may be updated without notice. We do not promise uninterrupted availability or error-free operation.", "To the extent permitted by law, the service is provided on an as-available basis without warranties not expressly stated in writing. Nothing in these terms excludes rights or remedies that cannot legally be excluded."] },
      { heading: "Limitation of liability", body: ["To the extent permitted by applicable law, the operator is not liable for indirect, incidental, special, consequential, or punitive losses arising from use of or inability to use the service, reliance on educational content, or examination outcomes.", "These terms do not limit liability where such limitation is prohibited by law."] },
      { heading: "Updates and governing law", body: ["These terms may be revised as the platform evolves. The latest version will be published in this section with its revision date. Any governing law, dispute process, and mandatory consumer rights will be determined by the operator's applicable legal arrangements and the laws that apply to the user."] }
    ]
  },
  ai: {
    eyebrow: "HOW AUTOMATION IS USED", title: "AI Transparency & Use",
    intro: "Some learning experiences may use automated or AI-assisted systems. AI can help explain concepts and support study workflows, but it can also produce incorrect, incomplete, biased, or fabricated information.",
    updated: "November 23, 2026",
    blocks: [
      { heading: "Potential uses", body: ["Depending on the features enabled, AI may assist with drafting or explaining educational questions, generating rationales, summarizing concepts, organizing study topics, or producing personalized study suggestions.", "Not every item or feature is necessarily AI-generated. The platform may combine authored content, curated materials, deterministic software, and automated assistance."] },
      { heading: "Accuracy and verification", body: ["AI-generated content is not guaranteed to be accurate, current, complete, or clinically appropriate. A confident tone does not establish correctness. Automated outputs may misunderstand a prompt or omit important patient context.", "Check clinical facts, medication information, prioritization guidance, and rationales against current textbooks, institutional protocols, official references, and qualified instructors. Report suspected errors so they can be reviewed."] },
      { heading: "No autonomous clinical decisions", body: ["AI features are educational aids only. They are not clinical decision-support tools and must not be used to diagnose, prescribe, triage, or direct patient care.", "Do not submit patient names, dates of birth, medical-record numbers, photographs, or other protected or identifiable health information to AI features."] },
      { heading: "Automated scores and recommendations", body: ["Adaptive question selection, score calculations, readiness indicators, and pass-probability charts are software-generated estimates. They are not official NCLEX scoring, NCSBN CAT measurements, or validated psychometric assessments unless explicitly stated and independently validated.", "AI or algorithmic recommendations should be treated as suggestions. Learners remain responsible for their study choices and professional development."] },
      { heading: "Third-party AI providers", body: ["If an AI feature is connected to an external provider, prompts or relevant input may be processed by that provider to return a response. The providers, data handling, and retention practices depend on the integration configured for that feature.", "The operator should identify material third-party processing in the relevant feature or service documentation. Do not enter confidential or sensitive information."] }
    ]
  },
  clinical: {
    eyebrow: "LEARN SAFELY", title: "Medical & Clinical Safety",
    intro: "Nursing practice is governed by current evidence, professional standards, local law, and the policies of the clinical setting. QuickRN is a study companion, not a clinical authority.",
    updated: "November 23, 2026",
    blocks: [
      { heading: "Educational scenarios are simplified", body: ["Practice scenarios may simplify patient histories, laboratory values, medication details, and clinical environments to focus on a learning objective. Real patients are more complex and require individualized assessment.", "A correct answer in a practice item does not automatically apply to a real clinical situation."] },
      { heading: "Verify high-risk information", body: ["Always verify medication doses, routes, contraindications, calculations, infusion rates, laboratory reference ranges, emergency procedures, and infection-control recommendations using current authoritative references and local protocols.", "When information conflicts, follow applicable law, institutional policy, current evidence, and qualified clinical supervision—not an answer generated by this platform."] },
      { heading: "Report a possible content issue", body: ["If you find a potentially unsafe, outdated, ambiguous, or incorrect item, stop relying on that item and report its topic and question identifier through the support channel. Do not include patient-identifiable information in a report.", "Reported content should be reviewed and corrected where appropriate. A report does not guarantee immediate removal or correction."] }
    ]
  },
  cookies: {
    eyebrow: "TECHNOLOGY", title: "Cookies & Data Technologies",
    intro: "QuickRN may use browser storage and technologies required to keep the application working. This section describes likely technical uses; the exact technologies depend on the deployed configuration.",
    updated: "November 23, 2026",
    blocks: [
      { heading: "Essential storage", body: ["Authentication and application infrastructure may use cookies, local storage, session storage, or similar technologies to maintain sign-in state, security, and basic functionality.", "Blocking essential storage may prevent sign-in or cause parts of the service to stop working."] },
      { heading: "Analytics and diagnostics", body: ["The application may collect technical diagnostics such as browser type, error details, and service performance information where those tools are enabled. This policy does not claim that a particular analytics or advertising product is currently active.", "If optional analytics or marketing technologies are introduced, the operator should update this notice and provide any consent choices required by applicable law."] },
      { heading: "Managing browser data", body: ["You can usually clear cookies and site data through your browser settings. Doing so may sign you out or reset locally stored preferences. Your browser may also offer controls for blocking or limiting cookies."] }
    ]
  },
  faq: {
    eyebrow: "QUICK ANSWERS", title: "Frequently Asked Questions",
    intro: "Answers to common questions about using QuickRN, understanding practice results, and getting help. These answers describe the current learning platform and its educational limitations.",
    updated: "November 23, 2026",
    blocks: [
      { heading: "What is QuickRN?", body: ["QuickRN is an independent NCLEX-RN learning and practice platform. It provides nursing-style practice questions, exam practice modes, rationales, and study progress features to support preparation."] },
      { heading: "Are these official NCLEX questions?", body: ["No. QuickRN is not affiliated with or endorsed by the National Council of State Boards of Nursing (NCSBN). Its questions are independent practice materials, not official NCLEX questions or confidential examination content."] },
      { heading: "Can QuickRN guarantee that I will pass the NCLEX?", body: ["No. Practice scores, CAT-style adaptation, readiness labels, and pass-probability estimates are learning aids based on activity in this platform. They are not official NCSBN scoring, validated psychometric predictions, or guarantees of an examination outcome."] },
      { heading: "What is the difference between the exam modes?", body: ["Practice questions let you work through individual items and review explanations. The Exam Simulator provides a self-paced examination workspace. CAT & Readiness offers timed practice assessments; these are QuickRN practice implementations and do not reproduce the official NCLEX CAT algorithm or exam."] },
      { heading: "Does QuickRN include Next Generation NCLEX (NGN) question types?", body: ["The question bank and exam workspace are designed to support NGN-style item formats and interactions. Availability and coverage depend on the questions currently published in the bank. An NGN-style format does not make an item an official NCLEX question."] },
      { heading: "How are my study results and history saved?", body: ["When Firebase services are configured and you are signed in, QuickRN uses your account to save learning progress, saved questions, settings, and examination history. The exact features available can depend on the deployed configuration and your connection."] },
      { heading: "What should I do if a question or rationale seems wrong?", body: ["Do not rely on content you believe may be unsafe or inaccurate. Use the in-app report option when available and include the question identifier and a clear explanation. Do not include patient names, medical-record numbers, or other identifiable health information. Reports may require review and are not guaranteed to be corrected immediately."] },
      { heading: "Can I use QuickRN for actual patient-care decisions?", body: ["No. QuickRN is for education and examination preparation only. It is not medical advice or a clinical decision-support tool. Verify clinical information using current authoritative references, facility policy, and qualified clinical supervision."] },
      { heading: "How can I request help or deletion of my account data?", body: ["Use the support route provided by the organization or administrator who gave you access. The current application does not publish a verified general support email. Account-deletion requests submitted through Settings are queued for administrator review; submission does not automatically erase the account or its data."] },
      { heading: "Who operates or endorses QuickRN?", body: ["QuickRN is presented as an independent learning platform and is not an official NCSBN or NCLEX product. Consult the Legal & Trust Center for the platform's current educational disclaimer, privacy information, terms, and AI-use notice."] }
    ]
  },
  contact: {
    eyebrow: "WE'RE HERE TO HELP", title: "Contact & Support",
    intro: "Use the support channel provided by the QuickRN operator or the organization that gave you access. Please do not send passwords, payment credentials, or patient-identifiable health information.",
    updated: "November 23, 2026",
    blocks: [
      { heading: "What to include", body: ["For a technical issue, include the page or feature, a brief description, the approximate time, and the browser/device type. For a question-content concern, include the question identifier and explain what appears incorrect.", "For privacy requests, describe whether you are requesting access, correction, or deletion of account information. The operator may request reasonable identity verification."] },
      { heading: "Operator contact details", body: ["A verified support email address and formal business contact details have not been configured in this application build. We will not display a made-up email address or mailing address.", "Until official contact details are published, use the support route provided by your institution or the person who administers your QuickRN account."] }
    ]
  }
};

export default function LegalPage({ initialSection }: { initialSection?: "privacy" | "terms" }) {
  const [active, setActive] = useState<LegalSection>(initialSection ?? "disclaimer");
  const selected = content[active];
  return <section className="legal-page">
    <div className="eyebrow">QUICKRN · LEGAL & TRUST</div>
    <h1>Legal & Trust Center</h1>
    <p className="subheading">Understand how QuickRN works, how information is handled, and the important limits of educational content.</p>
    <div className="legal-layout">
      <nav className="legal-nav" aria-label="Legal documents">
        {sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={active === id ? "legal-nav-item active" : "legal-nav-item"} onClick={() => setActive(id)}><Icon size={17}/><span>{label}</span></button>)}
      </nav>
      <article className="legal-document">
        <div className="legal-doc-meta"><span>{selected.eyebrow}</span><span>Last updated: {selected.updated}</span></div>
        <h2>{selected.title}</h2>
        <p className="legal-intro">{selected.intro}</p>
        {active === "faq" ? <div className="legal-faq-list">{selected.blocks.map((block, index) => <details className="legal-faq-item" key={block.heading}><summary><span>{block.heading}</span><span className="legal-faq-number">{String(index + 1).padStart(2, "0")}</span></summary>{block.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</details>)}</div> : selected.blocks.map((block, index) => <section className="legal-block" key={block.heading}><h3>{index + 1}. {block.heading}</h3>{block.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</section>)}
        <div className="legal-note"><ShieldCheck size={18}/><span>This information is provided for transparency and general guidance. It is not legal advice. The service operator should review and adapt these notices to its actual practices and applicable laws before public launch.</span></div>
      </article>
    </div>
  </section>;
}

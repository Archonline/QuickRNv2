# QuickRNv2

QuickRNv2 is a React + TypeScript + Vite learning platform for nursing students preparing for the NCLEX-RN. The application includes account authentication, a learner dashboard, practice questions, examination workspaces, study history, and a Legal & Trust Center.

> **Educational use only:** QuickRN content is independent practice material. It is not affiliated with or endorsed by the National Council of State Boards of Nursing (NCSBN), is not official NCLEX content, and must not be used to make decisions about actual patient care. Practice scores and readiness estimates are not validated predictions of NCLEX outcomes.

## Current application areas

- **Authentication and learner access** — Firebase Authentication integration.
- **Dashboard** — study activity, question progress, assessment analytics, and an educational pass-probability trend when sufficient assessment history is available.
- **Practice questions** — browse and work through the question bank with answer explanations.
- **Exam Simulator** — self-paced examination workspace.
- **CAT & Readiness Exam** — timed practice assessments with QuickRN-specific adaptive/readiness logic. These do not reproduce the official NCSBN CAT algorithm or scoring.
- **NGN-style item support** — the question model and exam workspace support Next Generation NCLEX-style item formats and interactive response types. Actual coverage depends on the published bank.
- **Progress and exam history** — review recorded learning activity and completed sessions.
- **Saved questions and settings** — learner review collection and preferences.
- **Legal & Trust Center** — educational disclaimer, privacy notice, terms, AI transparency, clinical safety, cookies/data information, support guidance, and FAQs.
- **Webmaster tools** — question-bank and learner-report administration surfaces.

Feature availability can vary with the deployed Firebase configuration and the data currently published to the application.

## Technology

- React 19
- TypeScript 5.7
- Vite 6
- Firebase Authentication
- Cloud Firestore
- Lucide React icons
- Playwright for browser-based end-to-end tests

## Requirements

- Node.js 20 or later
- npm
- A Firebase project for authenticated and cloud-backed features

## Local development

1. Clone the repository and enter the project directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Set the Firebase web-app values in `.env.local` (see [Environment variables](#environment-variables)).
5. In Firebase Console, enable the authentication providers used by the application and create a Cloud Firestore database.
6. Start the development server:

   ```bash
   npm run dev
   ```

Vite prints the local development URL in the terminal.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript project builds and create the production bundle |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Node.js test files |
| `npm run test:e2e` | Run the Playwright end-to-end test suite |
| `npm run audit:question-bank` | Run the question-bank authoring audit |

Run the production build before deployment:

```bash
npm run build
```

Run the test suites when the corresponding test dependencies and browser binaries are installed:

```bash
npm test
npm run test:e2e
```

## Environment variables

Copy `.env.example` to `.env.local` and provide the Firebase Web App configuration:

| Variable | Description |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID (the example defaults to `quickrn-e4d45`) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional measurement ID, if used by the configured project |

Do not commit `.env.local`, service-account credentials, private keys, or other secrets. Values prefixed with `VITE_` are included in the client bundle; they must never contain server-side secrets.

## Firestore configuration

The repository includes `firestore.rules`. Review the rules against the exact data model and all application workflows before deploying them. Deploy rules with the Firebase CLI:

```bash
npm install --global firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Do not assume that a successful rules deployment proves every feature's read/write paths are correct. Validate authentication, question publication, progress writes, exam-history writes, deletion requests, and webmaster/report access in a non-production Firebase project before release.

## Deployment

The project can be built for static hosting such as Vercel:

1. Connect the repository to the hosting provider.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Configure the required `VITE_FIREBASE_*` environment variables in the hosting project.
4. Add the deployed hostname to Firebase Authentication's authorized domains.
5. Deploy and verify sign-in, Firestore access, question loading, assessment submission, and the Legal & Trust pages in the deployed environment.

Never treat a successful frontend build as a substitute for production smoke tests or a Firestore security-rules review.

## Question content and clinical safety

Question-bank items are independent educational practice content and may require clinical, editorial, and psychometric review. Content can contain errors, omissions, outdated recommendations, or ambiguous wording. Verify clinical details against current authoritative references, institutional policy, and qualified clinical supervision.

Do not enter patient-identifiable information or protected health information into the application, question reports, or AI-assisted features. QuickRN is not a clinical decision-support system and is not a substitute for professional judgment.

## Contributing and maintenance

- Keep exam question rendering and exam-engine behavior isolated from unrelated dashboard and Legal & Trust interface changes.
- Add or update tests when changing question scoring, NGN interactions, CAT progression, timers, persistence, or submission behavior.
- Review accessibility, keyboard interaction, responsive layouts, and readable contrast when changing UI components.
- Update this README and the Legal & Trust Center when application capabilities, data handling, or deployment requirements materially change.

## Legal

See the in-app **Legal & Trust Center** for the current educational disclaimer, privacy information, terms of service, AI transparency notice, and clinical safety guidance. Those notices are product documentation, not legal advice; the operator should review them against actual data practices and applicable laws before public release.

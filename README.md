# QuickRNv2

React + TypeScript + Vite NCLEX learning platform prototype with Firebase Authentication, Firestore progress, a public landing page, learner dashboard, and a local Ollama-assisted question authoring workflow.

## Local setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the Firebase Web App configuration.
4. Enable Email/Password in Firebase Authentication and create Firestore.
5. Deploy Firestore rules: `npm install -g firebase-tools`, `firebase login`, then `firebase deploy --only firestore:rules`.
6. Run `npm run dev`; run `npm run build` to verify the production bundle.

## Ollama local question generator
Webmaster tools are currently an empty placeholder. Their contents and capabilities will be defined in a future implementation.

## Firebase
Set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`. Project ID defaults to `quickrn-e4d45`.

- Email/password registration and sign-in use Firebase Authentication.
- Completed and correct question IDs are stored under `users/{uid}/progress/default`.
- Signed-in learners can read published questions. Question authoring and administrator privileges are not included in this repository version.
- 
## Question content
Generated items are study drafts and are not official NCLEX questions or clinically validated material. Review and edit before publishing. Do not use this app as a substitute for current clinical guidance or professional judgment.

## Vercel deployment
Set the Firebase `VITE_FIREBASE_*` values in the Vercel project's Environment Variables, then redeploy. Add the deployed domain to Firebase Authentication's authorized domains. Ollama generation remains a local authoring feature unless a separately secured server-side model endpoint is deployed.

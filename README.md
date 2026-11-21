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
The admin Question Studio can call a local Ollama installation through the Vite dev-server proxy. This is intended for local authoring only, not for a deployed Vercel site.

1. Install Ollama from https://ollama.com/download.
2. Open a terminal and download a model, for example `ollama pull qwen2.5:7b`. Choose a smaller model if your computer has limited RAM/VRAM.
3. Check installed models with `ollama list`.
4. Start the QuickRN development server with `npm run dev`.
5. Sign in with a Firebase account that has the trusted `admin: true` custom claim.
6. Open Administrator tools → Question Studio → Connect Ollama.
7. Select a model, choose a topic and batch size, generate draft questions, inspect/edit the JSON, then publish.

The Vite proxy forwards `/ollama/*` to `http://127.0.0.1:11434/*`. It is active only in `npm run dev`; Vercel cannot access Ollama running on your personal computer. Never expose port 11434 publicly without a secure authenticated gateway. Ollama requests are made locally and do not require a cloud API key.

## Firebase
Set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`. Project ID defaults to `quickrn-e4d45`.

- Email/password registration and sign-in use Firebase Authentication.
- Completed and correct question IDs are stored under `users/{uid}/progress/default`.
- Learners can read only published questions; admin writes require a trusted Firebase custom claim `admin: true`.
- Set custom claims only in a trusted server environment using Firebase Admin SDK, never in browser code.

## Question content
Generated items are study drafts and are not official NCLEX questions or clinically validated material. Review and edit before publishing. Do not use this app as a substitute for current clinical guidance or professional judgment.

## Vercel deployment
Set the Firebase `VITE_FIREBASE_*` values in the Vercel project's Environment Variables, then redeploy. Add the deployed domain to Firebase Authentication's authorized domains. Ollama generation remains a local authoring feature unless a separately secured server-side model endpoint is deployed.

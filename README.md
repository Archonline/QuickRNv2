# QuickRNv2

A React + TypeScript + Vite NCLEX learning-platform prototype with Firebase Authentication and Firestore progress persistence.

## Local setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the Firebase Web App config.
4. Enable Email/Password in Firebase Authentication.
5. Create Firestore and deploy `firestore.rules` using Firebase CLI.
6. Run `npm run dev`; run `npm run build` to verify the production bundle.

## Firebase configuration
Set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`. The project ID defaults to `quickrn-e4d45`.

## Current capabilities
- Email/password registration and sign-in.
- Learner session protected by Firebase Authentication.
- Completed-question IDs saved to `users/{uid}/progress/default`.
- Firestore rules restrict learner progress to its owner.
- Learners can read only published question documents; admin writes require a trusted Firebase custom claim.

## Question content
Bundled questions are illustrative development items, not official NCLEX questions or clinically validated material. Admin publishing is controlled by the Firebase custom claim `admin: true`; set it only in a trusted server environment with the Firebase Admin SDK, never from client code.

## Deploy
Add the Firebase environment variables to Vercel for the desired environments, redeploy, and add the deployed domain to Firebase Authentication's authorized domains.

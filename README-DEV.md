# QuickRNv2 — development starter

React 19 + TypeScript + Vite student practice interface.

## Run locally
1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the Firebase web app configuration.
4. Run `npm run dev`; build with `npm run build`.

The app currently runs with a small local development question set. Items are explicitly marked as development examples and are not clinically validated or an official NCLEX question bank. Do not represent them as approved clinical content.

## Firebase
The Firebase initialization is optional until environment variables are configured. Existing project ID is prefilled as `quickrn-e4d45`; no Firebase resources, rules, data, or authentication settings were changed by this starter commit.

## Next implementation milestones
- Configure Firebase Authentication and role claims.
- Add Firestore question and attempt repositories with least-privilege rules.
- Add admin authoring/import workflow and review-state metadata.
- Add test coverage, analytics, accessibility checks, and deployment environment configuration.

Do not place service-account credentials or private keys in Vite environment variables. VITE-prefixed values are public client configuration.

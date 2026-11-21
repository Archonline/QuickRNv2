import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run set-admin -- learner@example.com");
  process.exit(1);
}
initializeApp({
  credential: applicationDefault(),
  projectId: process.env.GCLOUD_PROJECT || "quickrn-e4d45"
});
const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
console.log("Admin claim assigned to " + user.email + ". Sign out and sign in again to refresh the ID token.");

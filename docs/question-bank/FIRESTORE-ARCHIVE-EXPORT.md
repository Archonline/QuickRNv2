# Firestore question archive export

This is a read-only export. It does not publish, reject, modify, or delete any Firestore records.

## Requirements

- Node.js and npm
- Project dependencies installed with `npm install`
- A Google Cloud service account with Firestore read access (or Application Default Credentials)
- The Firebase project ID

## Run (PowerShell)

```powershell
$env:GOOGLE_CLOUD_PROJECT = "YOUR_FIREBASE_PROJECT_ID"
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\service-account.json"
npm install
npm run export:firestore-questions
```

The JSON archive includes every document in both `questions` and `questionDrafts`, regardless of status, including rejected, published, pending, and other draft states. It reconciles embedded question IDs against the current 600-item source bank and reports matching, Firestore-only, source-only, and duplicate IDs.

Identity fields such as creator/reviewer/reporter email are omitted from the committed archive. Question content, Firestore document IDs, statuses, and review metadata are retained.

The script writes `question-bank/archive/firestore-question-archive.json` by default. Review the generated archive and report before committing it. Do not commit the service-account JSON or any credential file.

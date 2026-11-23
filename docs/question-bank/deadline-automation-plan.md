# Deadline-driven question-bank automation

Deadline: Sunday, November 29, 2026, 23:59 Philippines time (2026-11-29T16:00:00Z).
Target: 3,600 combined items. Starting verified bank: 600. Net new accepted items required: 3,000.

The automation recalculates pace on every run from the remaining count and days remaining. It runs every three hours, generates in batches of up to 50, and allows up to 500 generation attempts per run. The average required throughput is approximately 450 net accepted items per calendar day across the Nov 23–29 window. The controller uses elapsed-time pacing: at every run it calculates the cumulative number that should already be accepted by that exact moment, then generates only the shortfall. This prevents every three-hour scheduled run from mistakenly generating a full day's quota. Each run is capped at 500 items.

Every record receives a unique sequential ID beginning at QRN-000547. The script checks required schema fields, IDs, supported item types and difficulty, rationale completeness, duplicate stems, and key interaction/answer consistency. Invalid records receive one targeted model repair pass. Items that still fail are excluded from accepted counts and recorded as rejected. Accepted batches and the automation manifest are committed to the repository.

Setup required: add the GitHub repository secret GEMINI_API_KEY. Workflow runs on Gemini 2.5 Flash. If the secret is absent, generation exits without creating mock questions. Trigger the workflow manually once to start immediately; scheduled runs repeat every three hours.

The automation tracks generated and structurally accepted content. It does not constitute independent clinical validation. Hot-spot items requiring unavailable real assets are rejected. Before learner release, the accepted batches still need mapping into the runtime Question type, integration with the combined bank export, and renderer regression tests.

# Deadline-driven question-bank automation

Deadline: Sunday, November 29, 2026, 23:59 Philippines time (2026-11-29T16:00:00Z).
Target: 3,600 combined items. Starting verified bank: 600. Net new accepted items required: 3,000.

The automation recalculates pace on every run from the remaining count and days remaining. It runs every three hours, generates in batches of up to 10, and allows up to 500 generation attempts per run. The average required throughput is approximately 450 net accepted items per calendar day across the Nov 23–29 window. The controller uses elapsed-time pacing: at every run it calculates the cumulative number that should already be accepted by that exact moment, then generates only the shortfall. This prevents every three-hour scheduled run from mistakenly generating a full day's quota. Each run is capped at 500 items.

Every record receives a unique sequential ID beginning at QRN-000547. The script checks required schema fields, IDs, supported item types and difficulty, rationale completeness, duplicate stems, and key interaction/answer consistency. Invalid records receive one targeted model repair pass. Items that still fail are excluded from accepted counts and recorded as rejected. Accepted batches and the automation manifest are committed to the repository.

The workflow installs Ollama on each ephemeral GitHub-hosted Linux runner, restores the model cache when available, and pulls the free local model `qwen2.5:7b-instruct`. No Gemini key, paid inference API, or Ollama cloud account is used. The generator calls the local Ollama HTTP API at `127.0.0.1:11434`. Trigger the workflow manually once to start immediately; scheduled runs repeat every three hours. Standard GitHub-hosted runners are CPU-only for this workflow, so actual throughput must be measured in Actions; a local free model removes API charges but does not guarantee the 3,000-item deadline.

The automation tracks generated and structurally accepted content. It does not constitute independent clinical validation. Hot-spot items requiring unavailable real assets are rejected. Before learner release, the accepted batches still need mapping into the runtime Question type, integration with the combined bank export, and renderer regression tests.

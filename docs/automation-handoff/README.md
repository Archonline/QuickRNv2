# QuickRNv2 safe Ollama handoff

## Purpose

This workflow replaces manual copying of batch instructions into GitHub with a durable, auditable handoff. Ollama is a messenger only: it reads the handoff and returns a receipt token. It does not generate, review, correct, or approve NCLEX questions.

## Flow

1. A completed batch produces or updates `ACTIVE_HANDOFF.txt`.
2. A push to `main` that changes `ACTIVE_HANDOFF.txt` or `TEST_HANDOFF.txt` starts **Ollama Handoff Wake-Up** on the Windows self-hosted runner.
3. The runner reads the file and asks the local Ollama model `qwen2.5:3b` to acknowledge receipt with the exact token `HANDOFF_READ_OK`.
4. The PowerShell script creates a deterministic next-step prompt in `outbox/`.
5. GitHub Actions commits the prompt. It does not send the prompt to ChatGPT or control a browser.
6. The user opens ChatGPT and submits the prepared prompt. The ChatGPT conversation remains responsible for question authoring and clinical audit.

## Files

- `ACTIVE_HANDOFF.txt`: production state; update only after a real batch is complete.
- `TEST_HANDOFF.txt`: harmless test fixture; must never consume production question IDs.
- `outbox/CHATGPT_NEXT_BATCH_PROMPT.txt`: prepared production prompt.
- `outbox/TEST_NEXT_BATCH_PROMPT.txt`: test-only output.
- `scripts/ollama-handoff-wake.ps1`: local Ollama receipt and deterministic prompt writer.
- `.github/workflows/ollama-handoff-wake.yml`: Windows self-hosted workflow.

## Requirements

- A GitHub Actions self-hosted Windows x64 runner registered for this repository and online.
- Ollama running locally at `http://127.0.0.1:11434`.
- The model `qwen2.5:3b` installed (`ollama pull qwen2.5:3b` if missing).
- The runner service account must be able to access the local Ollama service and repository workspace.
- The workflow's `GITHUB_TOKEN` needs contents write permission to commit the outbox prompt.

## Safe test

The `TEST_HANDOFF.txt` file uses a TEST mode and test-only markers. The generated prompt explicitly says not to generate clinical questions. The workflow must show `OLLAMA_HANDOFF_READ=PASS` and commit `outbox/TEST_NEXT_BATCH_PROMPT.txt`.

## Manual dispatch

GitHub → Actions → **Ollama Handoff Wake-Up** → Run workflow. Select TEST_HANDOFF first. Select ACTIVE_HANDOFF only when the production state is ready.

## Important limits

- This does not inject messages into the current ChatGPT conversation, create a new ChatGPT chat, upload attachments, or bypass ChatGPT account limits.
- The output prompt is prepared in GitHub for a user to submit in ChatGPT.
- If the Windows runner is offline, the job remains queued until the runner reconnects.
- If Ollama is unavailable, the workflow fails closed and does not publish a prompt.
- The model is intentionally not trusted to write the clinical task prompt; it only acknowledges reading the file. The script constructs the prompt from the handoff deterministically.
- Never put ChatGPT passwords, browser cookies, session tokens, Firebase service-account JSON, or API keys in handoff files.

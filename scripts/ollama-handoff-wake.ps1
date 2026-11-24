[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string]$HandoffPath,
  [string]$Model = "qwen2.5:3b",
  [string]$OllamaUrl = "http://127.0.0.1:11434"
)
$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$resolvedHandoff = Join-Path $repoRoot $HandoffPath
if (-not (Test-Path -LiteralPath $resolvedHandoff -PathType Leaf)) { throw "Handoff file not found: $HandoffPath" }
$handoff = Get-Content -LiteralPath $resolvedHandoff -Raw -Encoding UTF8
if ([string]::IsNullOrWhiteSpace($handoff)) { throw "Handoff file is empty." }
function Get-HandoffValue([string]$Text, [string]$Key) {
  $match = [regex]::Match($Text, "(?m)^" + [regex]::Escape($Key) + ":\s*(.+?)\s*$")
  if (-not $match.Success) { throw "Required handoff field missing: $Key" }
  return $match.Groups[1].Value.Trim()
}
$mode = Get-HandoffValue $handoff "MODE"
if ($mode -notin @("TEST", "PRODUCTION")) { throw "MODE must be TEST or PRODUCTION." }
$project = Get-HandoffValue $handoff "PROJECT"
$nextBatch = Get-HandoffValue $handoff "NEXT_BATCH"
$batchSize = Get-HandoffValue $handoff "BATCH_SIZE"
$nextId = Get-HandoffValue $handoff "NEXT_QUESTION_ID"
$target = Get-HandoffValue $handoff "TARGET"
$previousChat = Get-HandoffValue $handoff "PREVIOUS_CHAT_REFERENCE"
$tags = Invoke-RestMethod -Uri "$($OllamaUrl.TrimEnd('/'))/api/tags" -Method Get -TimeoutSec 15
$availableModels = @($tags.models | ForEach-Object { $_.name })
if ($availableModels -notcontains $Model -and $availableModels -notcontains ($Model + ":latest")) {
  throw "Required Ollama model '$Model' is not available. Installed models: $($availableModels -join ', ')"
}
$ackPrompt = @"
You are a file-receipt messenger, not a clinical question generator or reviewer.
Read the following QuickRN handoff text. Do not summarize it, change it, or create questions.
Reply with exactly this token and nothing else: HANDOFF_READ_OK
--- HANDOFF BEGIN ---
$handoff
--- HANDOFF END ---
"@
$payload = @{ model = $Model; prompt = $ackPrompt; stream = $false; options = @{ temperature = 0 } } | ConvertTo-Json -Depth 8
$ollamaResponse = Invoke-RestMethod -Uri "$($OllamaUrl.TrimEnd('/'))/api/generate" -Method Post -ContentType "application/json" -Body $payload -TimeoutSec 180
$ack = ([string]$ollamaResponse.response).Trim()
if ($ack -ne "HANDOFF_READ_OK") { throw "Ollama did not return the required receipt token. No prompt was published. Response: $ack" }
$outDir = Join-Path $repoRoot "outbox"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
if ($mode -eq "TEST") {
  $outPath = Join-Path $outDir "TEST_NEXT_BATCH_PROMPT.txt"
  $prompt = @"
QUICKRN HANDOFF PIPELINE TEST — NOT A PRODUCTION GENERATION REQUEST
This is a system test only. Do not generate clinical questions and do not change production question IDs.
Expected handoff:
Project: $project
Test batch marker: $nextBatch
Test item marker: $nextId
Configured batch size: $batchSize
Project target: $target
Previous-chat reference: $previousChat
Ollama successfully read the handoff and returned HANDOFF_READ_OK.
GitHub Actions prepared this deterministic test prompt.
"@
} else {
  $outPath = Join-Path $outDir "CHATGPT_NEXT_BATCH_PROMPT.txt"
  $prompt = @"
QUICKRNv2 — NEXT BATCH WAKE-UP PROMPT
Read the complete handoff below before doing any work. Treat the GitHub handoff as the durable project state. The previous ChatGPT conversation may not be accessible, so do not assume you can see it.
PROJECT: $project
NEXT BATCH: $nextBatch
BATCH SIZE: $batchSize
NEXT QUESTION ID: $nextId
TARGET: $target
PREVIOUS CHAT REFERENCE: $previousChat
YOUR ROLE:
You are responsible for all NCLEX-RN question authoring, clinical reasoning, audit, correction, re-audit, and finalization. Ollama is only the messenger that reads handoff files and triggers this prepared prompt. Do not delegate clinical generation or review to Ollama.
PRODUCTION RULES:
1. Read and reconcile the handoff against the current repository archive and tracker before assigning IDs or claiming counts.
2. Generate the requested next batch only. Never invent completed work or claim a question was saved unless the save is verified.
3. For each question, perform one integrated cycle before moving to the next: construct to the QuickRN schema; audit clinical safety, NCLEX-RN alignment, answer defensibility, distractors, scoring, rationale, schema and available duplicate inventory; fix defects; re-audit; then mark FINALIZED-DRAFT or BLOCKED.
4. Do not defer a second batch-wide audit/fix cycle. Do not count blocked items toward the target.
5. Preserve actual NGN format distribution and domain coverage from the handoff. Avoid duplicate scenarios.
6. Keep all content as draft pending qualified independent clinical review. Never claim independent clinical approval or publication.
7. At the end, create the next handoff text file with the next batch number, next unused question ID, cumulative counts, blocked items, repository paths, and a reference to this ChatGPT conversation. Do not create a fabricated conversation URL; use a clearly labelled placeholder if no URL is available.
8. Save the updated handoff in the repository or provide the exact file contents and path for the user to commit.
HANDOFF CONTENT:
$handoff
"@
}
Set-Content -LiteralPath $outPath -Value $prompt -Encoding UTF8
Write-Host "OLLAMA_HANDOFF_READ=PASS"
Write-Host "HANDOFF_MODE=$mode"
Write-Host "PROMPT_FILE=$([System.IO.Path]::GetRelativePath($repoRoot, $outPath))"
Write-Host "PROMPT_BYTES=$((Get-Item -LiteralPath $outPath).Length)"

# FounderGraph external services

No module may depend on a service until Wave-0 preflight records a real successful call and its fallback in `docs/ops/PREFLIGHT.md`. **All key availability is assumed — prove at preflight** (the secrets registry was unreadable in the design session; suite design §5). Source: `VC-BRAIN-PLAN.md` §0.5 Wave 0 + open items; §4; §9; §14.

## Preflight record required for every dependency

Each `docs/ops/PREFLIGHT.md` entry shall record:

| Field | Required value |
|---|---|
| Service/dependency | LLM provider, ElevenLabs, GitHub access mode, or PDF parser |
| Date/time | Actual spike time |
| Environment | Local demo environment |
| Credential status | Proven, absent, not required, or quota failure — never the secret value |
| Real input | Non-secret description + local artifact/provenance locator |
| Real operation | Exact product operation exercised |
| Result | Success or failure with non-secret response metadata |
| Persisted proof | Local path to captured replay/output + validation result |
| Fallback proof | Exact fallback run and pass/fail |
| Owner | TBD (owner: human) |
| Gate decision | Enable live path, replay/precompute only, or remove dependency |

A screenshot or fabricated sample is not a substitute for a real call. Replay artifacts must come from that real call (plan §0.5 d3 + Wave 0).

## LLM API

| Field | Requirement |
|---|---|
| Provider | OpenAI or Anthropic. Selection: TBD (owner: human). |
| Product uses | Claim/evidence extraction (call 1); axes + memo writing (call 2); graph-grounded chat; R1 cross-founder query if retained |
| Call shape | Calls 1–2 return zod-validated structured output. Chat streams over SSE. R1 returns ranked opportunity IDs + rationale + citations. |
| Inputs | Repo scan/deck text (extraction); Memory/thesis/claims/scores (axes+memo); opportunity graph + optional node/selection context (chat); all founders' ScreeningFacts (R1) |
| Outputs | Enriched graph, Claim/Evidence records, axis rationales, Memo, cited chat answer or refusal, cited ranked query results |
| Credential | `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` — assumed, prove at preflight |
| Preflight proof | One real structured extraction on the hero input; schema validation; provenance capture (prompt version, raw response, timestamp, commit SHA when available) |
| Fallback | One repair attempt, then captured real replay. R1 cuttable. Rehearsed chat path keeps a captured cited answer for offline use. |
| Blocks | Wave 0 capture; M2 extractor; M4 axes/memo + chat + optional R1 |
| Failure state | Named service-unavailable / invalid-response state; the app never invents output |
| Cost | Limit + alert threshold TBD (owner: human); no price or quota assumed |
| Source | Plan §0.5 d2/d3/d7/d12; §4; §7 Wave 0/M2/M4; §8; §9; §14 |

### LLM acceptance

1. Structured output passes the schema.
2. Invalid output triggers exactly one repair.
3. A second invalid result switches to replay.
4. Chat completes with citations or refuses.
5. No raw model JSON appears in R5.
6. Request counts distinguish the two structured jobs from chat and R1 (NFR-COST-02).

## ElevenLabs

| Field | Requirement |
|---|---|
| Product use | Generate the hero investment brief once during Wave 0; play the pre-rendered MP3 in M5b — committed, never cut |
| Committed behavior | Local MP3 playback with play/pause; script uses stored memo/score/Trust values and states uncertainty ("two claims unsupported") |
| Non-committed | Live TTS only if trivially green; realtime conversational graph voice is stretch-only (20:50 BST ruling) |
| Credential | `ELEVENLABS_API_KEY` (+ optional voice ID) — assumed, prove at preflight. **Team note: credits were redeemed via a dashboard questionnaire and worked for some accounts only — preflight must confirm WHICH account's key is live** (suite design §5). |
| Preflight proof | One real TTS request returning the hero brief audio; persist the MP3 + non-secret request metadata; read the saved file through the app |
| Fallback | Exact text script + "voice unavailable". The golden path never calls live TTS. |
| Blocks | Wave 0 generation; M5b playback |
| Failure state | Audio unavailable with readable script; no retry loop |
| Cost | Limit + alert threshold TBD (owner: human) |
| Source | Plan §0; §0.5 d8 + Wave 0 + M5b + open items; §1b; §4; §7 M5b; §8; §14; §17 |

### ElevenLabs acceptance

1. Preflight proves one real audio generation or records the dependency as unavailable (proven or killed in the spike — plan §0.5 open items).
2. The saved MP3 plays without network access.
3. Removing the MP3 produces the text fallback.
4. A missing key does not break Diligence.
5. Realtime voice remains absent unless all committed scope is green.

## GitHub

| Field | Requirement |
|---|---|
| Product uses | Repo clone or API read for analysis; one real sourcing scan captured at Wave 0 (thesis→topic query + signal scoring: star velocity, commit recency, no-org = pre-fundraise); one live small-repo path if retained |
| Stage behavior | R7 Scan reads `data/replay/scan/` — never a network call on stage |
| Credential | `GITHUB_TOKEN` optional (rate limits) — assumed, prove at preflight |
| Preflight proof | Read the hero/small repo, record source identifier + commit SHA when available; run the real sourcing scan; persist non-secret scan provenance + threshold result |
| Fallback | Pre-cloned repo, precomputed graph, captured scan replay |
| Blocks | Wave 0 capture; M2 analysis + replay UI |
| Failure state | Repo/scan unavailable with precomputed/captured fallback identified |
| Remote writes | None — the plan defines no GitHub write, issue, comment, or mutation |
| Cost | No monetary budget asserted; rate-limit threshold TBD (owner: human) |
| Source | Plan §0.5 d3/d5/d12 + Wave 0 + cut ladder; §2; §4; §7; §8 `/api/scan`; §11; §14 |

### GitHub acceptance

1. Preflight proves a real repo read + captured source provenance.
2. Preflight proves the real sourcing scan before the replay is accepted.
3. R7 replay is deterministic with outbound network disabled.
4. The demo never labels replay as a live scan.
5. No smoke test fabricates a GitHub write capability.

## PDF parser

| Field | Requirement |
|---|---|
| Dependency | `pdf-parse` — a local library, not a remote API |
| Product use | Extract hero deck text + slide-linked claims for Evidence locators |
| Credential | None |
| Preflight proof | Parse the real hero deck; validate usable output; link extracted claim text to slide locators. Parser fails ⇒ pre-extracted slides JSON, no ceremony (plan §0.5 Wave 0). |
| Fallback | Pre-extracted slides JSON, explicitly labeled as fallback |
| Blocks | Wave 0 parse; M2 graph/claim integration |
| Failure state | Parse unavailable/invalid, followed by validated slides JSON |
| Writes | Persist parser output or fallback JSON locally; read it through analysis. No remote write. |
| Cost | No service charge asserted |
| Source | Plan §0.5 Wave 0; §4; §7 Wave 0/M2; §13 |

### PDF acceptance

1. The real hero PDF produces usable slide text or records a parse failure.
2. Extracted claims point to slide locators.
3. Fallback JSON passes the same downstream schema.
4. The UI distinguishes unavailable source material from an unsupported claim.

## Dependency gate by block

| Block | Live dependency permitted after preflight | Required fallback before block closes |
|---|---|---|
| M0 | None required | Empty pages + config load without any keys |
| Wave 0 | Selected LLM, ElevenLabs, GitHub access, PDF parser | Captured LLM replay; hero MP3 + text script; pre-cloned repo + scan replay; pre-extracted slides JSON |
| M1 | None | Seeded SQLite pipeline |
| M2 | LLM extraction + repo/PDF reads if retained | Precomputed graphs, deck claims, provenance replay |
| M3 | None — score/Trust math is deterministic | Seeded claims/evidence + deterministic fixtures |
| M4 | LLM axes/memo/chat + optional R1 | Captured memo/axes + one cited chat replay; R1 cuttable |
| M5b | No live call required | Pre-rendered MP3 + text script |

## Read/write cadence interpretation

The suite design asks for "one real read + one real write per external service at each build block" (checkpoint cadence, design §1). The locked plan gives services to specific blocks only, defines no GitHub remote write, and treats PDF parsing as local. This suite does not invent remote mutations: for smoke purposes, "write" = persist the real service result into an app-owned artifact (replay, DB row, graph, slides, memo, audio) and read it back; blocks with no service dependency are N/A. Confirmation: TBD (owner: human) — also flagged in 07-smoke-tests.md.

## Out of scope

- Any LLM provider capability not proved by preflight.
- Live stage-time GitHub sourcing, GitHub remote writes, email, outreach delivery.
- Live TTS as a golden-path dependency; realtime voice; voice intake; outbound voice.
- Understand-Anything as a hosted service — it is a conditional source-code adaptation governed by LICENSE/NOTICE (plan §0.5 d10), not a runtime external service.

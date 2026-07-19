# PREFLIGHT — production pipeline live on Render (2026-07-19)

Goal: `/apply` submits a real public repo → live LLM pipeline (ingest→graph→claims→scoring→memo) → viewable opportunity; whole app deployed live on Render. Verdict: READY (6 decisions answered at plan gate).

## Forced decisions (human-answered at gate, defaults taken)
1. Deploy: lead prepares `render.yaml` + click-steps; HUMAN connects repo + deploys (Render login). No Render API key on this machine.
2. `ANTHROPIC_API_KEY`: human provides + sets on Render. Required for real LLM; absent → replay mode only.
3. Analyze execution: ASYNC job + "analyzing…" status + client poll (survives Render request timeout). Not synchronous.
4. Repo scope: PUBLIC repos only — plain `git clone` (no auth). Private repos out of scope.
5. Branch: merge `dispatch/lovable-frontend` → `main`; deploy `main`.
6. Cost guard: cap flattened-repo input (~80k chars, as Wave-0 spike) + bounded `max_tokens` per analyze; one submission can't run away on Opus pricing.

## Can't-do / risks to respect
- Real repo analysis = minutes + real Opus tokens → MUST be async (decision 3), else Render 502/timeout.
- User-supplied repo URL is an SSRF / arbitrary-clone attack surface → red-team gate (Wave 2): allowlist `https://github.com/<owner>/<repo>` shape, reject non-github hosts, no shell-injection via URL, clone to a temp dir, size cap.
- Ephemeral Render FS: async job state must live in the SQLite DB (an opp status column), not in-memory, or it's lost on restart. Seed-on-boot resets demo data; real submissions persist only for that instance's life (acceptable for demo).
- better-sqlite3 native build handled by `.npmrc` (from-source) + `.nvmrc` 26; Render build must keep them.
- Claude API path type-checks; live call pending key (smoke script `scripts/llm-smoke.mjs`).

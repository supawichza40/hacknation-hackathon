# PREFLIGHT — VC Brain (Challenge 02) — 2026-07-19

Wave-0 build preflight for the single Next.js app scaffolded in this repo (VC-BRAIN-PLAN.md §0.5, §6).
Forced decisions were answered at the plan gate; this file records the proof and carries the unprovable
items forward as Wave-1 definition-of-done gates. Template: `docs/ops/PREFLIGHT.md`.

## Verdict: READY (0 decisions open — plan-gate decisions recorded below; 5 Wave-1 gates carried forward)

| Class | Instance | Status | Evidence |
|---|---|---|---|
| 1 External reality | Local `claude` CLI headless (LLM calls; no API key on this machine) | PROVEN | `which claude` → `/Users/…/.local/bin/claude`; `claude --version` → `2.1.214 (Claude Code)` (2026-07-19). Headless call shape (`claude -p … --output-format json`) proven at Wave-0 spike, captured as provenance replay. |
| 1 External reality | better-sqlite3 native module (Memory store) | PROVEN | `node -e "import Database … new Database(':memory:') … INSERT/SELECT"` → `sqlite roundtrip: 42` (real write + read-back, 2026-07-19). `allowScripts` grants native build in package.json. `serverExternalPackages:["better-sqlite3"]` set in next.config.ts. |
| 1 External reality | zod (LLM response validation) | PROVEN | `node -e "z.string().parse('ok')"` → `zod ok: ok` (2026-07-19). |
| 1 External reality | ElevenLabs TTS (P0 voice brief MP3) | DEFERRED | Plan-gate decision: no ElevenLabs tonight. Key/quota proven-or-killed in the Wave-0 spike (VC-BRAIN-PLAN §0.5 open items); text fallback if key missing. Not on the M0 dependency path. |
| 1 External reality | Understand-Anything (UA) graph pipeline, Mode B adaptation | UNPROVEN (hour-0 task) | License/NOTICE check is an hour-0 task (§0.5 d10). Not a live call; adapted code lands in `src/lib/graph`. If license blocks or >45 min → slim self-written pipeline. |
| 2 Cold-boot proof | `npm run dev` from clean `.next` → all 5 routes serve | PROVEN | Fresh boot on :3112 after `rm -rf .next`; `curl` → `200` on `/`, `/opportunities/hero`, `/opportunities/hero/graph`, `/apply`, `/login`; server log clean (no ⨯/500). Content renders (e.g. `/apply` → "Inbound founder application"). |
| 2 Cold-boot proof | `.env` canary round-trips into runtime config (loud assert, no silent fallback) | WAVE-1 GATE | No runtime reads `.env` yet (skeleton only). `.env.example` committed. Becomes a DoD item when the first config consumer (DATABASE_PATH / CLAUDE_CLI_BIN) lands. |
| 3 Decision forcing | Plan-gate forced decisions | RESOLVED | Single Next.js app in repo root · better-sqlite3 (no ORM) · LLM via local claude CLI headless · no ElevenLabs tonight · demo-lite auth (§0.5 d13). All answered before fan-out. |
| 3 Decision forcing | Submission form live-URL requirement | OPEN → M0 task | Checked at the M0 platform-draft step (§0.5). Decides whether a deploy target is needed; not an M0 scaffold blocker. |
| 4 Contract freezing | LLM response schemas (extractor, memo), provenance-replay JSON, graph schema | WAVE-1 GATE | Multi-agent (dispatch) build → these producer/consumer boundaries must be zod-checked (throw on unknown/missing keys) and committed BEFORE feature fan-out. Not built in M0. |
| 5 State completeness | 4 surfaces (Pipeline / Diligence / Graph / Apply) + Login | PARTIAL → WAVE-1 GATE | All 5 routes scaffolded as placeholder pages; Login is the unauthenticated screen (counted). loading/empty/error states per golden-path screen are Wave-1 (DESIGN.md §1). |
| 6 Gates at zero | Test/lint/typecheck run on empty scaffold | WAVE-1 GATE | No test runner wired (`npm test` is a stub echo). Wire coverage + typecheck as a DoD gate before feature waves; keep test-env off live services. |
| 7 Environment preflight | Interpreters on PATH, port free, one build round-trip | PROVEN | node v26.3.1, npm 11.16.0, next 16.2.10; `npm run dev` boots and serves (round-trip above); port freed after test (`lsof -ti:3112` → free). Runner scripts + spawn prompts prefix `export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"`. |
| 8 Artifact durability | Binding decision/design docs committed | PROVEN | This PREFLIGHT.md committed to repo root; VC-BRAIN-PLAN.md, docs/ops/DESIGN.md (frozen §2 tokens), docs/ops/RUBRIC.md all tracked in-repo. No design authority in scratchpads. |

## Forced decisions (answered at plan gate — no open items block fan-out)
1. App shape — **Single Next.js 15+ App Router app in repo ROOT** (`src/app`, `src/lib`), no monorepo/packages. ✅
2. Persistence — **better-sqlite3, no ORM, no Postgres branch** (native module proven). ✅
3. LLM access — **Local `claude` CLI headless**, every response zod-validated + one repair + provenance replay fallback. No API key on this machine. ✅
4. Voice — **No ElevenLabs tonight**; P0 pre-rendered MP3 handled at the Wave-0 spike; text fallback always. ✅
5. Auth — **Demo-lite** (§0.5 d13): one hard-coded investor login + public founder `/apply`, session cookie separates roles. No real user management. ✅

## Wave-1 gates carried forward (now definition-of-done items, not preflight blockers)
- **Class 2** — `.env` canary (DATABASE_PATH / CLAUDE_CLI_BIN) round-trips into runtime config with a loud assert (no silent fallback) the moment the first consumer lands.
- **Class 4** — Freeze + commit zod schemas for the two LLM calls, provenance-replay JSON, and graph schema BEFORE feature fan-out; every worker spawn prompt says "Read PREFLIGHT.md first".
- **Class 5** — Each golden-path screen ships loading / empty / error states; the unauthenticated (login-gated) state is a real screen.
- **Class 6** — Wire test runner + typecheck + coverage on the scaffold; test-env must not reach live services.
- **Class 1 (UA)** — Hour-0 UA LICENSE/NOTICE check; fall back to slim self-written pipeline if blocked or >45 min.

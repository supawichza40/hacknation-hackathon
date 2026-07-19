# FounderGraph — final verify report (2026-07-19)

Scope: final DoD reconciliation + authoritative gate run + status boards. No product-code changes.
Runtime: Node **v26.3.1** (ABI 147), `PATH=/opt/homebrew/bin:$HOME/.local/bin:$PATH`. Branch `dispatch/lovable-frontend`.

## 1. Golden-path smoke (`npm run smoke:golden`, offline)

Seed: `Seeded 4 opportunities (3 visible), 4 evidence rows`. Outbound network disabled (`globalThis.fetch` throws). **13/13 beats PASS.**

| # | Beat | Result | Evidence |
|---|---|---|---|
| 1 | `pipeline-visible` | PASS | 3 visible cards (brightcart, ecc, lattice); `pipewarden.visible=0` |
| 2 | `scan-reveals-pipewarden` | PASS | Tavily scan replay; topScore 0.8112; visible 0→1 |
| 3 | `thesis-toggle-brightcart` | PASS | off-thesis on checkSize; widening un-greys |
| 4 | `r1-query-improving` | PASS | ECC cited via `score-history://opp-ecc/2025-10-01` |
| 5 | `diligence-three-axes` | PASS | founder, market, idea_vs_market — separate |
| 6 | `diligence-memo-not-disclosed` | PASS | 7 "not disclosed" gaps |
| 7 | `diligence-one-contradiction` | PASS | exactly 1 contradicted claim |
| 8 | `contradiction-resolves-slide4-graph` | PASS | `deck://ecc/slide/4` + graph `the-longform-guide.md:99-101` |
| 9 | `graph-ecc-42-nodes` | PASS | 42 nodes / 49 edges |
| 10 | `tour-ordered-steps` | PASS | R8 tour, 7 ordered steps |
| 11 | `chat-cited-or-refusal` | PASS | 3 rehearsed cited; ungrounded refused |
| 12 | `decision-invest-persists` | PASS | verdict=invest, read back from DB |
| 13 | `apply-creates-inbound` | PASS | inbound `opp-apply-*` created |

Planned demo set: `opp-ecc`, `opp-lattice`, `opp-brightcart`, `opp-pipewarden` (3 shown + 1 hidden inbound).

## 2. `npm run check:done` — 7-gate authoritative result (post-commit)

Gates (a–g) from `scripts/check-done.mjs`. Result of the authoritative run after committing the doc/board edits:

| Gate | Name | Result |
|---|---|---|
| a | test — `npm test` | _pending authoritative run_ |
| b | typecheck — `tsc --noEmit` | _pending authoritative run_ |
| c | build — `npm run build` | _pending authoritative run_ |
| d | smoke:golden — offline golden path | _pending authoritative run_ |
| e | artifacts — schema + dangling IDs + demo set | _pending authoritative run_ |
| f | secrets — no live keys in tracked/untracked files | _pending authoritative run_ |
| g | push-state — clean tree pushed to origin branch | _pending authoritative run_ |

## 3. DoD Layer-1 tally by rubric axis

| Rubric axis (weight) | Checked | Notes |
|---|---|---|
| Data Architecture & Intelligence (30%) | 9 / 10 | open: cold-start caveat (no explicit pre-track-record demonstration verified) |
| Intelligent Analysis & Trust (25%) | 8 / 8 | all satisfied incl. wow-moment contradiction jump |
| Investment Utility & Execution (30%) | 8 / 9 | open: pre-rendered ElevenLabs MP3 not built (text fallback present) |
| UX & Design (15%) | 4 / 9 | 5 open are human-eyeball/subjective + 1 cold-start state; Graph/tour/one-scroll/Apply-optional confirmed |
| **Total Layer-1** | **29 / 36** | 5 of 7 open items are human-eyeball or unbuilt-MP3; only cold-start is a candidate real functional gap |

## 4. Demo risks / still-open (ranked)

1. **[HIGH — env, demo-breaking] `better-sqlite3` ABI mismatch.** The prebuilt binary was Node 22 (ABI 127); the prescribed runtime is Node 26.3.1 (ABI 147). Under Node 26 every DB path crashed (`ERR_DLOPEN_FAILED`) until I ran `npm rebuild better-sqlite3` (node_modules only, no tracked change). Any later `npm install`/`npm ci` re-fetches the ABI-127 prebuilt and re-breaks the app + gate under Node 26. **Demo/gate machine must run `npm rebuild better-sqlite3` on Node 26 (or pin one Node version) before the demo.**
2. **[MED — process] push-state gate stays red while the swarm is active.** At reconcile time the tree held uncommitted non-mine files (`data/demo/memos/ecc/memo.json`, `data/replay/memo/{provenance,raw-model-output}.json`, `overnight-build.run-state.json`, untracked `lovable/Founder Graph Core/package-lock.json`). Gate (g) requires a clean tree == origin; it clears only when workers quiesce and the lead does the final clean commit + push.
3. **[MED] ElevenLabs voice-brief MP3 not built** (committed/never-cut item). Text-script fallback is present; needs a live key/credits.
4. **[MED] 2×60s demo + tech videos not recorded** — feature-freeze deliverable, Communication axis.
5. **[LOW-MED] Cold-start demonstration unverified** — 4/5 pipeline states present (inbound/outbound/off-thesis/returning); cold-start absent. Either an unlabeled state or a real gap.
6. **[LOW] Final UX eyeball** at demo viewport not done (rubric "intuitive, clear, beautifully designed").
7. **[LOW] Live-URL submission requirement** unconfirmed against the platform form.

## 5. Verdict

Product golden path is **green and offline-stable** (13/13 smoke). Layer-1 is 29/36 with the 7 open items concentrated in human-eyeball UX + unbuilt media, not functional defects. The two things that can break the demo are operational, not product: the Node/better-sqlite3 ABI pairing (mitigated by rebuild, must hold at demo time) and a final clean push once the swarm quiesces.

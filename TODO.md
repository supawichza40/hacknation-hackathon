# TODO.md — Status Board

Claude updates this at every phase boundary and after every autonomy-window decision. The human reads this board instead of asking "is it done?" / "is this still running?".

## Current state

| Field | Value |
|---|---|
| **Event clock** | reveal 12:50–13:00 ET · hacking begins 2026-07-18 13:00 ET (kickoff-deck correction) · deadline: 2026-07-19 09:00 ET · finals: 2026-07-25 12:00 ET |
| **Challenge (locked)** | **02 — The VC Brain** · ElevenLabs = voice brief layer only (not Challenge 01) |
| **Phase** | **Phase 6 — frozen submission runway** (2026-07-19 10:20 BST). Browser-verified golden path + card-click fix shipped; submission pack ready: [SUBMISSION-COPY.md](docs/ops/SUBMISSION-COPY.md) + `~/Desktop/foundergraph-submission.zip` + `~/Desktop/foundergraph-report.pdf`. HUMAN: flip repo public → draft submission → record 3 videos (hook stat = "118 hours", HBR) → upload → confirm submitted before 09:00 ET |
| **Product plan** | [VC-BRAIN-PLAN.md](VC-BRAIN-PLAN.md) |
| **Golden path status** | GREEN — `smoke:golden` 13/13 beats offline on Node 26.3.1; DoD Layer-1 29/36 (7 open = human-eyeball UX / unbuilt MP3 / cold-start) |
| **Last push** | render-live wrap @ 2026-07-19 13:40 BST — commit `6660652` on BOTH `dispatch/lovable-frontend` AND `main` (fast-forwarded). check:done 7/7. Red-team /apply: NO CRIT, all findings patched. Remaining: HUMAN Render deploy (Blueprint on main → set ANTHROPIC_API_KEY + demo creds), then live verify — run-state: docs/dispatch/plan-dialogue/2026-07-19-render-live-pipeline.run-state.json |
| **Demo video** | not recorded |
| **Submission** | not drafted (projects.hack-nation.ai — due Sun 2026-07-19 09:00 ET) |

## Now / Next / Done

### Now
- [x] **⚠️ READ FIRST: two-model debate verdicts (2026-07-19 08:15 BST)** — Fable 5 × GPT-5.6 Sol verified the circulating "swarm audit"; most P0s stale/wrong, corrections applied + merged to main. Carries WARNINGS every session must read (Node-26/better-sqlite3 ABI, lovable=bun-not-npm, f7f6069 false `data/graphs/` evidence — fixed, half-done claim-id migration left uncommitted): [debate-verdicts](docs/dispatch/plan-dialogue/2026-07-19-debate-verdicts.md)
- [ ] **Tavily sourcing integration (NEW 2026-07-19)** — Tavily = live founder-sourcing engine, displaces GitHub R7 scan (decision: BACKLOG row 13; docs updated across suite). **Blocked on human:** redeem code `HackNationJuly` at tavily.com → Billing → Project plan (8,000 credits) → paste key so it lands in secrets registry + `.env`. Then Wave-0 spike: real `/search` + `/research` → capture to `data/replay/scan/` (PREFLIGHT row). Wins "Best Use of Tavily" prize (10k/5k/3k credits).
- [ ] **Lovable prototype build (dispatch job, branch `dispatch/lovable-frontend`)** — driving Lovable MCP per [brief](docs/product/09-lovable-frontend-brief.md) against [DoD](docs/product/10-lovable-dod.md). Project `a7405de7`, preview https://id-preview--a7405de7-87c8-48fc-803a-8a8f89f404ed.lovable.app. Stage 1 (foundation+data) done; Stage 2 (Pipeline) building. Sol audit folded. Log: [dialogue](docs/dispatch/plan-dialogue/2026-07-19-lovable-frontend.md)
- [x] Submission deliverables updated per event-info: 2×60s videos + 1-page report + zip (see [SUBMISSION.md](docs/ops/SUBMISSION.md)) — applied 2026-07-18
- [ ] Apply debate-v3 adds R1–R7 (+4.5h) per VC-BRAIN-PLAN §0.5 decision 12 — slots: Wave-0/M1/M2/M4
- [ ] Requirements suite FIRST (8 docs per [design doc](docs/superpowers/specs/2026-07-18-vc-brain-requirements-design.md): use cases, journeys, FR, NFR, screen map, external services, smoke tests, DoD) — docs-first sequencing confirmed by human 20:55 BST; this suite REPLACES the old docs/specs/01–08 plan
- [ ] Then scaffold FounderGraph app per VC-BRAIN-PLAN §0.5 — in THIS repo (human ruling 20:55 BST)
- [x] Fill [docs/ops/RUBRIC.md](docs/ops/RUBRIC.md) §1–2 — DONE 2026-07-18 (§1–§4 all filled via event-info integration; cross-ref + agentic-framing fixes 2026-07-19 00:37 BST)

### Next
- [ ] Seed demo founders + precompute 3 knowledge graphs
- [ ] Scoring → Trust → Memo → Decision golden path
- [ ] Submission draft on projects.hack-nation.ai (G1)

### Done (newest first)
- [x] Repo reorganized: ops/product/research under `docs/`; root cleaned (2026-07-18)
- [x] VC Brain product plan → VC-BRAIN-PLAN.md (repo root)
- [x] Challenge briefs in Topics/ (01–06)
- [x] Research → docs/research/; participant PDF in HackathonMaterials/

## Decisions

| Time | Decision | Reasoning | Needs human review? |
|---|---|---|---|
| 2026-07-18 | Build Challenge 02 VC Brain; use Understand-Anything as reference, not a clone | Best fit for knowledge-graph stack | No |
| 2026-07-18 | Add ElevenLabs as voice brief/intake on VC Brain; do **not** submit as Challenge 01 | Sponsor visibility without abandoning Maschmeyer brief | No |
| 2026-07-18 20:20 BST | Scope tension resolved (human): Challenge 02 stays; repo-understanding ("Understand any repo", [team discussion](docs/product/TEAM-DISCUSSION-2026-07-18.md)) integrated as selling point inside diligence Graph/Chat tabs, not a track switch | Team debate was unresolved; human chose hybrid — keeps scope lock, reuses team's agreed features | No |
| 2026-07-18 20:20 BST | Requirements suite design approved: JTBD framing, investor-primary personas, inbound golden path, demo-lite auth, checkpoint smoke tests, 3-layer Definition of Done → [design doc](docs/superpowers/specs/2026-07-18-vc-brain-requirements-design.md) | Answers "how customer gains most" before scaffold; feeds dispatch fan-out for 8 docs | Review design doc |
| 2026-07-18 20:25 BST | Understand-Anything role upgraded (human): **core functionality** of VC Brain — its graph pipeline + grounded chat ARE the diligence engine (founder repos/materials in, knowledge graph + Q&A out), not just a reference implementation | Human clarification after [team discussion](docs/product/TEAM-DISCUSSION-2026-07-18.md); supersedes "reference, not a clone" wording above | No |
| 2026-07-18 20:30 BST | Scope addition (human, explicit override): streaming chat + node-click "Ask about this" + text-highlight-to-ask added as requirements in VC-BRAIN-PLAN (§M2, §12, §17); ElevenLabs P2 realtime voice chat upgraded nice→committed, keeping §0 cut-to-P0 fallback | Human: "add these into the functionality requirement so this get implement" — fills gaps found vs Understand-Anything plugin | No |
| 2026-07-18 20:40 BST | Dual-model debate complete (Fable council vs GPT-5.6 sol council, Delphi rebuttal): VC-BRAIN-PLAN **§0.5 LOCKED EXECUTION PLAN v2** — compressed 13h build order, ~40% surface cut, Wave-0 real spike gate, 2-call LLM architecture, epistemic-integrity rules, builder-as-hero real anchor, named contradiction wow moment. Log: [plan dialogue](docs/dispatch/plan-dialogue/2026-07-18-vc-brain-debate.md) | 22 objections + 13 counters → 19 plan changes; both models independently verdict: 24h map unshippable in remaining window | Resolved 20:50 BST (row below) |
| 2026-07-18 20:45 BST | (parallel session, interim) chat trio committed; ALL voice incl. pre-rendered MP3 marked "optional garnish" | Interim only — **superseded by 20:50 ruling below** on the MP3 point | No |
| 2026-07-18 20:50 BST | **FINAL scope ruling (human):** streaming graph-grounded chat + node-click "Ask about this" + text-highlight-to-ask = COMMITTED (built in M4, bottom of cut ladder, not gated on 01:00 ET); ElevenLabs realtime conversational voice = OPTIONAL stretch only if time remains; pre-rendered MP3 "Play investment brief" stays committed/never-cut | Human: "we include the streaming chat, contextual ask and make realtime voice optional only when enough time" — resolves 20:30-additions vs debate-§0.5 conflict | No |
| 2026-07-18 20:55 BST | Three reconciliation rulings (human): (1) requirements suite REPLACES docs/specs/01–08 as the spec system; (2) app scaffolds in THIS repo, no separate `foundergraph` repo; (3) docs-first sequencing — requirements suite before scaffold | Audit surfaced competing spec systems, repo ambiguity (§18), and sequencing tension; human picked at reconciliation gate | No |
| 2026-07-18 21:00 BST | Doc reconciliation applied: dual-model audit (Fable 5 + GPT-5.6 sol, independent, Delphi-merged; 37+ findings) → all living docs rewritten to one consistent story per the rulings above; conflict banners removed | Human: "reconcile and update every doc so everything is inline" | No |
| 2026-07-18 22:35 BST | Second dual-model debate (Fable vs Sol) judged: R1–R7 added (+4.5h), A26 dropped to pitch line, pre-emptive cuts rejected, chat trio untouched | 34/34 brief coverage within 5h cap | No (human approved in chat) |

## HUMAN TODO (morning — before Sun 2026-07-19 09:00 ET)

1. **Source 1 real pitch stat** — a sourced problem number for the hook; drop into [PITCH.md](docs/ops/PITCH.md) and the `[STAT]` placeholder in [DEMO-SCRIPT.md](docs/ops/DEMO-SCRIPT.md).
2. **Record 2×60s videos** — demo (wow moment: contradiction → slide-4 + graph) and tech (stack, highlights, limitations). H.264 MP4.
3. **ElevenLabs voice-brief MP3** (optional/never-cut) — needs live key/credits; text-script fallback already ships.
4. **UX eyeball** at demo viewport — all four surfaces (Pipeline, Diligence/contradiction, Graph/chat, memo/decision) against rubric "intuitive, clear, beautifully designed."
5. **Merge** `dispatch/lovable-frontend` → `main`.
6. **Submit** on projects.hack-nation.ai under Challenge 02 before Sun 09:00 ET; save the receipt.

**Demo-machine guard:** run `npm rebuild better-sqlite3` on Node 26.3.1 before demoing (the prebuilt binary is Node-22 ABI; a stray `npm install` re-breaks every DB path under Node 26 — see verify report risk #1).

## Blocked / waiting on human

- **push-state gate (g) is red while the swarm is active** — non-mine files stay uncommitted (`data/**` memo/replay, `overnight-build.run-state.json`, `lovable/.../package-lock.json`). Clears on the final clean commit + push once workers quiesce (lead owns the freeze commit).
- Scope conflicts resolved by the 20:50/20:55 BST rulings — see Decisions.

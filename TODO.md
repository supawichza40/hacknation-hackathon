# TODO.md — Status Board

Claude updates this at every phase boundary and after every autonomy-window decision. The human reads this board instead of asking "is it done?" / "is this still running?".

## Current state

| Field | Value |
|---|---|
| **Event clock** | start: 2026-07-18 12:15 ET · deadline: 2026-07-19 09:00 ET · finals: 2026-07-25 12:00 ET |
| **Challenge (locked)** | **02 — The VC Brain** · ElevenLabs = voice brief layer only (not Challenge 01) |
| **Phase** | Spec locked → scaffold app ([docs/ops/PLAYBOOK.md](docs/ops/PLAYBOOK.md)) |
| **Product plan** | [VC-BRAIN-PLAN.md](VC-BRAIN-PLAN.md) |
| **Golden path status** | not started |
| **Last push** | `337e93c` @ 2026-07-18 20:45 BST (checkpoint, pre-reconciliation) |
| **Demo video** | not recorded |
| **Submission** | no draft |

## Now / Next / Done

### Now
- [ ] Requirements suite FIRST (8 docs per [design doc](docs/superpowers/specs/2026-07-18-vc-brain-requirements-design.md): use cases, journeys, FR, NFR, screen map, external services, smoke tests, DoD) — docs-first sequencing confirmed by human 20:55 BST; this suite REPLACES the old docs/specs/01–08 plan
- [ ] Then scaffold FounderGraph app per VC-BRAIN-PLAN §0.5 — in THIS repo (human ruling 20:55 BST)
- [ ] Fill [docs/ops/RUBRIC.md](docs/ops/RUBRIC.md) §1–2 (Challenge 02 weights + track sentence verbatim) — overdue vs CLAUDE.md "before ideation" rule

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

## Blocked / waiting on human

- None. (Scope conflict resolved by the 20:50 BST final ruling; reconciliation rulings 20:55 BST — see Decisions.)

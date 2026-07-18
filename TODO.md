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
| **Last push** | _pending_ |
| **Demo video** | not recorded |
| **Submission** | no draft |

## Now / Next / Done

### Now
- [ ] Requirements suite (8 docs: use cases, journeys, FR, NFR, screen map, external services, smoke tests, DoD) — design approved, awaiting human review of [design doc](docs/superpowers/specs/2026-07-18-vc-brain-requirements-design.md), then dispatch plan gate
- [ ] Scaffold FounderGraph app per VC-BRAIN-PLAN (Next.js + Memory + graph shell)

### Next
- [ ] Fill [docs/ops/RUBRIC.md](docs/ops/RUBRIC.md) §1–2 for Challenge 02 weights / track sentence
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

## Blocked / waiting on human

- _none_

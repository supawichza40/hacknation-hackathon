# RUBRIC.md — Judging Reverse-Engineering (fill in Hour 0)

Photograph every slide that mentions judging, prizes, or submission. Fill this before ideation. Re-read it before every scope decision.

## 0. Event facts (pre-event research 2026-07-10, corrected 2026-07-14 from official participant PDF)

> **Full record: [docs/research/EVENT-DOSSIER.md](docs/research/EVENT-DOSSIER.md)** · official deck: `HackathonMaterials/…Participants.PDF`

- **Event:** Hack-Nation 6th Global AI Hackathon · hybrid, 12+ hubs + online · MIT-ecosystem (MIT Club N. California + MIT Club of Germany)
- **Clock (all ET, PDF p.2 — overrides earlier website times):** Sat Jul 18 11:15 kickoff · **12:05–12:15 challenge reveal** · 12:15 hacking begins · **Sun Jul 19 09:00 SUBMISSION DEADLINE** (~21h window) · Sat Jul 25 12:00 finalist pitches (3 min, top-3 per challenge) · 14:15 awards
- **ICT conversion:** kickoff Sat 22:15 · reveal Sat 23:05 · hacking Sat 23:15 · submission Sun 20:00 · finals Sat Jul 25 23:00
- **Competition math:** 200+ judges, 400+ submissions, ~5 challenges → ~15 finalist slots ≈ 3.75% finalist rate
- **Prizes:** $35k+ cash & credits, per-challenge 1st/2nd/3rd; Venture Track (3-month program) for top teams
- **Challenges revealed AT kickoff** — no pre-published tracks; ideation constraint: prepare per-domain, lock at reveal
- **Application:** batch-gated via Google Form; Batch 6 (final) deadline **Jul 10** — walk-ins impossible, hub admission separate approval (London hub = luma kr0cbgnv)
- **Past sponsors (5th ed. Devpost + site):** OpenAI, GitHub, Lovable, Databricks, Supabase, Vercel, ElevenLabs, DSV, Masters' Union, Hudson River Trading, Mozilla — expect challenge sponsors from this pool
- **5th-ed judges signal:** Greylock VCs on panel; Fridolin Haugg (Harvard). Venture framing scores.
- **Format:** finalists pitch 2–3 min live + Q&A to operators/investors

## 0.5 Past-edition record (deep research 2026-07-10 — winners, tracks, judging)

**Edition timeline** (reconciled from winner-post dates; numbering was fuzzy in sources):
| Ed. | Date | Notes |
|---|---|---|
| 1st–2nd | 2025 | Born in MIT Sloan AI Club; 2nd ed. "with MIT Sloan & OpenAI" |
| 3rd | Nov 8–9 2025 | w/ MIT Sloan AI Club |
| 4th | Feb 7–8 2026 | 3,000+ applicants / 1,500+ selected; hubs MIT, Stanford, ETH, TUM |
| 5th | Apr 25–26 2026 | Online + India satellite (noClue/Masters' Union Devpost, $28.5k) |
| 6th | **Jul 18–19 2026** | ours |

**Track structure (stable across editions):** ~5 challenges per event, dual-track model — **Corporate track** = predefined problem statements designed by sponsor companies (named after them: "OpenAI track", "Databricks Track", ElevenLabs) · **VC/Venture challenge** = open-ended, no predefined problem, startup potential. Track sentence example (4th ed., OpenAI track, verbatim): **"Build the Superhuman AI Chief of Staff"**.

**Judging process (from MIT Alumni jury call, 6th ed.):** jury = MIT alumni + "leaders from OpenAI, Google, Microsoft … and other world-class institutions"; VCs (Greylock) on past panels. Flow: local pitches Sat ~4PM PT → jury meets Sun 8AM–12PM PT after submission deadline → top-3 per challenge → 3-min global finalist pitches + Q&A Jul 25. Prizes 6th ed.: **$35K in OpenAI API prizes + Google Cloud credits** (+cash pool). Organizer contact: Linn Bieske (MIT CNC).

**Recorded winners & what won:**
- **Spine** (1st prize, 4th ed., OpenAI track) — Karlo Vrancic + 2, MIT hub. Org-intelligence platform: communication graph from corporate email, centrality/Louvain analytics, GraphRAG Q&A, auto-reports. Pitch frame: "Companies pay McKinsey $500K+ for org assessments that take months … we do it in minutes." Stack: FastAPI + NetworkX + Next.js + OpenAI GPT-5/embeddings, deployed on Vercel in ~18h. Demo data: Enron corpus; upload flow *simulated* plug-and-play over pre-computed analytics. → near-verbatim track-sentence instantiation + consulting-cost economics + live deployed URL.
- **OmniCall AI** (3rd place, 4th ed., ElevenLabs) — voice-agent build; sponsor-tool visibility.
- 4th-ed. Databricks Track had placed winners (IG reel, names unverified).

**Playbook confirmations:** winners = sponsor-track sentence instantiated near-verbatim · killer economic stat in first line · deployed URL · staged/pre-computed demo data behind a live-looking flow · sponsor API visibly load-bearing. Matches §5 unwritten layer.

## 1. Stated mark scheme (copy from slides, verbatim)

_Not published pre-event. 5th-edition Devpost listed only "Energy" as a criterion (placeholder-grade). Real criteria expected at challenge reveal — capture VERBATIM at kickoff, Sat Jul 18 12:50 ET._

| Weight | Criterion | Their exact wording |
|---|---|---|
| _%_ | | |
| _%_ | | |
| _%_ | | |

## 2. Tracks / prizes (VERBATIM one-line definitions)

_Challenges revealed 12:50 PM ET Jul 18. Known structure: Corporate Track (partner problem statements) + Venture Track (startup potential). Fill verbatim at reveal._

| Track | Exact sentence from organizers | Prize |
|---|---|---|
| | | |
| | | |

> **Rule: build the track sentence.** The July 2026 recordings show every winner was a near-verbatim instantiation of its track's one-line definition. Pick the track FIRST, quote its sentence at the top of the spec, and map every feature to it.

## 3. Judges (names, roles, employers)

| Judge | Role | What they'll probe |
|---|---|---|
| | | |

## 4. Submission requirements (from slides/portal — exact list)

- [ ] _e.g. project details · dev platform used · presentation link · demo video_

## 5. The unwritten layer (verified against July 2026 recorded winners — assume it applies)

The written rubric above decides who reaches the final. These decide who WINS:

- [ ] **Real niche with a face** — a named person/business the judge can picture (use YOUR real company)
- [ ] **Agentic framing** — an agent doing work autonomously within explicit policy bounds ("most of what wins is agentic AI" — organizer, on record)
- [ ] **Sourced problem statistics** — 2–3 numbers judges can't argue with, spoken in the first 30 seconds
- [ ] **One live wow moment** — a 10-second visible proof (live connect, real write landing, balance hitting zero)
- [ ] **Human-in-the-loop as a trust feature** — approval gates presented as a strength, never an apology
- [ ] **Sponsor-tool visibility** — at least one flow through the tools the event is promoting
- [ ] **3-minute comprehension** — a judge who missed the first 90 seconds can still explain the product
- [ ] **Honest Q&A** — admitted gap + roadmap beat bluffing on record; prepare answers in `PITCH.md`

## 6. Anti-checklist (verified UNDER-rewarded on record — cap effort here)

- Architecture depth / test count beyond green-and-stable (least-enforced axis in the recordings)
- UI polish beyond the demo camera path
- Feature breadth (the team challenged hardest overlapped an existing platform feature; "one killer feature beats five half-built ones")

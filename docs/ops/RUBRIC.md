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

## 1. Stated mark scheme (from Challenge 02 brief §6, "Evaluation Criteria" — VERBATIM, weights official)

Source: `Topics/1784381921507-02-Maschmeyer-Group-The-VC-Brain.docx.pdf` (Maschmeyer Group brief, p.6). Weights sum to 100% — this IS the published Challenge 02 rubric, not a placeholder.

| Weight | Criterion | Their exact wording |
|---|---|---|
| **30%** | Data Architecture and Intelligence | "How well does the system collect, structure, and manage founder data? We look for smart ingestion, deduplication, enrichment, and a reasoning layer that is honest about what it knows and what it does not. **Note: generic ingestion / enrichment quality alone will not score highly here if it doesn't address the cold-start, pre-track-record case.**" |
| **25%** | Intelligent Analysis and Trust | "How effectively does the solution synthesise fragmented signals into decision-ready insights? Do the memo's Trust Scores surface evidence and uncertainty transparently?" |
| **30%** | Investment Utility & Execution | "Does the tool produce a recommendation a human investor could genuinely act on within 24 hours? This includes any progress on instrumenting how fast and reliably an opportunity moves from first signal to decision. Could it transform the speed and quality of capital allocation?" |
| **15%** | User Experience and Design | "Is the interface intuitive, clear, and beautifully designed? Does it make complex AI reasoning feel effortless and trustworthy for a non-technical investor?" |

> **Implication for our build (read before every scope decision):** the two 30% axes (Data Architecture + Investment Utility = 60%) plus the 25% Trust axis = 85% live in the data+reasoning+memo path. The cold-start caveat on the first 30% axis is a tiebreaker we must NOT silently drop — it maps directly to VC-BRAIN-PLAN §0.5 decision 5 (hero = builder's own sparse-network repo) and the "Explicit cold-start" section of §2. If we trade anything to time pressure, UX (15%) is the first thing to fall — never the 30%+30% pair.

## 2. Tracks / prizes (VERBATIM one-line definitions)

Challenge 02 brief is already in-repo (`Topics/1784381921507-02-Maschmeyer-Group-The-VC-Brain.docx.pdf`). Our track sentence is locked below — Challenge 01 (ElevenLabs Negotiator) is listed only as the "do NOT submit under" counterpoint, so we never second-guess the decision mid-event.

| Track | Exact sentence from organizers | Prize |
|---|---|---|
| **02 — The VC Brain (Maschmeyer Group) ← OUR TRACK** | **"The VC Brain: Deploying $100K Checks in 24 Hours."** (brief p.1, title block) · Sponsor: **Maschmeyer Group — Investing in Exceptional Founders** | $35K+ pool (OpenAI API + Google Cloud credits + cash); per-challenge 1st/2nd/3rd; Venture Track (3-month program) upside for top teams |
| 01 — The Negotiator (ElevenLabs) — DO NOT SUBMIT | (not our track — voice layer on top of VC Brain only, per VC-BRAIN-PLAN §0) | — |

> **Rule: build the track sentence.** The July 2026 recordings show every winner was a near-verbatim instantiation of its track's one-line definition. Pick the track FIRST, quote its sentence at the top of the spec, and map every feature to it.
>
> **Our track sentence instantiated (paste at top of VC-BRAIN-PLAN and PITCH.md hook):** *"FounderGraph — The VC Brain that deploys $100K checks in 24 hours: sources founders, builds a living technical + claim graph, scores them on three axes with Trust Scores, and writes a 24-hour investment memo."* Every feature must trace back to this sentence; anything that doesn't is `docs/ops/BACKLOG.md` material.

## 3. Judges (names, roles, employers)

Specific Challenge 02 judges are not named pre-event; the jury composition below is from the 6th-ed. MIT Alumni jury call (§0.5) and maps each judge archetype to the §1 criterion they will probe hardest. Fill real names VERBATIM at kickoff into the "Name" column.

| Judge archetype | Role | What they'll probe (maps to §1 weight) |
|---|---|---|
| Maschmeyer Group VC partner (track sponsor) | Challenge 02 sponsor; signs the check the brief is named after | **Investment Utility & Execution (30%)** — "Would I actually act on this memo in 24h? Is the Invest/Pass/More-info call defensible? Speed from first signal → decision." |
| Greylock / general VC panelist | Past-ed. panel; venture framing scores | **Investment Utility + Trust (30%+25%)** — "Is the Trust Score honest about what it DOESN'T know? Does cold-start case actually work, or did you rebuild network-gated diligence?" |
| OpenAI / Google / Microsoft AI leader | MIT alumni jury call names these orgs | **Data Architecture and Intelligence (30%)** — "Ingestion/dedup/enrichment quality; reasoning layer honesty about uncertainty; agentic traceability — does each conclusion cite its evidence?" |
| MIT alum (Sloan AI Club / CNC) | Organizer-side; breadth of Hack-Nation | **All four — looking for the track sentence instantiated near-verbatim + sponsor-tool visibility + 3-min comprehension** (§5 unwritten layer) |
| Fridolin Haugg (Harvard) — signaled on 5th-ed. panel | Academic / research credibility | **Areas of Research §4** — "Did you take a real stab at confidence scoring, cold-start prediction, or founder-trait modeling? Documented approach, not just a working demo." |

> **Pitch prep implication:** Q&A answers in `docs/ops/PITCH.md` must pre-address the cold-start question (Maschmeyer + Greylock probes both hit it) and the Trust-honesty question (every VC archetype probes it). Both map to existing locked decisions (§0.5 #4 epistemic integrity, #5 real anchor) — lead with those, not with feature breadth.

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
- [ ] **Honest Q&A** — admitted gap + roadmap beat bluffing on record; prepare answers in `docs/ops/PITCH.md`

## 6. Anti-checklist (verified UNDER-rewarded on record — cap effort here)

- Architecture depth / test count beyond green-and-stable (least-enforced axis in the recordings)
- UI polish beyond the demo camera path
- Feature breadth (the team challenged hardest overlapped an existing platform feature; "one killer feature beats five half-built ones")

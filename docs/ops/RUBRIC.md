# RUBRIC.md — Judging Reverse-Engineering (fill in Hour 0)

Photograph every slide that mentions judging, prizes, or submission. Fill this before ideation. Re-read it before every scope decision.

## 0. Event facts (pre-event research 2026-07-10, corrected 2026-07-14 from official participant PDF)

> **Full record: [docs/research/EVENT-DOSSIER.md](docs/research/EVENT-DOSSIER.md)** · official deck: `HackathonMaterials/…Participants.PDF`

- **Event:** Hack-Nation 6th Global AI Hackathon · hybrid, 12+ hubs + online · MIT-ecosystem (MIT Club N. California + MIT Club of Germany)
- **Clock (all ET, corrected from kickoff deck p9 — overrides participant PDF + website):** Sat Jul 18 11:15 kickoff · **12:50–13:00 challenge reveal** · 13:00 hacking begins · **Sun Jul 19 09:00 SUBMISSION DEADLINE** · Sat Jul 25 12:00 finalist pitches (**top-2 per challenge**, deck p9/p10) · 14:15 awards
- **ICT conversion:** kickoff Sat 22:15 · reveal Sat 23:05 · hacking Sat 23:15 · submission Sun 20:00 · finals Sat Jul 25 23:00
- **Competition math (corrected, kickoff deck):** >170 judges (p16) · 6 challenges × top-2 = **12 finalist slots**
- **Prizes (corrected, discord-info.md):** **$50K+ total**, per-challenge 1st/2nd/3rd; grand prize = top-2 per challenge pitch Jul 25, overall 1st wins Venture Lab Fast Track + $5k OpenAI API
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

**Judging process (from MIT Alumni jury call, 6th ed.):** jury = MIT alumni + "leaders from OpenAI, Google, Microsoft … and other world-class institutions"; VCs (Greylock) on past panels. Flow: local pitches Sat ~4PM PT → jury meets Sun 8AM–12PM PT after submission deadline → **top-2 per challenge (corrected from jury-call "top-3" by kickoff deck p9/p10)** → global finalist pitches + Q&A Jul 25. Prizes 6th ed.: **$50K+ total (corrected per discord-info.md; jury call had said $35K OpenAI API + Google Cloud credits)**. Organizer contact: Linn Bieske (MIT CNC).

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

> **Event-wide judging layer (kickoff deck p16, this edition — sits ON TOP of the Ch.2 weights above, does not contradict them):** ">170 judges … judging 3 criteria: **Technical depth** (complexity, implementation and engineering quality) · **Communication** (documentation and presentation **incl. video**) · **Innovation & creativity** (originality and creative approach of solution)." The HN-4 template weighted these 33/33/33. Practical read: the two ≤60-sec videos and the docs ARE a scored axis (Communication) — treat video quality as rubric points, not packaging.

> **Implication for our build (read before every scope decision):** the two 30% axes (Data Architecture + Investment Utility = 60%) plus the 25% Trust axis = 85% live in the data+reasoning+memo path. The cold-start caveat on the first 30% axis is a tiebreaker we must NOT silently drop — it maps directly to VC-BRAIN-PLAN §0.5 decision 5 (hero = builder's own sparse-network repo) and the "Explicit cold-start" section of §2. If we trade anything to time pressure, UX (15%) is the first thing to fall — never the 30%+30% pair.

## 2. Tracks / prizes (VERBATIM one-line definitions)

Challenge 02 brief is already in-repo (`Topics/1784381921507-02-Maschmeyer-Group-The-VC-Brain.docx.pdf`). Our track sentence is locked below — Challenge 01 (ElevenLabs Negotiator) is listed only as the "do NOT submit under" counterpoint, so we never second-guess the decision mid-event.

| Track | Exact sentence from organizers | Prize |
|---|---|---|
| **02 — The VC Brain (Maschmeyer Group) ← OUR TRACK** | **"The VC Brain: Deploying $100K Checks in 24 Hours."** (brief p.1, title block) · Sponsor: **Maschmeyer Group — Investing in Exceptional Founders** | **This edition (VERBATIM): $50K+ total pool** (">50k$ in prizes across all challenges" — kickoff deck p10; discord-info.md §Prizes). **Ch.2: 1st = $1k + $3k OpenAI API · 2nd = $450 + $1.5k OpenAI API · 3rd = $200** (discord-info.md prize table, cross-checked deck p10). **Grand prize: top 2 teams of EACH challenge pitch live (3 min, Sat Jul 25 12:00 ET); overall 1st = Venture Lab Fast Track + $5k OpenAI API** (deck p9–10; discord-info.md). Plus 5 community prizes @ $500 OpenAI credits each, incl. Go Viral (deck p11) |
| 01 — The Negotiator (ElevenLabs) — DO NOT SUBMIT | (not our track — voice layer on top of VC Brain only, per VC-BRAIN-PLAN §0) | — |

**Stackable sponsor prizes (win ON TOP of the challenge prize):**

| Sponsor prize | Definition | Prize | Our eligibility |
|---|---|---|---|
| **Best Use of Tavily** | "Build a project that leverages Tavily's APIs in a creative and impactful way." (Tavily Hacker Guide, HackNation July 2026) | 1st = 10k / 2nd = 5k / 3rd = 3k Tavily API credits | **Eligible** — Tavily is our live founder-**sourcing** engine (R7): thesis→query `/search` + `/research`, captured Wave-0, replayed on stage. Redeem code `HackNationJuly` (Project plan, 8,000 credits). |

> **Rule (sponsor-tool visibility):** judges probed every team on how the sponsor tool actually works (§5 unwritten layer; ElevenLabs OmniCall placed on this alone). Make Tavily *visibly load-bearing* — the outbound sourcing story IS Tavily. ElevenLabs (voice brief) is the second sponsor tool visible.

> **Rule: build the track sentence.** The July 2026 recordings show every winner was a near-verbatim instantiation of its track's one-line definition. Pick the track FIRST, quote its sentence at the top of the spec, and map every feature to it.
>
> **Our track sentence instantiated (paste at top of VC-BRAIN-PLAN and PITCH.md hook):** *"FounderGraph — The VC Brain that deploys $100K checks in 24 hours: sources founders, builds a living technical + claim graph, scores them on three axes with Trust Scores, and writes a 24-hour investment memo."* Every feature must trace back to this sentence; anything that doesn't is `docs/ops/BACKLOG.md` material.

## 3. Judges (names, roles, employers)

Specific Challenge 02 judges are not named pre-event; the jury composition below is from the 6th-ed. MIT Alumni jury call (§0.5) and maps each judge archetype to the §1 criterion they will probe hardest. Fill real names VERBATIM at kickoff into the "Name" column.

**Kickoff-deck update (2026-07-18):** the deck names NO individual jurors — only ">170 judges … from world class organizations" with an org word-cloud (JPMorgan, OpenAI, Google, Microsoft, Amazon, Meta, IBM, Salesforce, Atlassian, MIT, Stanford, Harvard …) (deck p16). Named people: hosts Linn Bieske (MITCNC) + Kai N. Wiederhold (CEO Hack-Nation) (p2); speakers Carsten Maschmeyer (CEO, Maschmeyer Group — our sponsor, spoke at kickoff) + Arthur Dooner (Databricks) (p9-speakers slide); Ch.2 office-hours contact "Carl" (VC Brain office hours 1:30–2:30 PM ET, p15). Archetype table below stands.

| Judge archetype | Role | What they'll probe (maps to §1 weight) |
|---|---|---|
| Maschmeyer Group VC partner (track sponsor) | Challenge 02 sponsor; signs the check the brief is named after | **Investment Utility & Execution (30%)** — "Would I actually act on this memo in 24h? Is the Invest/Pass/More-info call defensible? Speed from first signal → decision." |
| Greylock / general VC panelist | Past-ed. panel; venture framing scores | **Investment Utility + Trust (30%+25%)** — "Is the Trust Score honest about what it DOESN'T know? Does cold-start case actually work, or did you rebuild network-gated diligence?" |
| OpenAI / Google / Microsoft AI leader | MIT alumni jury call names these orgs | **Data Architecture and Intelligence (30%)** — "Ingestion/dedup/enrichment quality; reasoning layer honesty about uncertainty; agentic traceability — does each conclusion cite its evidence?" |
| MIT alum (Sloan AI Club / CNC) | Organizer-side; breadth of Hack-Nation | **All four — looking for the track sentence instantiated near-verbatim + sponsor-tool visibility + 3-min comprehension** (§5 unwritten layer) |
| Academic juror (Stanford / Oxford / Imperial named in jury pool — `docs/research/EVENT-DOSSIER.md`) | Academic / research credibility | **Data Architecture (§1, 30%) + Trust (§1, 25%) — research depth** — "Did you take a real stab at confidence scoring, cold-start prediction, or founder-trait modeling? Documented approach, not just a working demo." |

> **Pitch prep implication:** Q&A answers in `docs/ops/PITCH.md` must pre-address the cold-start question (Maschmeyer + Greylock probes both hit it) and the Trust-honesty question (every VC archetype probes it). Both map to existing locked decisions (§0.5 #4 epistemic integrity, #5 real anchor) — lead with those, not with feature breadth.

## 4. Submission requirements (from slides/portal — exact list)

All uploaded to **projects.hack-nation.ai**; editable any time until the deadline **Sun Jul 19 09:00 ET — no late submissions accepted** (kickoff deck p37 "Rules 1/2"; discord-info.md §Submission Deadline). Every team member needs a platform account AND must be added on the submission — only listed members receive prizes (deck p37; discord-info.md §Teams).

- [ ] **Project summary** — text, 150–300 words (deck p38; discord-info.md checklist #1)
- [ ] **Demo video** — max 60 sec, shows the product (deck p38; discord-info.md #2)
- [ ] **Tech video** — max 60 sec, how it was built (deck p38; discord-info.md #3)
- [ ] **Team video** — "explain who you are" (kickoff deck p38 ONLY — not in the discord list; include it, deck is authoritative)
- [ ] **1-page report** — PDF, structured technical summary (discord-info.md #4 + HN-4 Rules template §4 sections: Problem, Audience, Solution, USP, Implementation, Results; NOT on deck p38 slide — include it anyway)
- [ ] **GitHub repository** — public link (deck p38; discord-info.md #5)
- [ ] **Zipped code** — .zip backup, no large data/model weights (deck p38; discord-info.md #6)
- [ ] **Dataset** — link or "N/A" (deck p38; discord-info.md #7)
- [ ] **Finals prep:** 1–3 slides + live demo for the Jul 25 pitch (discord-info.md "+" row; deck p9 says "1-2 Slides + Demo" — prep ≤2 slides to satisfy both)

> All links must be "publicly accessible by everyone" — "No access? No prize." (HN-4 Rules template, Final Reminders — format guidance still applicable.)

## 5. The unwritten layer (verified against July 2026 recorded winners — assume it applies)

The written rubric above decides who reaches the final. These decide who WINS:

- [ ] **Real niche with a face** — a named person/business the judge can picture (use YOUR real company)
- [ ] **Agentic framing** — an agent doing work autonomously within explicit policy bounds ("most of what wins is agentic AI" — organizer, on record). **Reconciliation with locked architecture (§0.5 decision 2 / VC-BRAIN-PLAN §9):** we deliberately ship two structured LLM calls, not an eight-agent swarm — pitch this AS agentic work: an autonomous extraction→scoring pipeline operating inside explicit policy bounds, where the §0.5 #4 epistemic-integrity rules (cite-or-drop, trust scoring, contradiction surfacing) ARE the policy bounds. Never say "it's just two LLM calls."
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

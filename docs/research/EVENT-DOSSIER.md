# EVENT-DOSSIER — Hack-Nation 6th Global AI Hackathon (Jul 18–19, 2026)

Consolidated pre-event research. Compiled 2026-07-10/14 from web sweep + official participant deck.
**Primary source:** [`HackathonMaterials/6th Hack-Nation Global AI Hackathon - Participants.PDF`](../../HackathonMaterials/) (21 slides, official).
Referenced by RUBRIC.md §0/§0.5 (condensed). This file is the full record.

## 1. Official schedule (participant PDF p.2 — OVERRIDES website times)

| When (ET) | When (ICT, UTC+7) | What |
|---|---|---|
| Sat Jul 18, 11:15 AM–12:05 PM | Sat 22:15–23:05 | Kick-off & speaker session |
| Sat Jul 18, 12:05–12:15 PM | Sat 23:05–23:15 | **Reveal of challenges** |
| Sat Jul 18, 12:15 PM | Sat 23:15 | Hacking begins |
| Sun Jul 19, 9:00 AM | **Sun 20:00** | **SUBMISSION DEADLINE** (~21h window) |
| Sat Jul 25, 12:00–2:00 PM | Sat 23:00–01:00 | Finalist pitches (3 min; 1st/2nd/3rd of each challenge) |
| Sat Jul 25, 2:15 PM | Sun 01:15 | Awards ceremony |

Website (hack-nation.ai, scraped 2026-07-10) said kickoff 12:00 ET / hacking 13:00 ET — PDF is official and 45 min earlier. Plan to the PDF.
MIT Alumni jury page adds (PT): local pitches Sat ~4:00 PM PT · jury deliberates Sun 8:00 AM–12:00 PM PT.

## 2. Scale & competition math

- 5,500+ applications → 2,000+ admitted, 50% graduate level+ (PDF p.4)
- **200+ judges, 400+ submissions per hackathon** (PDF p.6) → top-3 per challenge reach finals; ~5 challenges ⇒ ~15 finalist slots / 400 submissions ≈ **3.75% finalist rate**
- 12+ hubs: Stanford, SF, Cambridge/MIT, NYC, London (HALKIN), Dresden, Munich, Zurich, Linz, Brussels, Delhi (Masters' Union) + online (PDF p.5)

## 3. Tracks & challenge structure

- Dual-track model, stable across editions: **Corporate track** (sponsor-defined problem statements) + **VC track / "VC Big Bets"** (open-ended, startup potential)
- ~5 challenges per event, revealed at kickoff. Detailed challenge briefs distributed via links at reveal.
- **Sample challenges** (PDF pp.12–14, from past editions):
  - *AI Sports Coach* (ElevenLabs) — "Build an AI sports coach that delivers conversational insights on performance, tactics, and training using real-time data and voice interaction."
  - *FinDocGPT* (AkashX.ai) — "Create an AI that can parse, analyze, and summarize complex financial documents to inform smarter investment strategies."
  - *From Sketch to Sky* (VC Big Bet) — "Create an AI-powered 3D aircraft-design generator that converts natural-language prompts ('Design a Boeing 737') into production-ready CAD models."
  - 4th ed. OpenAI track: "Build the Superhuman AI Chief of Staff"

## 4. Judges & judging process

- Jury: 200+ from MIT/Harvard alumni network + big tech + VC. Named on PDF p.6: Sophia Luo (Greylock), Jean-Claude Ton (OpenAI), judges from Microsoft, Meta, Nvidia, McKinsey, Amazon, Adobe, Databricks, IBM, Founders Fund, Cisco, Verizon, Synopsys, Stanford, Oxford, Imperial…
- Formal weights never published pre-event. Capture verbatim at reveal.
- Flow: submit Sun 9AM ET → jury deliberation Sun morning → top-3 per challenge → 3-min global pitch + Q&A Jul 25 → awards.
- Judge mix = VC-heavy + big-tech operators ⇒ venture framing + technical depth both probed.

## 5. Recorded winners (what actually wins)

| Project | Placement | Challenge / Track | Notes |
|---|---|---|---|
| **Spine** | 1st prize, 4th ed. (Feb 7–8 2026) | OpenAI "Superhuman AI Chief of Staff" | Email→communication graph→org analytics + GraphRAG. Hook: "Companies pay McKinsey $500K+… we do it in minutes." FastAPI+NetworkX+Next.js+GPT-5, deployed Vercel ~18h. Demo: Enron corpus, upload flow simulated over pre-computed analytics. [Repo](https://github.com/kvrancic/spine) · [Post](https://www.linkedin.com/posts/karlovrancic_we-just-won-the-first-prize-at-hack-nations-activity-7426634987640242176-a9PX) |
| **From Sketch to Sky** | 1st place, 3rd ed. | VC Big Bet | Natalie Chan (Imperial, 6x hackathon winner) — NL prompt → CAD aircraft model (PDF p.14) |
| **SynthShape** | 1st prize, Hackathon 1 | Generative 3D jewelry: prompt/image → printable shape | Stanford (PDF p.11) |
| **ThermoTrace** | 2nd prize, Hackathon 1 | Anomaly detection, thermal drone footage + visual inspection | MIT (PDF p.11) |
| **AI Scam Shield** | 3rd prize, Hackathon 1 | Multilingual scam-detection agent for WhatsApp & websites | Code University Berlin (PDF p.11) |
| **AG3334** | Creativity winner, Hackathon 2 | FinDocGPT (financial doc analysis) | ENSICAEN Paris (PDF p.11) |
| **Gould Standard** | 2nd prize, VC Big Bets | Protein-structure prediction w/ smaller datasets | Dana-Farber/Broad/Harvard (PDF p.11) |
| **OmniCall AI** | 3rd place, 4th ed. | ElevenLabs (voice agent) | [Post](https://www.linkedin.com/posts/muhammad-arslan-toor_ai-hackathon-elevenlabs-activity-7426945592922112001-LFgX) |

**Winner pattern:** near-verbatim track-sentence instantiation · economic hook stat in first line · deployed URL · staged-but-honest demo data behind live-looking flow · sponsor API load-bearing · agentic framing.

## 6. Sponsors / expected tooling (6th ed. deck, p.1/p.21)

Databricks, DSV Gruppe, Fulcrum, Spiral, World Bank, yfood, Manage&More, **OpenAI**, LAP, Start2 Group, innocent, Boost Startup Factory, YETI, **Tavily**, TeamViewer, Factory 300, ESCP, Amundi/acba, **Vercel**, MIT Sloan AI Club, GYM COOK, **Lovable**, Red Bull, FOMO, TUMO, **HRT**, **Supabase**, Masters' Union, novu campus, HALKIN, Eleveight AI, **Cursor**, AgentPark. Venture-lab partners: EWOR, Databricks; investor day: a16z, Greylock, Antler, Creandum.
→ Sponsor-tool visibility rule: OpenAI API + Vercel/Supabase/Lovable/Cursor/Tavily are the likely challenge substrates. ElevenLabs appeared in past sample challenges.

## 7. Editions timeline

| Ed. | Date | Evidence |
|---|---|---|
| 1st–2nd | 2025 | 2nd "with MIT Sloan & OpenAI" (GDG Mannheim listing) |
| 3rd | Nov 8–9, 2025 | Natalie Chan 1st place (PDF p.14) |
| 4th | Feb 7–8, 2026 | Spine/OmniCall winner posts; 3,000+ applicants |
| 5th | Apr 25–26, 2026 | + India satellite Devpost (noClue/Masters' Union, $28.5k, 163 ppl) |
| 6th | Jul 18–19, 2026 | ours |
| 7th | Oct 3–4, 2026 | roadmap (PDF p.9) |

## 8. Post-event path

Venture Lab: top 30 teams, 3-month incubation, 30M€ credit pool, EWOR partnership, Demo Day + Investor Day (Jul-cohort: 29 Aug demo, 25 Sep investor day — PDF p.9). Winning ≠ end: strong builds convert to YC/seed (Anto, YC F25 — PDF p.20).

## 9. Application & registration

- Batch-gated Google Form via hack-nation.ai; Batch 6 (final) deadline Jul 10, 2026. Walk-ins impossible; hub admission separately approved (London hub luma: kr0cbgnv; global luma: 8rfryv5k).

## 10. Open gaps (verify at kickoff)

- [ ] Formal judging criteria/weights — capture verbatim at reveal (Jul 18, 12:05 ET)
- [ ] 6th-ed challenge list + brief links
- [ ] Submission mechanism this year (5th used own portal + regional Devpost; global-ai-hackathon.devpost.com slug currently redirects)
- [ ] 5th-ed winners (announced late Jun 2026, IG video only)
- [ ] Team formation mechanics (how teams form at kickoff for online participants)

## Social-platform winner & community evidence (full URL log)

**LinkedIn — winner/participant posts:**
- Karlo Vrancic, 1st prize 4th ed. (Spine), full post text captured incl. "~18 hours" build claim, teammates Marc Walden & Alec, MIT hub, −26°C Boston:
  https://www.linkedin.com/posts/karlovrancic_we-just-won-the-first-prize-at-hack-nations-activity-7426634987640242176-a9PX
- Artur Barcij — names 4th-ed OpenAI track sentence verbatim ("Build the Superhuman AI Chief of Staff", 1,500+ selected participants):
  https://www.linkedin.com/posts/artur-barcij_globalaihackathon-hacknation-ai-activity-7426732896570228736-OiHh
- Muhammad Arslan Toor, 3rd place 4th ed. (OmniCall AI, ElevenLabs):
  https://www.linkedin.com/posts/muhammad-arslan-toor_ai-hackathon-elevenlabs-activity-7426945592922112001-LFgX
- Hack-Nation official — VC challenge explainer ("Unlike our corporate track, this challenge had no predefined problem"):
  https://www.linkedin.com/posts/hack-nation_ai-hackathon-vcchallenge-activity-7400171796894752769-0u-C
- Hack-Nation company page (6,082 followers; event countdown posts): https://www.linkedin.com/company/hack-nation
- Deadline-reminder post: https://www.linkedin.com/posts/hack-nation_deadline-reminder-for-builders-registrations-activity-7412773387728535552-8bk9

**Instagram (@hacknation.globalai) — recaps & structure:**
- 2025 year recap, announces Feb 7–8 2026 edition: https://www.instagram.com/reel/DS1-39rjWsX/
- "36,000 hours hacked. 1,500+ builders. Nearly 300 AI products" + Stanford-hub testimonial: https://www.instagram.com/reel/DUqqQbxieDV/
- 4th-ed Databricks Track placed-winner story: https://www.instagram.com/reel/DXWXEYCgvsv/
- "What are Challenge Tracks?" dual-track explainer: https://www.instagram.com/p/DWUoP36E_jH (caution: adjacent hit DWUoP36E_jH resolved to a Bain post — verify handle before citing)
- Austria hub promo w/ dual-track wording: https://www.instagram.com/reel/DMxRU9sNtrQ/
- 6th-ed apply reminder: https://www.instagram.com/reel/DZxfFCUIURD/

**Facebook / community:**
- 5th ed. dates (Apr 25–26 2026) + prize pool: https://www.facebook.com/groups/researchupdates.in/posts/26191079773889122/
- 2nd ed. "with MIT Sloan & OpenAI" (GDG Mannheim listing): https://gdg.community.dev/events/details/google-gdg-on-campus-university-of-mannheim-mannheim-germany-presents-global-ai-hackathon-the-2nd-edition-with-mit-sloan-amp-openai/

**Embedded links extracted from the PDF** (decoded from /URI objects, 2026-07-14 — these are the "Link to video" / "Link" buttons on pp.11–20):
- Challenge detail briefs (Google Docs — READ BEFORE EVENT, shows brief format/expectations):
  - https://docs.google.com/document/d/1qdGWnGbfLlMAIAGzdjNQLpHm3Ao1b1-0yyGjcxdxiOg/edit?usp=drive_link
  - https://docs.google.com/document/d/1qso07M5U9QdLneB6i4JILUbd2lHpRS8Hx-dKNiJBlIQ/edit?usp=sharing
- Winner demo videos / interviews (p.11 cards + p.14–19 profiles, exact card mapping unlabeled in PDF):
  - https://drive.google.com/file/d/190VbVrgJp9OZrXtPFgycSS60IbcKY7DQ/view
  - https://drive.google.com/file/d/1ewcu93ku1powc82YHOFLOgGb8k289wXp/view
  - https://vimeo.com/1104749137
  - https://www.loom.com/share/3888ede425db4b91a2cb99ffce935ac0
  - https://www.youtube.com/watch?v=4ocXwHN7IQk (channel P3G3 — Paul Goldschmidt, Stanford winner p.15)
  - https://www.youtube.com/watch?v=xuFM0BqTHlA
  - https://youtu.be/xMromFDNgXw
- https://www.linkedin.com/in/daviddegruijl/ — David de Gruijl, founder @Anto (YC F25), Hack-Nation alum (p.20)

**Not yet mined:** hack-nation LinkedIn company post archive (per-edition winner announcements), 5th-ed winners IG video (late Jun 2026), the winner videos above (watch = free pitch-structure intel).

## Web sources

1. https://hack-nation.ai/ + /hackathon — schedule, batches, prizes (scraped via headless browser, JS SPA)
2. Participant PDF (this repo, HackathonMaterials/) — official deck
3. https://alumcommunity.mit.edu/networks/events/274744 — jury call, PT agenda
4. https://luma.com/kr0cbgnv (London hub) · https://luma.com/8rfryv5k (global)
5. https://hack-nation.devpost.com/ — India satellite (NOT the global portal)
6. https://github.com/kvrancic/spine — 4th-ed winner repo
7. LinkedIn/Instagram/Facebook winner + community posts — see social-evidence section above
8. https://techpression.com/applications-open-for-hack-nation-global-ai-hackathon-2026-with-30000-prize-pool/ · https://opportunitiesforyouth.org/2026/04/02/hack-nation-global-ai-hackathon-2026-build-innovate-and-compete-for-30000-in-prizes/
9. https://internshala.com/competitions/global-ai-hackathon/ — Venture Track application (India) · https://www.startupgrantsindia.com/hack-nation-india — India prizes

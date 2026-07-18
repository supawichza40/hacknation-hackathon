# WINNERS.md — Hack-Nation recorded winners, all editions (analysis targets)

Compiled 2026-07-14. Companion to [EVENT-DOSSIER.md](EVENT-DOSSIER.md). Purpose: repo/pitch analysis before Jul 18.
Confidence tags: ✅ verified (primary source) · ⚠️ candidate (name-match, unverified) · ❌ not found yet.

## Index

| # | Project | Edition | Placement | Track / Challenge | GitHub | Live demo | Video | People (LinkedIn) |
|---|---|---|---|---|---|---|---|---|
| 1 | **Spine** | 4th (Feb 7–8 '26) | 🥇 1st prize | OpenAI — "Build the Superhuman AI Chief of Staff" | ✅ [kvrancic/spine](https://github.com/kvrancic/spine) | ✅ [spine-hackathon.vercel.app](https://spine-hackathon.vercel.app/) | ❌ | ✅ [Karlo Vrancic](https://www.linkedin.com/in/karlovrancic/) + Marc Walden, Alec |
| 2 | **SynthShape** | 1st ed. | 🥇 1st prize | Generative 3D jewelry: prompt/image → printable shape | ✅ [PaulGoldschmidt/SynthShape](https://github.com/PaulGoldschmidt/SynthShape) | ❌ | ✅ [YouTube](https://www.youtube.com/watch?v=4ocXwHN7IQk) | Paul Goldschmidt (Stanford AI researcher; PDF p.15) |
| 3 | **ThermoTrace** | 1st ed. | 🥈 2nd prize | Anomaly detection: thermal drone footage + visual inspection | ❌ (⚠️ generic name-matches only) | ❌ | ⚠️ one of PDF video links below | MIT team (names unknown) |
| 4 | **AI Scam Shield** | 1st ed. | 🥉 3rd prize | Multilingual scam-detection agent for WhatsApp & websites | ❌ | ❌ | ⚠️ PDF links below | Code University Berlin |
| 5 | **AG3334** | 2nd ed. | 🏅 Creativity | FinDocGPT — financial doc analysis (AkashX) | ❌ (challenge-cohort repos ⚠️ below) | ❌ | ⚠️ PDF links below | ENSICAEN Paris |
| 6 | **Gould Standard** | ~2nd ed. | 🥈 2nd, VC Big Bets | Protein-structure prediction w/ smaller datasets | ❌ | ❌ | ⚠️ PDF links below | Dana-Farber/Broad/Harvard |
| 7 | **From Sketch to Sky** | 3rd (Nov 8–9 '25) | 🥇 1st, VC Big Bet | NL prompt → production CAD aircraft model | ❌ | ❌ | ✅ "Watch here" = one of PDF links | ✅ Natalie Chan (Imperial, 6× hackathon winner; PDF p.16) |
| 8 | **OmniCall AI** | 4th (Feb 7–8 '26) | 🥉 3rd place | ElevenLabs voice-agent challenge | ⚠️ omnicall name-matches, unverified | ❌ | ❌ | ✅ [post](https://www.linkedin.com/posts/muhammad-arslan-toor_ai-hackathon-elevenlabs-activity-7426945592922112001-LFgX) — Muhammad Arslan Toor |
| 9 | *(5th-ed winners)* | 5th (Apr 25–26 '26) | — | announced late Jun '26, IG video only | ❌ | ❌ | ❌ | ❌ |

## Unmapped winner-video links (from PDF /URI extraction — watch & assign)

- https://drive.google.com/file/d/190VbVrgJp9OZrXtPFgycSS60IbcKY7DQ/view
- https://drive.google.com/file/d/1ewcu93ku1powc82YHOFLOgGb8k289wXp/view
- https://vimeo.com/1104749137
- https://www.loom.com/share/3888ede425db4b91a2cb99ffce935ac0
- https://www.youtube.com/watch?v=xuFM0BqTHlA
- https://youtu.be/xMromFDNgXw
- Interviews: Daniel Rapoport, Ronan McCooey (MSc Business Analytics @MIT, video-analytics winners — PDF p.17–18)

## Deep profiles (analysis-ready)

### 1. Spine — the primary study target (only fully-public winner)

- **Repo:** https://github.com/kvrancic/spine · **Live:** https://spine-hackathon.vercel.app/
- **Win:** 1st prize overall, 4th ed. (3,000+ applicants), OpenAI track "Build the Superhuman AI Chief of Staff"
- **Product:** upload corporate email → communication graph (NetworkX) → centrality/Louvain community detection, "dead-man-switch" critical-people scoring, comms-waste quantification, 0–100 org-health score, GraphRAG natural-language Q&A, GPT-5-generated diagnostic reports
- **Pitch hook (verbatim README):** "Companies pay McKinsey $500K+ for organizational health assessments that take months… in minutes, not months"
- **Stack:** FastAPI + NetworkX 3 + TextBlob + ChromaDB + OpenAI (GPT-5, text-embedding-3-large) · Next.js App Router + react-force-graph-2d + Tailwind + shadcn/ui · uv + pnpm
- **Demo-data strategy (steal this):** Enron corpus (520K emails); "upload flow simulates a plug-and-play experience while serving pre-computed Enron analytics" — staged demo behind live-looking UI, disclosed in README
- **Build time claim:** ~18h, deployed backend + frontend
- **Analyse:** repo structure (backend/src/{parser,graph,metrics,sentiment,rag,api}), test presence, README as pitch doc
- **Post:** https://www.linkedin.com/posts/karlovrancic_we-just-won-the-first-prize-at-hack-nations-activity-7426634987640242176-a9PX

### 2. SynthShape

- **Repo:** https://github.com/PaulGoldschmidt/SynthShape — "A minimal LLM-Enabled 3D Modeling Studio made at the MIT Hackathon in 24 hours"
- **Win:** 1st prize, 1st edition; challenge = generative 3D jewelry, prompt/image → printable shape
- **Person:** Paul Goldschmidt — AI researcher @Stanford, expertise: AI for 3D generation, biodesign, digital health (PDF p.15) · video: https://www.youtube.com/watch?v=4ocXwHN7IQk (his channel P3G3)
- **Analyse:** how "minimal" won — scope discipline signal.

### 7. From Sketch to Sky / Natalie Chan

- **Win:** 1st place 3rd ed., VC Big Bet: "Create an AI-powered 3D aircraft-design generator that converts natural-language prompts ('Design a Boeing 737') into production-ready CAD models."
- **Person:** Natalie Chan — Engineering @Imperial, self-taught full-stack, **6× hackathon winner** (PDF p.16; demo "Watch here" among unmapped links). London tech community — possibly at London hub again this edition.
- **Signal:** repeat winners exist; profile pattern = full-stack speed + demo polish.

### 8. OmniCall AI

- **Win:** 3rd place 4th ed., ElevenLabs challenge (voice agent)
- **⚠️ Candidate repos (unverified, from `gh search repos omnicall`):** ahoj416-cell/omnicall (updated 2026-02-24 — right window), ishanworks15/omnicall, PhuongHo03/omnicall. Verify via Arslan Toor's profile before citing.

### FinDocGPT cohort (challenge intel, not winners)

`gh search repos findocgpt` → cluster updated Aug 2025 (Jimmy-Mendez, preiyalthakkar3007, Tomisin92, **AndreaPlascencia/hacknation-findocgpt**) ⇒ AkashX FinDocGPT challenge ran ~Aug 2025 edition; participant repos = free examples of what a Hack-Nation submission repo looks like. Analyse 1–2 for submission-format norms (README structure, demo links).

## Cross-winner pattern (build strategy input)

1. **Track sentence instantiated near-verbatim** — every recorded winner is its challenge sentence turned into a product.
2. **Economic hook number in line 1** (Spine: $500K McKinsey; consulting/expert-replacement framing recurs).
3. **Deployed live URL** (Vercel twice) — not localhost.
4. **Staged-but-honest demo data**: real public dataset + pre-computed results behind a live-looking flow, disclosed.
5. **Modern default stack**: Next.js/Tailwind/shadcn front, Python FastAPI back, OpenAI APIs — no exotic infra.
6. **Sponsor API load-bearing**, named in pitch (OpenAI, ElevenLabs, Databricks, AkashX).
7. **Small teams (≤3), ~18–24h**, scope = one killer flow.
8. Judges reward **agentic/autonomous framing** + venture potential (VC-heavy jury).

## TODO (pre-event analysis queue)

- [ ] Watch 2–3 winner videos (links above) → pitch structure notes → PITCH.md
- [ ] Read both challenge-brief Google Docs (EVENT-DOSSIER §social) → brief format expectations
- [ ] Clone + skim kvrancic/spine → repo/README-as-pitch conventions
- [ ] Verify OmniCall candidate repo via Arslan Toor profile
- [ ] Capture 5th-ed winners when IG/LinkedIn surfaces them

# VC Brain — Hackathon Product Spec & Architecture Plan

**Hackathon:** Hack Nation 6th Global AI Hackathon  
**Final submission challenge:** **02 — The VC Brain (Maschmeyer Group)** ← we stick to this  
**Not submitting as:** 01 — The Negotiator (ElevenLabs)  
**ElevenLabs role:** Voice layer *on top of* VC Brain (sponsor tool), not a second challenge entry  
**Venture / VC track:** Eligible as upside after a strong Challenge 02 build (startup-shaped product); do not dilute the Maschmeyer brief  
**Submission platform:** https://projects.hack-nation.ai/#/  
**Event:** https://luma.com/8rfryv5k  
**Deadline:** Sunday, July 19, 2026 — 9:00 AM ET  

**Product name:** FounderGraph (locked)  
**One-liner:** An AI operating system that sources founders, builds a living technical + claim graph from GitHub and decks, scores them on three axes with Trust Scores, answers investor questions in cited graph-grounded chat, produces a 24-hour investment decision memo — and closes with a voiced investment brief (ElevenLabs).

---

## 0. Final track decision (locked)

| Question | Answer |
|----------|--------|
| Which challenge do we submit under? | **Challenge 02 — The VC Brain** |
| Can we also “do” Challenge 01? | **No as a second submission.** One product, one challenge. |
| Can we still use ElevenLabs? | **Yes** — committed pre-rendered investment brief; realtime graph voice only as a stretch. |
| Is that “using track 2”? | Challenge **02** is our corporate challenge. Separate from post-event **Venture / VC Big Bets** selection. |
| Pitch line | “Built for Maschmeyer’s VC Brain brief; ElevenLabs powers the investor voice brief.” |

**Rule:** The pre-rendered MP3 brief is committed and never cut. Realtime conversational voice is a stretch — it gets time only after committed Challenge 02 scope (Memory / Trust / 3-axis / chat / memo) is green. Challenge 02 judging weights win over sponsor polish.

---

## 0.5 Locked execution plan v2 (post-debate, 2026-07-18 15:40 ET / 20:40 BST)

Product of a two-model adversarial debate (Claude Fable council vs GPT-5.6 sol council, Delphi cross-rebuttal, judged synthesis); the dated objection log lives at `docs/dispatch/plan-dialogue/2026-07-18-vc-brain-debate.md` (note: its chat/voice outcomes were later superseded). Scope finalized by human ruling 2026-07-18 20:50 BST: the graph-grounded chat trio is committed M4 work at the bottom of the cut ladder; the pre-rendered MP3 brief is committed and never cut; realtime conversational voice is an optional stretch. The rest of this document is written to this plan. ~18h remain; ~13 effective build hours.

### Verdict
Winnable — but only with the ~40% surface cut below. Scoring/trust/memo (55% of judged weight) move forward; every demo artifact is precomputed; live paths are garnish on a demo that works with the network cable pulled.

### Locked decisions
1. **Single Next.js app** (`src/lib/{memory,ingest,graph,scoring,memo}`). No monorepo, no packages/, no vendor/. better-sqlite3, no ORM, no Postgres branch.
2. **Two structured LLM calls, not eight agents:** (1) claim/evidence extractor, (2) axes+memo writer. Thesis fit, founder-history updates, and score math are deterministic TypeScript. Every LLM response schema-validated (zod), one repair attempt, then fall back to the captured real replay.
3. **Provenance replay replaces mocked fixtures:** the Wave-0 spike's real run is captured (repo commit SHA, prompt version, raw model JSON, timestamp) and becomes the offline fallback for every later stage.
4. **Epistemic integrity rules** (sol C1–C8): Opportunity carries `ScreeningFacts` (evidence-backed company facts + explicit unknowns) so thesis fit is computed, never invented. `contradicted` = two incompatible cited facts; absence of evidence = `unsupported`. Axis trend = "baseline" unless two dated observations exist (returning-founder demo has history rows). Evidence records = {artifactId, locator, excerpt}; claims/scores/memo cite those. Person dedup = normalized GitHub URL/email.
5. **Real anchor:** the hero founder is the builder's own real GitHub repo + persona (real story; demo numbers synthetic but derived). Demo set = 3 pre-seeded + 1 live inbound (human ruling 2026-07-18 23:50 BST): hero (analyzed live), rich-GitHub showcase card (precomputed graph only), off-thesis greyed card with "fails thesis: check size" chip — plus a 4th opportunity arriving live through `/apply` during the demo. Cold-start beat = hero's own sparse-network story; Founder-Score-persists beat = one seeded prior-application history row.
6. **Wow moment (named, rehearsed):** click the red CONTRADICTED claim → jump to the exact deck slide + graph node showing the incompatible evidence. Voice brief is the closing beat, not the climax.
7. **Chat = streaming graph-grounded chat** (SSE): every answer must carry citations or the assistant refuses. Node-click "Ask about this" pre-scopes the question to that node; text-highlight-to-ask pre-scopes to the selection. **Committed, built in M4** — not gated on any checkpoint; sits at the **bottom** of the cut ladder (last-resort cut only).
8. **Voice:** the pre-rendered MP3 investment brief (one real ElevenLabs call during the spike; "Play investment brief" button in the rehearsed demo) is **committed, never cut**. ElevenLabs realtime conversational voice over the graph = **optional stretch, only if time remains after committed scope is green**. P1 voice intake / P3 outbound → BACKLOG.md.
9. **API:** keep separate routes (/apply, /analyze, /score, /memo, /decide, /brief) but ONE UI action orchestrates staged, cacheable calls with progressive status. /chat = streaming, graph-grounded, cited (SSE) with node/selection context; /intake/voice cut (backlog).
10. **UA integration stays Mode B** — hour-0 task: read UA LICENSE (5 min) + NOTICE for adapted files. If license blocks or adaptation exceeds 45 min → drop to slim self-written pipeline.
11. **UI = 4 surfaces:** Pipeline (thesis as a settings drawer), Diligence (Overview+Claims+Memo one scrolling page + decision CTA), Graph (node drawer + streaming cited chat), Apply.
12. **Scope additions v3** (second dual-model debate, judged 2026-07-18 17:35 ET / 22:35 BST — log: `docs/dispatch/plan-dialogue/2026-07-18-scope-debate-v3.md`): R1 pipeline NL query box (+1.0h, M4) · R2 signal→decision timer chip (+0.5h, M4) · R3 evidence-backed sourcing stories (+0.75h, M1) · R4 one live thesis toggle (+0.5h, M1) · R5 reasoning step timeline from provenance metadata, never raw JSON (+0.5h, M2/M3) · R6 memo auto-"not disclosed" gaps (+0.25h, M4) · R7 GitHub sourcing scan captured at Wave-0, replayed deterministically — no live network call on stage (+1.0h). Total +4.5h; ladder placements below. Closes brief items 6, 23, 33 → 34/34 coverage.
13. **Demo-lite auth (human ruling 2026-07-18 23:50 BST, backfills requirements-design locked decision):** one hard-coded investor login + public founder `/apply`; session cookie separates the two roles; ~1h build. No real user management.

### Build order (ET, push at every block boundary — push == done)
- **15:15–16:00 M0:** scaffold single app, .gitignore, env template, better-sqlite3, empty pages. UA license check. **Platform submission draft + stub README pushed** (verify whether form requires a live URL — this decides the deploy question). Push.
- **16:00–17:30 WAVE-0 SPIKE (gate — nothing proceeds until green):** builder's real repo → real LLM structured call → knowledge-graph.json → rendered in React Flow. Capture provenance replay. Author hero deck + run it through the PDF parser (fails → pre-extracted slides JSON, no ceremony). One real ElevenLabs call → pre-render hero MP3 tonight. Capture real GitHub sourcing scan → `data/replay/scan/` (R7: thesis→topic query, signal scoring — star velocity, commit recency, no-org = pre-fundraise). Push.
- **17:30–19:00 M1:** trimmed Memory schema (+ScreeningFacts, Evidence, dedup rule), seed 3 opportunities + outbound cards with sourceChannel + founder history row. R3: multi-channel badges + "why surfaced" line, each backed by an Evidence record. R4: live check-size toggle in the thesis drawer → off-thesis card greys in real time. Pipeline page renders from DB. Push.
- **19:00–21:30 M2 (hard timebox):** generalize spike into pipeline; precompute all demo graphs + deck-claims JSON; graph UI + node drawer + sourceRef. R5: "Show reasoning" step-timeline drawer from provenance metadata. R7: "Scan" button replays captured run → threshold-crossing card pops into Outbound. Domain grouping only if time remains inside the box. **Timebox breach ⇒ precomputed-only, live Analyze becomes stretch.** Push.
- **21:30–00:30 M3:** claims table + Trust statuses (per locked rules) + contradiction wow moment + 3 axis scores (deterministic, rubric-based; trends per history rule) + thesis-fit chips. Push.
- **00:30–02:30 M4:** memo (call 2) with gaps flagged "not disclosed", Invest/Pass/More-info write, Founder-Score-persists beat, **+ streaming graph-grounded chat + node-click "Ask about this" + highlight-to-ask (committed)**. R1: pipeline NL query box (one compound sentence → one LLM call over all founders' ScreeningFacts → ranked, cited list). R2: "First signal → decision: N min" timer chip in the diligence header. R6: memo gaps[] auto-lists financials / cap table / DD log / exit as "not disclosed" when absent. Push. **T-8h cut-ladder checkpoint at 01:00.**
- **02:30–03:00 M5b:** wire Play-brief to MP3; live TTS only if trivially green. Realtime conversational voice only if everything committed is already green.
- **03:00 FEATURE FREEZE.** 03:00–04:00 rehearse golden path 3× offline; fix only path-breakers.
- **04:00–05:30:** record demo video (**≤60 SEC** — hard cap, kickoff deck p38) + tech video (**≤60 sec**, stack/highlights/limitations) (MP4 H.264) on the green build; README + NOTICE; push everything. **T-4h checkpoint 05:00 = must be packaging.**
- **05:30–06:30:** finalize submission under Challenge 02 on projects.hack-nation.ai — 150–300-word summary, both ≤60s videos (+ team video), 1-page PDF report, zipped code, dataset field (link or "N/A") — per docs/ops/SUBMISSION.md; verify the remote repo shows everything.
- **06:30–09:00:** buffer/rest. Re-record only if something material improves. No new scope.

### Cut ladder
- **T-8h (01:00 ET), in order:** live TTS → R5 step-timeline drawer → R3 evidence depth (badges stay, evidence drill-down goes) → R4 live toggle (falls back to read-only thesis.json) → live Analyze button (narrate precomputed) → live Apply path (seeded inbound) → thesis editing (read-only thesis.json).
- **T-4h (05:00 ET), in order:** R7 scan-replay beat (seeded cards remain) → R1 query box → axis trends (static scores) → showcase card #2 → graph filters/domains → outreach draft → Founder-Score sparkline → **(absolute last resort) the graph-grounded chat trio**. R2 chip is too small to ladder. Then STOP building: video, README, push, submit.
- Realtime conversational voice never appears on this ladder: it is stretch-only, built only if time remains, so it can never need cutting.
- **Never cut:** hero diligence path (Pipeline card → precomputed graph → claims with ONE red contradicted claim click-jumping to evidence → 3 separate axes → memo with decision + flagged gaps) + provenance-backed real analysis + pre-rendered MP3 + video + pushed repo + submitted entry.

### Open items (verify, don't assume)
- Submission form live-URL requirement → checked at M0 platform draft.
- ElevenLabs key/quota → proven or killed in the spike.

---

## 1. Positioning

### What we are building
A **venture diligence product** for deploying $100K checks in 24 hours:
- Sourcing (inbound apply + outbound GitHub/hackathon signals)
- Memory (persistent founder profiles + Founder Score)
- Intelligence (thesis-filtered, multi-axis scoring + evidence)
- Experience (investor dashboard: graph, cited chat, memo, decision)

### What Understand-Anything is to us
[Egonex-AI/Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) is **core functionality**: its knowledge-graph pipeline and graph-grounded chat, adapted under its LICENSE, ARE the diligence engine — applied to founder repos and pitch decks instead of arbitrary codebases. Specifically we adapt:
- Analysis pipeline → `knowledge-graph.json`
- Graph schema (nodes, edges, domains)
- Interactive graph visualization patterns (React Flow)
- Graph-grounded, citation-carrying chat

Everything VC-specific is ours: the thesis engine, 3-axis scoring, persistent Founder Score, per-claim Trust Scores, Memory, and the memo/decision workflow. Full attribution per the UA LICENSE and a NOTICE file for adapted code.

### Attribution policy
- Keep LICENSE/NOTICE for any copied or adapted code
- README: “Core graph pipeline + grounded chat derived from Understand-Anything (see LICENSE/NOTICE), applied to founder repos and decks; VC surface original”
- Pitch focus: VC Brain problem + Founder Score + Trust-scored memos, powered by the UA-derived graph engine
- Mention ElevenLabs as the voice-brief layer (sponsor visibility), not as the core thesis

---

## 1b. ElevenLabs voice layer (on Challenge 02)

ElevenLabs is a **feature**, not a track switch. We do **not** build phone haggling / quote negotiation (that is Challenge 01).

### Priority order

| Priority | Feature | What the user does | Demo value | Effort |
|----------|---------|-------------------|------------|--------|
| **P0 (committed, never cut)** | **Investment voice brief (pre-rendered MP3)** | On diligence page: “Play investment brief” → pre-rendered ElevenLabs TTS of Founder Score, 3 axes, recommendation, top Trust flags | Closing beat of the rehearsed demo; zero risk to core loop | ~1h (spike renders the MP3) |
| **P2 (optional stretch — only if time remains after committed scope is green, per 20:50 BST ruling)** | **Realtime voice chat over graph** | Mic button in the graph chat: speak ↔ ElevenLabs Conversational AI agent wired to `/api/chat`; graph-grounded answer spoken back with citation | Ties UA graph + ElevenLabs; realtime wow | ~4h |
| **P1 (backlog — BACKLOG.md)** | **Voice founder intake** | `/apply`: talk through company / problem / ask → structured fields; still confirm + upload deck + GitHub | Strong inbound story | ~3–4h |
| **P3 (backlog — BACKLOG.md)** | Activation voice note / outbound call | Draft spoken outreach to sourced founders | Cool but Negotiator-adjacent | — |

### P0 — Investment voice brief (spec)

```
Trigger:  POST /api/brief  { opportunityId }
Input:    memo.snapshot + axes[] + founderScore + recommendation + top 3 claims (low trust / contradicted)
Script:   45–75 seconds, investor tone, no hype, cite uncertainty (“two claims unsupported”)
Output:   audio URL or streamed audio (ElevenLabs TTS)
UI:       Diligence header button “Play investment brief” + waveform / pause
```

Script template (fill from Memory, never invent numbers):

> “Opportunity {company}. Founder Score {n}, trend {trend}.  
> Founder axis {score}, Market {score}, Idea-versus-market {score}.  
> Recommendation: {invest|pass|more_info}.  
> Thesis fit {pct}%.  
> Trust watch-outs: {claim1}; {claim2}.  
> Cap table and financials: flagged unavailable where missing.”

### P1 — Voice intake (backlog — not in this build)

- ElevenLabs **Agent** (or STT + our LLM) interviews the founder
- Tools write into the same JSON job/application schema as the form
- User **confirms** fields before analyze runs (same as Challenge 02 inbound: deck + company name minimum)
- Does **not** replace document upload

### Integration notes

- Env: `ELEVENLABS_API_KEY`, optional `ELEVENLABS_VOICE_ID`, `ELEVENLABS_AGENT_ID` (intake)
- Keep a **text fallback** if the key is missing (show script + “voice unavailable”) so demo never hard-fails
- Demo mode: pre-render one brief MP3 for the hero opportunity so the stage path is reliable
- Docs: [ElevenLabs](https://elevenlabs.io/docs) TTS + Agents

### What we explicitly will not build with ElevenLabs

- Parallel outbound sales calls to haggle prices (Challenge 01)
- Fake competing bids or invented inventory
- Voice as the only intake path (always keep form + deck + GitHub)

---

## 2. Challenge requirements we must hit

From Challenge 02 brief — MVP must demonstrate:

| Pillar | Requirement | Our implementation |
|--------|-------------|--------------------|
| Thesis Engine | Configurable sectors, stage, geo, check size, ownership, risk | `thesis.json` + filter every recommendation |
| Smart Data Collection | Heterogeneous ingest, validate, structure | GitHub clone + deck PDF + optional web signals → Memory |
| Multi-Attribute Reasoning | NL queries beyond keywords | Pipeline NL query box (one-pass compound query over all ScreeningFacts, cited — R1) + per-opportunity graph chat |
| Inbound | Company name + repo link → screen; deck optional (human ruling 2026-07-18 23:50 BST — no-deck cold start is a scored story) | `/apply` flow |
| Outbound | Scan GitHub/hackathons → activate | Seeded outbound shortlist + “draft outreach” |
| 3-axis screening | Founder / Market / Idea-vs-Market — NOT averaged; each with trend | Separate scores + trends in UI + memo |
| Founder Score | Persists across applications, never resets | Stored on person entity in Memory |
| Trust Score | Per claim, evidence + confidence, flag contradictions | Claim objects linked to graph nodes / deck slides |
| Investor UX | Notion-simple, Bloomberg-depth | 4 surfaces: Pipeline / Diligence (memo + decision) / Graph (cited chat) / Apply |
| Scope | Sourcing → Screening → Diligence → Decision only | No portfolio monitoring / fund ops |

### Committed beyond the table
- **Agentic Traceability** — every conclusion cites the exact node/slide. The contradiction click-jump to evidence is the named wow moment (§0.5 decision 6) and is on the never-cut list.

### Stretch (if time)
1. Validator agent for claim cross-checks
2. Sourcing channel graph (which channels produce quality)

### Explicit cold-start
Handle first-time founders with weak network but strong public artifacts (repo graph, demo, posts). Generic enrichment alone fails judging.

---

## 3. Product narrative (demo story)

1. Investor sets thesis (AI infra, seed, $100K, US/EU, high technical bar)
2. **Outbound:** system surfaces 3 GitHub-sourced founders with Founder Scores
3. **Inbound:** one founder applies with deck + company name + repo URL
4. Pipeline builds **technical knowledge graph** + extracts **claims** from deck
5. 3-axis scores + Trust Scores; contradictions flagged
6. Investor opens graph, asks chat: “What’s proprietary vs commodity?”
7. System generates investment memo + **Invest / Pass / Request more info**
8. Same founder later shows up with a new idea → Founder Score persists and trends up

---

## 4. System architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                SINGLE Next.js APP (FounderGraph)                 │
│  Pipeline · Diligence (one page) · Graph (+ chat) · Apply       │
└────────────────────────────┬────────────────────────────────────┘
                             │ API routes (one UI action orchestrates)
┌────────────────────────────▼────────────────────────────────────┐
│   /apply  /analyze  /score  /memo  /chat (SSE)  /decide  /brief │
└───┬──────────────┬───────────────────┬──────────────────────────┘
    │              │                   │
┌───▼───┐   ┌──────▼──────┐   ┌────────▼─────────────────────┐
│Ingest │   │ Graph Engine│   │ TWO structured LLM calls:     │
│GitHub │   │ (UA-derived │   │  1. claim/evidence extractor  │
│PDF    │   │  pipeline)  │   │  2. axes + memo writer        │
│Signals│   │ → graph.json│   │ + deterministic TS: thesis fit│
└───┬───┘   └──────┬──────┘   │   score math, Founder Score,  │
    │              │          │   trust status, dedup         │
    │              │          └────────┬──────────────────────┘
    └──────────────┴───────────────────┘
                             │
                    ┌────────▼────────┐
                    │     MEMORY      │
                    │  SQLite         │
                    │ (better-sqlite3)│
                    │ founders, claims│
                    │ graphs, scores  │
                    │ thesis, memos   │
                    └─────────────────┘
```

Every LLM response is schema-validated (zod), one repair attempt, then falls back to the **captured provenance replay** (§0.5 decision 3). Graph-grounded chat is a runtime LLM call over the graph that streams (SSE) and must cite or refuse.

### External services
- **LLM API** (OpenAI / Anthropic) — extractor call, axes+memo call, chat
- **GitHub** — clone or API for repos (demo: pre-cloned + one live small repo)
- **PDF parse** (pdf-parse; fallback: pre-extracted slides JSON)
- **ElevenLabs** — pre-rendered brief MP3 (spike); realtime voice only as stretch

### Understand-Anything integration (locked: Mode B — adapted modules)
Port the UA graph schema, analysis pipeline shape, and viz patterns into `src/lib/graph`; our deterministic TS + two LLM calls handle VC scoring/memo. Precompute graphs for demo reliability; one live analyze path (on the cut ladder). Hour-0 task: read UA LICENSE + write NOTICE for adapted files; if the license blocks or adaptation exceeds 45 min, drop to a slim self-written pipeline (§0.5 decision 10).

---

## 5. Data model

### Core entities

```ts
// Thesis (configurable, not hardcoded)
Thesis {
  id, name
  sectors: string[]
  stages: string[]          // e.g. pre-seed, seed
  geos: string[]
  checkSizeMin, checkSizeMax
  ownershipTarget?
  riskAppetite: 'low' | 'med' | 'high'
  technicalBar: number      // 0-100
}

// Person (Memory — never discard)
// Dedup rule: normalized GitHub URL / email is the identity key across applications
Person {
  id
  name, emails?, links: { github?, linkedin?, twitter? }
  founderScore: number      // persistent
  founderScoreHistory: { at, score, reason }[]
  traits: Record<string, { value, confidence, evidenceIds }>
}

// Company / Opportunity
Opportunity {
  id
  personId
  companyName
  deckPath?
  repoUrls: string[]
  source: 'inbound' | 'outbound'
  sourceChannel?: string    // github, hackathon, hn, etc.
  status: 'sourced' | 'screening' | 'diligence' | 'decision'
  screeningFacts: ScreeningFacts   // evidence-backed facts + explicit unknowns — thesis fit is computed, never invented
  createdAt, updatedAt
}

// Evidence (everything cites one of these)
Evidence {
  id
  artifactId                // repo file, deck, etc.
  locator                   // path+lines | slide number | url
  excerpt
}

ScreeningFacts {
  facts: Record<string, { value, evidenceIds }>   // sector, stage, geo, ask, ...
  unknowns: string[]                              // explicitly listed, never guessed
}

// Knowledge graph (UA-inspired)
KnowledgeGraph {
  opportunityId
  version
  nodes: GraphNode[]        // file | function | class | domain | claim | doc_section
  edges: GraphEdge[]        // imports | calls | supports | contradicts | belongs_to
  domains?: Domain[]
  meta: { analyzedAt, languages, commitSha? }
}

GraphNode {
  id, type, name, summary?
  sourceRef: { path?, lineStart?, lineEnd?, slide?, url? }
  layer?: string            // api, core, infra, ...
  complexity?
}

GraphEdge {
  id, from, to, type, weight?
}

// Claims + Trust (per claim, not one company score)
Claim {
  id, opportunityId
  text                      // "ARR $120k"
  category: 'traction' | 'team' | 'market' | 'tech' | 'other'
  trustScore: number        // 0-1
  confidence: 'high' | 'med' | 'low'
  evidenceIds: string[]     // node ids / deck anchors
  contradictionIds?: string[]
  status: 'supported' | 'unsupported' | 'contradicted' | 'unavailable'
}

// 3-axis screening (NOT averaged)
AxisScore {
  opportunityId
  axis: 'founder' | 'market' | 'idea_vs_market'
  score: number             // 0-100
  trend: 'improving' | 'stable' | 'declining' | 'baseline'
                            // 'baseline' unless two dated observations exist (returning-founder demo has history rows)
  rationale: string
  evidenceIds: string[]
}

// Memo
Memo {
  opportunityId
  version
  sections: {
    snapshot, hypotheses, swot, problemProduct, traction, // required
    team?, tech?, market?, competition?, gaps[]           // gaps explicitly flagged
  }
  recommendation: 'invest' | 'pass' | 'more_info'
  thesisFit: number
  generatedAt
}
```

### Graph JSON shape (adapted from Understand-Anything)

Store at: `data/graphs/{opportunityId}/knowledge-graph.json`

```json
{
  "version": "1.0",
  "meta": { "source": "github+deck", "analyzedAt": "ISO" },
  "nodes": [
    { "id": "n1", "type": "file", "name": "src/auth.ts", "summary": "..." }
  ],
  "edges": [
    { "id": "e1", "from": "n1", "to": "n2", "type": "imports" }
  ],
  "domains": [
    { "id": "d1", "name": "Authentication", "nodeIds": ["n1", "..."] }
  ]
}
```

---

## 6. Repository structure

The app is a **single Next.js app scaffolded inside THIS repo** (no separate app repo, no packages/, no vendor/ — adapted UA code lives in `src/lib/graph` with NOTICE attribution).

```
Hacknation Hackathon/                  # this repo (the submitted remote)
├── README.md                          # product pitch + setup + attribution
├── VC-BRAIN-PLAN.md                   # THIS FILE
├── LICENSE
├── NOTICE                             # Understand-Anything attribution for adapted code
├── docs/                              # ops + research + specs (see docs/README.md)
├── src/
│   ├── app/
│   │   ├── page.tsx                   # Pipeline board (thesis as a settings drawer)
│   │   ├── opportunities/[id]/
│   │   │   ├── page.tsx               # Diligence: Overview + Claims + Memo, one scrolling page + decision CTA
│   │   │   └── graph/page.tsx         # Graph explorer: node drawer + streaming cited chat
│   │   ├── apply/page.tsx             # inbound founder apply
│   │   └── api/
│   │       ├── apply/route.ts
│   │       ├── analyze/route.ts
│   │       ├── query/route.ts         # R1: one-pass NL query over all ScreeningFacts
│   │       ├── scan/route.ts          # R7: replays captured sourcing scan
│   │       ├── score/route.ts
│   │       ├── memo/route.ts
│   │       ├── chat/route.ts          # SSE streaming, cited
│   │       ├── decide/route.ts
│   │       └── brief/route.ts         # serves pre-rendered MP3
│   ├── components/
│   │   ├── graph/                     # React Flow graph (UA-derived)
│   │   ├── scores/                    # 3-axis + Founder Score
│   │   ├── claims/                    # Trust Score list + contradiction jump
│   │   └── memo/                      # Memo sections
│   └── lib/
│       ├── memory/                    # better-sqlite3 schema + queries
│       ├── ingest/                    # GitHub + PDF ingest
│       ├── graph/                     # UA-adapted analysis → graph.json
│       ├── scoring/                   # deterministic Founder Score + 3-axis + trust status (+ prompts)
│       └── memo/                      # memo call + citations (+ prompts)
├── data/
│   ├── thesis.default.json            # read-only thesis (editing is on the cut ladder)
│   ├── demo/                          # 3 seeded founders, decks, prebuilt graphs
│   ├── replay/                        # captured provenance replay (Wave-0 spike)
│   │   └── scan/                      # captured GitHub sourcing scan (R7)
│   └── graphs/                        # runtime graphs
└── scripts/
    ├── seed-demo.ts
    ├── analyze-repo.ts                # CLI: repo → graph
    └── precompute-demo-graphs.ts
```

---

## 7. Feature modules (what each §0.5 block builds)

The schedule — times, gates, pushes — lives in **§0.5 Build order**. This section only details block scope; if it ever seems to disagree with §0.5, §0.5's times govern.

- **M0 — Skeleton:** scaffold single app in this repo, .gitignore, env template, better-sqlite3, thesis.default.json, empty pages for demo navigation. UA LICENSE check. Platform submission draft + stub README pushed (live-URL check).
- **Wave-0 spike (gate):** builder's real repo → real LLM structured call → `knowledge-graph.json` → rendered in React Flow. Capture provenance replay. Hero deck through PDF parser (fallback: pre-extracted slides JSON). One real ElevenLabs call → pre-render hero MP3. R7 capture: one real GitHub sourcing scan (thesis→topic query + signal scoring) → `data/replay/scan/`.
- **M1 — Memory:** trimmed schema (Person, Opportunity + ScreeningFacts, Evidence, Claim, AxisScore, Memo; dedup rule). Seed 3 opportunities + outbound cards with sourceChannel + founder history row. R3: channel badges + "why surfaced" line, each backed by an Evidence record. R4: live check-size toggle → off-thesis card greys in real time. Pipeline page renders from DB.
- **M2 — Graph engine (hard timebox):** generalize the spike into the pipeline; precompute all demo graphs + deck-claims JSON; graph UI with pan/zoom, node drawer + sourceRef. R5: "Show reasoning" step-timeline drawer (provenance metadata, never raw JSON). R7: "Scan" replay UI with threshold-crossing card pop. Domain grouping only if time remains in the box. Timebox breach ⇒ precomputed-only, live Analyze becomes stretch.
- **M3 — Scoring + Trust:** claims table + Trust statuses (per §0.5 epistemic rules) + the red CONTRADICTED claim click-jump wow moment + 3 deterministic axis scores (trends per history rule) + thesis-fit chips + Founder Score update.
- **M4 — Memo + Decision + Chat (committed):** memo (call 2) with gaps flagged "not disclosed"; Invest / Pass / More-info write; Founder-Score-persists beat; **streaming graph-grounded chat with citations-or-refuse, node-click "Ask about this", and text-highlight-to-ask**. R1: pipeline NL query box (one-pass compound query, ranked + cited). R2: signal→decision timer chip. R6: memo gaps[] auto-"not disclosed" for financials / cap table / DD log / exit.
- **M5b — Voice:** wire "Play investment brief" to the pre-rendered MP3. Live TTS only if trivially green; realtime conversational voice only if everything committed is green (stretch).
- **Freeze → submit:** per §0.5 — rehearse 3× offline, record the two ≤60-sec videos (demo + tech) on the green build, README + NOTICE + 1-page PDF report + zipped code + 150–300-word summary, push, submit under Challenge 02.

Cut in planning (→ `docs/ops/BACKLOG.md`): voice intake (P1), outbound voice notes (P3). (NL search over Memory was promoted to committed R1 by §0.5 decision 12.)

---

## 8. API contracts (minimal)

```
POST /api/apply
  body: { companyName, deckFile?, repoUrls[], founderName?, links? }
  → { opportunityId }

POST /api/analyze
  body: { opportunityId }
  → { graphId, nodeCount, status }

POST /api/score
  body: { opportunityId, thesisId }
  → { founderScore, axes[], claims[] }

POST /api/memo
  body: { opportunityId }
  → { memo }

POST /api/chat   (SSE — streams token-by-token)
  body: { opportunityId, message, context?: { nodeId?, selection?: { text, nodeId } } }
       // context set by node-click "Ask about this" or text-highlight-to-ask
  → streamed answer chunks + citations: [{ nodeId, quote }]
       // no citable evidence ⇒ the assistant refuses instead of answering

POST /api/query
  body: { question }
  → { ranked: [{ opportunityId, rationale, citations[] }] }
       // R1: one-pass compound query over all founders' ScreeningFacts

POST /api/scan
  body: {}
  → { candidates[], thresholdCrossed[] }
       // R7: replays the captured Wave-0 scan run — no live network call on stage

POST /api/decide
  body: { opportunityId, decision: 'invest'|'pass'|'more_info', note? }
  → { ok }

POST /api/brief
  body: { opportunityId }
  → { script, audioUrl }   // pre-rendered MP3 for the hero; live TTS only if trivially green; text-only fallback if no key

GET /api/pipeline?thesisId=
  → { inbound[], outbound[] }

GET /api/opportunities/:id
  → full diligence payload
```

---

## 9. LLM architecture (two structured calls, not eight agents)

| Call | Job | Inputs | Outputs |
|------|-----|--------|---------|
| **Call 1 — Claim/Evidence Extractor** | Node/domain summaries + verifiable claims with evidence pointers | repo scan, deck text | enriched graph + Claim[] + Evidence[] |
| **Call 2 — Axes + Memo Writer** | Axis rationales + investor memo with gaps flagged | Memory, thesis, claims, scores | AxisScore rationales + Memo |

Both calls are schema-validated (zod), one repair attempt, then fall back to the captured provenance replay.

**Deterministic TypeScript (no LLM):** thesis fit from ScreeningFacts, axis score math + trend rule, Founder Score updates, trust status derivation (supported / unsupported / contradicted / unavailable per §0.5 rules), person dedup.

**Chat (runtime, M4):** a graph-grounded call behind `/api/chat` — retrieves from the graph, streams via SSE, and must return citations or refuse. Node-click and highlight-to-ask only pre-scope its context; same call path.

Prompts live in `src/lib/scoring/prompts.ts` and `src/lib/memo/prompts.ts` for iteration.

---

## 10. UI map (4 surfaces — §0.5 decision 11)

1. **Pipeline** — two columns: Outbound | Inbound; cards show Founder Score + thesis-fit chips + channel badges with "why surfaced" evidence (R3); NL query box (R1) + "Scan" replay button (R7); thesis lives in a settings drawer with one live check-size toggle (R4, falls back read-only)
2. **Diligence** — ONE scrolling page: Overview → Claims (claim · trust · evidence · status, red contradicted claim click-jumps to evidence) → Memo → decision CTA; header has company, source, status, Founder Score, the "First signal → decision: N min" timer chip (R2), and the “Play investment brief” button
3. **Graph** — React Flow; node drawer with summary + sourceRef + streaming cited chat (“Ask about this” from node click, highlight-to-ask from selected text) + "Show reasoning" step-timeline drawer entry (R5, also reachable from diligence); filters/domains only if time remains
4. **Apply (public-lite)** — minimal founder form for inbound demo

Design notes for hackathon: clear hierarchy, evidence click-through, no vanity dashboards. Avoid looking like a generic purple AI SaaS clone; brand for “investor OS.”

---

## 11. Demo dataset

Prepare offline — exactly **3 opportunities** (§0.5 decision 5):
1. **Hero** — the builder's own real GitHub repo + persona (real story; demo numbers synthetic but derived). Analyzed live (with provenance replay fallback). Carries the ONE red contradicted claim (two incompatible cited facts), the cold-start sparse-network beat, and a seeded prior-application history row for the Founder-Score-persists beat.
2. **Rich-GitHub showcase card** — precomputed graph only.
3. **Off-thesis greyed card** — “fails thesis: check size” chip.

Outbound cards carry multi-channel badges (github/hn/arxiv/hackathon) + "why surfaced" lines, each backed by an Evidence record (URL+excerpt) in Memory — not cosmetic stickers (R3).

Store under `data/demo/` with decks, repo mirrors, and precomputed `knowledge-graph.json`; the Wave-0 provenance replay lives under `data/replay/`, and the captured GitHub sourcing scan (R7) under `data/replay/scan/`.

---

## 12. Evaluation checklist (map to judging %)

### Data Architecture & Intelligence — 30%
- [ ] Ingest GitHub + deck into Memory
- [ ] Deduplicate person across opportunities
- [ ] Outbound sourcing story with channels
- [ ] Cold-start path explicit
- [ ] One-pass NL query over all founders — ranked + cited (R1)
- [ ] Scan replay with conviction-threshold card pop (R7)

### Intelligent Analysis & Trust — 25%
- [ ] Per-claim Trust Scores with evidence
- [ ] Contradictions flagged
- [ ] Graph-grounded chat citations
- [ ] Chat streams in real time; node-click and text-highlight pre-scope the question
- [ ] Gaps marked, not fabricated
- [ ] Reasoning step timeline visible (provenance metadata, R5)

### Investment Utility & Execution — 30%
- [ ] Thesis-filtered recommendations
- [ ] 3 axes separate + trends
- [ ] Memo usable for 24h decision
- [ ] Invest / Pass / More info
- [ ] Signal→decision timer visible (R2)
- [ ] Memo auto-"not disclosed" lines for absent optional sections (R6)

### UX & Design — 15%
- [ ] Investor can run flow without docs
- [ ] Graph + memo + scores in one narrative

---

## 13. Tech stack (recommended)

| Layer | Choice |
|-------|--------|
| App | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind + shadcn/ui |
| Graph viz | React Flow (+ dagre/elk layout) |
| DB | SQLite via better-sqlite3 — no ORM, no Postgres branch |
| LLM | OpenAI or Anthropic |
| PDF | pdf-parse (fallback: pre-extracted slides JSON) |
| Deploy | Pending the M0 submission-form live-URL check; Vercel if a live URL is required, otherwise local demo + recorded video |
| Package mgr | pnpm |

---

## 14. Env vars

```
OPENAI_API_KEY=
# or ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=        # spike renders the committed brief MP3
ELEVENLABS_VOICE_ID=       # optional
ELEVENLABS_AGENT_ID=       # optional — realtime conversational voice (stretch only)
DATABASE_URL=file:./data/vcbrain.db
GITHUB_TOKEN=          # optional, rate limits
NEXT_PUBLIC_APP_URL=
```

Never commit secrets. Demo mode works with precomputed graphs + the captured provenance replay + pre-rendered brief audio if keys are missing.

---

## 15. Pitch (3 minutes)

1. **Problem (20s):** Real anchor — the builder's own repo and sparse-network story. Great founders invisible; diligence takes weeks; capital = networks  
2. **Insight (20s):** Code + claims can be a living graph — structure beats vibes  
3. **Product (60s):** Live demo on the hero — Pipeline card → graph → **click the red CONTRADICTED claim, jump to the exact deck slide + graph node (the wow)** → cited streaming chat answer → 3 axes → memo → decision → **Play investment brief** (ElevenLabs closer)  
4. **Differentiation (30s):** Persistent Founder Score + per-claim Trust + UA-derived technical graph with cited chat + voice brief for the investor  
5. **Ask (20s):** Built for Challenge 02 (VC Brain); shaped for Venture Track upside  

---

## 16. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Live analyze too slow | Precompute demo graphs; live on one tiny repo |
| UA-derived engine read as a wrapper | Say it plainly: UA pipeline + grounded chat are the core engine, applied to founder repos/decks; the VC surface (thesis, scoring, Memory, memo) is ours; attribution in README + LICENSE/NOTICE |
| Hallucinated diligence | Trust status `unavailable`; never invent ARR |
| Scope creep | Cut channel ML, real email send, fund ops |
| Voice steals Challenge 02 time | Ship the committed MP3 brief; realtime stays stretch-only; P1/P3 in backlog |
| Looks like Negotiator entry | No price haggling; voice = diligence brief/intake only |
| License | Read UA LICENSE; NOTICE for adapted files |

---

## 17. Definition of Done (submit)

- [ ] End-to-end demo: apply/source → analyze → score → memo → decide  
- [ ] 3-axis + Founder Score + Trust claims visible  
- [ ] Graph explorer + at least one cited chat answer  
- [ ] Chat UX: streaming responses; “Ask about this” from node click; highlight-to-ask from selected text  
- [ ] Cold-start founder in demo set  
- [ ] Pipeline NL query box answers one compound query, ranked + cited (R1)  
- [ ] Signal→decision timer chip visible in diligence header (R2)  
- [ ] "Show reasoning" step timeline renders from provenance metadata (R5)  
- [ ] Scan replay pops one threshold-crossing outbound card (R7)  
- [ ] ElevenLabs: “Play investment brief” wired to the pre-rendered MP3 (live TTS optional)  
- [ ] README + PLAN + DEMO_SCRIPT  
- [ ] Attribution for Understand-Anything if code adapted  
- [ ] Demo video **≤60 sec** (MP4 H.264) — hard cap per kickoff deck p38 / discord-info.md  
- [ ] Tech video **≤60 sec** (stack, implementation highlights, limitations)  
- [ ] 1-page PDF report + zipped code (.zip) + 150–300-word summary + dataset field ("N/A" or link) — full list in docs/ops/SUBMISSION.md  
- [ ] Project submitted under **Challenge 02 — The VC Brain** before deadline  

Stretch, non-blocking (not required to submit): ElevenLabs realtime voice chat over the graph — only if all boxes above are green with time remaining.

---

## 18. Immediate next actions

The app lives in **this repo** — no new repo is created; judges browse this remote.

1. Write the requirements suite first (docs-first sequencing): `docs/superpowers/specs/2026-07-18-vc-brain-requirements-design.md` defines the approved 8-doc suite, which **replaces** the old `docs/specs/01–08` plan  
2. **M0 in this repo:** scaffold the single Next.js app, .gitignore, env template, better-sqlite3; UA LICENSE check; platform submission draft + stub README pushed (live-URL check)  
3. **Wave-0 spike (gate):** builder's real repo → real LLM call → graph rendered; capture provenance replay; author hero deck; pre-render hero MP3 (one real ElevenLabs call)  
4. **M1–M5b** per the §0.5 build order (Memory → graph engine → scoring/trust → memo + decision + committed chat trio → MP3 brief), pushing at every block boundary  
5. Feature freeze 03:00 ET → rehearse 3× offline → record both ≤60s videos 04:00–05:30 → submit by 06:30  

---

## 19. References

- Challenge brief (submit under this): `Topics/1784381921507-02-Maschmeyer-Group-The-VC-Brain.docx.pdf`
- ElevenLabs challenge (do **not** submit under; voice ideas only): `Topics/1784382172163-01-ElevenLabs-The-Negotiator.docx.pdf`
- Understand-Anything: https://github.com/Egonex-AI/Understand-Anything  
- Product site (inspiration only): https://understand-anything.com/  
- ElevenLabs docs: https://elevenlabs.io/docs  
- Hack-Nation showcase: https://projects.hack-nation.ai/#/

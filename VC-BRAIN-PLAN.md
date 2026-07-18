# VC Brain — Hackathon Product Spec & Architecture Plan

**Hackathon:** Hack Nation 6th Global AI Hackathon  
**Final submission challenge:** **02 — The VC Brain (Maschmeyer Group)** ← we stick to this  
**Not submitting as:** 01 — The Negotiator (ElevenLabs)  
**ElevenLabs role:** Voice layer *on top of* VC Brain (sponsor tool), not a second challenge entry  
**Venture / VC track:** Eligible as upside after a strong Challenge 02 build (startup-shaped product); do not dilute the Maschmeyer brief  
**Submission platform:** https://projects.hack-nation.ai/#/  
**Event:** https://luma.com/8rfryv5k  
**Deadline:** Sunday, July 19, 2026 — 9:00 AM ET  

**Product working name:** FounderGraph (TBD — pick before demo)  
**One-liner:** An AI operating system that sources founders, builds a living technical + claim graph from GitHub and decks, scores them on three axes with Trust Scores, produces a 24-hour investment decision memo — and can brief the investor by voice (ElevenLabs).

---

## 0. Final track decision (locked)

| Question | Answer |
|----------|--------|
| Which challenge do we submit under? | **Challenge 02 — The VC Brain** |
| Can we also “do” Challenge 01? | **No as a second submission.** One product, one challenge. |
| Can we still use ElevenLabs? | **Yes** — as a voice feature inside VC Brain (brief / intake / graph Q&A). |
| Is that “using track 2”? | Challenge **02** is our corporate challenge. Separate from post-event **Venture / VC Big Bets** selection. |
| Pitch line | “Built for Maschmeyer’s VC Brain brief; ElevenLabs powers the investor voice brief.” |

**Rule:** If voice work starts stealing time from Memory / Trust / 3-axis / memo, cut voice to TTS brief only. Challenge 02 judging weights win over sponsor polish.

---

## 0.5 LOCKED EXECUTION PLAN v2 (post-debate, 2026-07-18 15:00 ET) — THIS SECTION WINS

Product of a two-model adversarial debate (Claude Fable council vs GPT-5.6 sol council, Delphi cross-rebuttal, judged synthesis). Full objection log: `docs/dispatch/plan-dialogue/2026-07-18-vc-brain-debate.md`. Where this section conflicts with §§1b, 4–11, 13, 15, 17–18, **this section wins**. ~18h remain; ~13 effective build hours.

> **✅ CONFLICT RESOLVED (human ruling, 2026-07-18 20:45 BST):** "voice optional; text and chat must work — hard rule." Graph-grounded chat (streaming responses, node-click "Ask about this", text-highlight-to-ask) is a **hard requirement, never cut**. ALL voice work — including P2 realtime and the P0 pre-rendered brief — is **optional garnish**, first on the cut ladder. Decisions 7–8 and the cut ladder below reflect this ruling.

### Verdict
Winnable — but only with the ~40% surface cut below. The 24h M0–M6 map is dead; scoring/trust/memo (55% of judged weight) move forward; every demo artifact is precomputed; live paths are garnish on a demo that works with the network cable pulled.

### Locked decisions
1. **Single Next.js app** (`src/lib/{memory,ingest,graph,scoring,memo}`). No monorepo, no packages/, no vendor/. better-sqlite3, no ORM, no Postgres branch.
2. **Two structured LLM calls, not eight agents:** (1) claim/evidence extractor, (2) axes+memo writer. Thesis fit, founder-history updates, and score math are deterministic TypeScript. Every LLM response schema-validated (zod), one repair attempt, then fall back to the captured real replay.
3. **Provenance replay replaces mocked fixtures:** the Wave-0 spike's real run is captured (repo commit SHA, prompt version, raw model JSON, timestamp) and becomes the offline fallback for every later stage.
4. **Epistemic integrity rules** (sol C1–C8): Opportunity carries `ScreeningFacts` (evidence-backed company facts + explicit unknowns) so thesis fit is computed, never invented. `contradicted` = two incompatible cited facts; absence of evidence = `unsupported`. Axis trend = "baseline" unless two dated observations exist (returning-founder demo has history rows). Evidence records = {artifactId, locator, excerpt}; claims/scores/memo cite those. Person dedup = normalized GitHub URL/email.
5. **Real anchor:** the hero founder is the builder's own real GitHub repo + persona (real story; demo numbers synthetic but derived). Demo set = 3: hero (analyzed live), rich-GitHub showcase card (precomputed graph only), off-thesis greyed card with "fails thesis: check size" chip. Cold-start beat = hero's own sparse-network story; Founder-Score-persists beat = one seeded prior-application history row.
6. **Wow moment (named, rehearsed):** click the red CONTRADICTED claim → jump to the exact deck slide + graph node showing the incompatible evidence. Voice brief is the closing beat, not the climax.
7. **Chat = constrained Q&A box** in the graph node drawer: 2–3 rehearsed questions, answers must carry citations or the box refuses. First item on the T-8h cut ladder. No free-form chat page.
8. **Voice = P0 only.** Pre-rendered MP3 (one real ElevenLabs call during the spike) is the stage path; "Play investment brief" button sits inside the rehearsed demo. P1/P2 → BACKLOG.md. Budget ~1h; if M3/M4 slip past 01:00 ET, cap drops to 30 min post-freeze.
9. **API:** keep separate routes (/apply, /analyze, /score, /memo, /decide, /brief) but ONE UI action orchestrates staged, cacheable calls with progressive status. /chat constrained per (7); /intake/voice cut.
10. **UA integration stays Mode B** — hour-0 task: read UA LICENSE (5 min) + NOTICE for adapted files. If license blocks or adaptation exceeds 45 min → drop to slim self-written pipeline.
11. **UI = 4 surfaces:** Pipeline (thesis as a settings drawer), Diligence (Overview+Claims+Memo one scrolling page + decision CTA), Graph (node drawer + Q&A box), Apply.

### Build order (ET, push at every block boundary — push == done)
- **15:15–16:00 M0:** scaffold single app, .gitignore, env template, better-sqlite3, empty pages. UA license check. **Platform submission draft + stub README pushed** (verify whether form requires a live URL — this decides the deploy question). Push.
- **16:00–17:30 WAVE-0 SPIKE (gate — nothing proceeds until green):** builder's real repo → real LLM structured call → knowledge-graph.json → rendered in React Flow. Capture provenance replay. Author hero deck + run it through the PDF parser (fails → pre-extracted slides JSON, no ceremony). One real ElevenLabs call → pre-render hero MP3 tonight. Push.
- **17:30–19:00 M1:** trimmed Memory schema (+ScreeningFacts, Evidence, dedup rule), seed 3 opportunities + outbound cards with sourceChannel + founder history row. Pipeline page renders from DB. Push.
- **19:00–21:30 M2 (hard timebox):** generalize spike into pipeline; precompute all demo graphs + deck-claims JSON; graph UI + node drawer + sourceRef. Domain grouping only if time remains inside the box. **Timebox breach ⇒ precomputed-only, live Analyze becomes stretch.** Push.
- **21:30–00:30 M3:** claims table + Trust statuses (per locked rules) + contradiction wow moment + 3 axis scores (deterministic, rubric-based; trends per history rule) + thesis-fit chips. Push.
- **00:30–02:30 M4:** memo (call 2) with gaps flagged "not disclosed", Invest/Pass/More-info write, Founder-Score-persists beat. Constrained Q&A box only if green. Push. **T-8h cut-ladder checkpoint at 01:00.**
- **02:30–03:00 M5b:** wire Play-brief to MP3; live TTS only if trivially green.
- **03:00 FEATURE FREEZE.** 03:00–04:00 rehearse golden path 3× offline; fix only path-breakers.
- **04:00–05:30:** record demo video (MP4 H.264) on the green build; README + NOTICE; push everything. **T-4h checkpoint 05:00 = must be packaging.**
- **05:30–06:30:** finalize submission under Challenge 02; verify the remote repo shows everything.
- **06:30–09:00:** buffer/rest. Re-record only if something material improves. No new scope.

### Cut ladder
- **T-8h (01:00 ET), in order:** Q&A box → live TTS → live Analyze button (narrate precomputed) → live Apply path (seeded inbound) → thesis editing (read-only thesis.json).
- **T-4h (05:00 ET), in order:** axis trends (static scores) → showcase card #2 → graph filters/domains → outreach draft → Founder-Score sparkline. Then STOP building: video, README, push, submit.
- **Never cut:** hero diligence path (Pipeline card → precomputed graph → claims with ONE red contradicted claim click-jumping to evidence → 3 separate axes → memo with decision + flagged gaps) + provenance-backed real analysis + pre-rendered MP3 + video + pushed repo + submitted entry.

### Open items (verify, don't assume)
- Submission form live-URL requirement → checked at M0 platform draft.
- ElevenLabs key/quota → proven or killed in the spike.

---

## 1. Positioning (our idea, not a clone)

### What we are building
A **venture diligence product** for deploying $100K checks in 24 hours:
- Sourcing (inbound apply + outbound GitHub/hackathon signals)
- Memory (persistent founder profiles + Founder Score)
- Intelligence (thesis-filtered, multi-axis scoring + evidence)
- Experience (investor dashboard: graph, chat, memo, decision)

### What Understand-Anything is to us
[Egonex-AI/Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) is an **open-source reference and implementation aid** for turning code/docs into interactive knowledge graphs. We use its ideas (and selectively its code under its LICENSE) to accelerate:
- Multi-agent / pipeline analysis → `knowledge-graph.json`
- Graph schema (nodes, edges, domains, tours)
- Interactive graph visualization patterns (e.g. React Flow)
- Graph-grounded Q&A

We are **not** submitting a rebranded plugin. The product surface, scoring, Memory, thesis engine, and memo workflow are original to this challenge.

### Attribution policy
- Keep LICENSE/NOTICE for any copied or adapted code
- README: “Technical graph pipeline inspired by / adapted from Understand-Anything (see LICENSE)”
- Pitch focus: VC Brain problem + Founder Score + Trust-scored memos
- Mention ElevenLabs as the voice brief / intake layer (sponsor visibility), not as the core thesis

---

## 1b. ElevenLabs voice layer (on Challenge 02)

ElevenLabs is a **feature**, not a track switch. We do **not** build phone haggling / quote negotiation (that is Challenge 01).

### Priority order (ship top-down)

| Priority | Feature | What the user does | Demo value | Effort |
|----------|---------|-------------------|------------|--------|
| **P0 (must)** | **Investment voice brief** | On diligence page: “Play brief” → TTS of Founder Score, 3 axes, recommendation, top Trust flags | 10s wow; zero risk to core loop | ~2h |
| **P1 (should)** | **Voice founder intake** | `/apply`: talk through company / problem / ask → structured fields; still confirm + upload deck + GitHub | Strong inbound story | ~3–4h |
| **P2 (committed 2026-07-18)** | **Realtime voice chat over graph** | Mic button in Diligence chat: speak ↔ ElevenLabs Conversational AI agent wired to `/api/chat`; graph-grounded answer spoken back with citation | Ties UA graph + ElevenLabs; realtime wow | ~4h |
| **P3 (cut first)** | Activation voice note / outbound call | Draft spoken outreach to sourced founders | Cool but Negotiator-adjacent; skip unless ahead | — |

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

### P1 — Voice intake (if time)

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
| Multi-Attribute Reasoning | NL queries beyond keywords | Graph + Memory retrieval (“Berlin, AI infra, no prior VC…”) |
| Inbound | Deck + company name → screen | `/apply` flow |
| Outbound | Scan GitHub/hackathons → activate | Seeded outbound shortlist + “draft outreach” |
| 3-axis screening | Founder / Market / Idea-vs-Market — NOT averaged; each with trend | Separate scores + trends in UI + memo |
| Founder Score | Persists across applications, never resets | Stored on person entity in Memory |
| Trust Score | Per claim, evidence + confidence, flag contradictions | Claim objects linked to graph nodes / deck slides |
| Investor UX | Notion-simple, Bloomberg-depth | Dashboard: Pipeline / Diligence / Memo / Decision |
| Scope | Sourcing → Screening → Diligence → Decision only | No portfolio monitoring / fund ops |

### Stretch (if time)
1. **Agentic Traceability** — every conclusion cites exact node/slide (highest leverage)
2. Validator agent for claim cross-checks
3. Sourcing channel graph (which channels produce quality)

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
│                     INVESTOR WEB APP (Next.js)                   │
│  Thesis · Pipeline · Diligence (Graph+Chat) · Memo · Decision   │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST / Server Actions
┌────────────────────────────▼────────────────────────────────────┐
│                        API LAYER                                 │
│  /apply  /source  /analyze  /score  /memo  /chat  /decide       │
└───┬──────────────┬──────────────┬──────────────┬────────────────┘
    │              │              │              │
┌───▼───┐   ┌──────▼──────┐  ┌───▼────┐   ┌────▼─────┐
│Ingest │   │ Graph Engine│  │Scoring │   │  Memo    │
│GitHub │   │ (UA-inspired│  │Agents  │   │  Agent   │
│PDF/OCR│   │  pipeline)  │  │3-axis  │   │+ Trust   │
│Signals│   │ → graph.json│  │+Founder│   │          │
└───┬───┘   └──────┬──────┘  └───┬────┘   └────┬─────┘
    │              │             │             │
    └──────────────┴─────────────┴─────────────┘
                             │
                    ┌────────▼────────┐
                    │     MEMORY      │
                    │ Postgres/SQLite │
                    │ founders, claims│
                    │ graphs, scores  │
                    │ thesis, memos   │
                    └─────────────────┘
```

### External services
- **LLM API** (OpenAI / Anthropic) — summarization, scoring, memo, chat
- **GitHub** — clone or API for repos (demo: pre-cloned + one live small repo)
- **Optional:** PDF parse (pdf-parse / Unstructured), embeddings (pgvector / local)

### Understand-Anything integration modes (choose one for hackathon)

| Mode | Description | Recommendation |
|------|-------------|----------------|
| A. Reference-only | Reimplement slim pipeline from their design | Best for “built from scratch” story |
| B. Adapted modules | Port graph schema + layout utils + viz patterns | Best speed/quality balance |
| C. Subprocess | Call their CLI/pipeline on a repo path | Fastest, more “wrapper” risk |

**Hackathon default: Mode B** — own app + adapted graph schema/viz; our agents for VC scoring/memo. Precompute graphs for demo reliability; support one live analyze path.

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
  createdAt, updatedAt
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
  trend: 'improving' | 'stable' | 'declining'
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

```
foundergraph/                          # or vc-brain/
├── README.md                          # product pitch + setup + attribution
├── VC-BRAIN-PLAN.md                   # THIS FILE (repo root)
├── LICENSE
├── NOTICE                             # Understand-Anything attribution if adapted
├── docs/
│   ├── DEMO_SCRIPT.md
│   └── JUDGING_CHECKLIST.md
├── apps/
│   └── web/                           # Next.js investor app
│       ├── app/
│       │   ├── page.tsx               # landing / thesis picker
│       │   ├── pipeline/page.tsx      # inbound + outbound board
│       │   ├── opportunities/[id]/
│       │   │   ├── page.tsx           # diligence overview
│       │   │   ├── graph/page.tsx     # knowledge graph explorer
│       │   │   ├── chat/page.tsx      # graph-grounded chat
│       │   │   └── memo/page.tsx      # investment memo + decision
│       │   ├── apply/page.tsx         # inbound founder apply
│       │   └── api/
│       │       ├── apply/route.ts
│       │       ├── analyze/route.ts
│       │       ├── score/route.ts
│       │       ├── memo/route.ts
│       │       ├── chat/route.ts
│       │       └── decide/route.ts
│       ├── components/
│       │   ├── graph/                 # React Flow graph (UA-inspired)
│       │   ├── scores/                # 3-axis + Founder Score
│       │   ├── claims/                # Trust Score list
│       │   ├── memo/                  # Memo sections
│       │   └── thesis/                # Thesis editor
│       └── lib/
├── packages/
│   ├── memory/                        # DB schema + repos
│   ├── ingest/                        # GitHub + PDF ingest
│   ├── graph-engine/                  # UA-adapted analysis → graph.json
│   ├── scoring/                       # Founder Score + 3-axis + Trust
│   └── memo/                          # Memo generation + citations
├── data/
│   ├── thesis.default.json
│   ├── demo/                          # seeded founders, decks, prebuilt graphs
│   └── graphs/                        # runtime graphs
├── scripts/
│   ├── seed-demo.ts
│   ├── analyze-repo.ts                # CLI: repo → graph
│   └── precompute-demo-graphs.ts
└── vendor/                            # OPTIONAL: vendored UA snippets (with LICENSE)
    └── understand-anything/
```

Monorepo optional; for 24h a single Next.js app with `src/lib/{ingest,graph,scoring,memo,memory}` is fine. Structure above is the target mental model.

---

## 7. Feature modules (build order)

### M0 — Skeleton (Hour 0–2)
- Next.js app, env template, thesis default JSON
- Seed 3–5 demo opportunities (mix inbound/outbound + one cold-start)
- Empty pages wired for demo navigation

### M1 — Memory + Apply (Hour 2–5)
- SQLite/Postgres schema for Person, Opportunity, Claim, AxisScore, Memo
- Inbound: company name + deck upload + repo URL
- Persist Founder Score history

### M2 — Graph Engine (Hour 5–10)
- Adapt UA patterns: scan files → nodes/edges → summaries → `knowledge-graph.json`
- Deck path: extract sections/claims as document nodes
- Graph UI: pan/zoom, click node → summary + source ref + “Ask about this” (opens chat pre-scoped to that node)
- Highlight-to-ask: select text in summary / claim / deck panel → “Ask about selection” opens chat with the selection + owning node as context
- Chat responses stream token-by-token in the dashboard (real-time), with citations
- Precompute demo graphs; one “Analyze” button for live path

### M3 — Scoring + Trust (Hour 10–15)
- Claim extraction from deck + repo summaries
- Trust Score per claim + contradiction flags
- 3-axis scores with trends + evidenceIds
- Update Founder Score on Person
- Thesis filter: hide/downrank off-thesis

### M4 — Memo + Decision (Hour 15–18)
- Generate required memo sections; flag missing data (“Cap table: not disclosed”)
- Recommendation: Invest / Pass / More info
- Agentic Traceability: click claim → jump to graph node / slide text

### M5 — Outbound + NL query (Hour 18–20)
- Outbound board from seeded GitHub-like signals
- “Activate” → draft outreach email (no need for real send)
- NL search over Memory

### M5b — ElevenLabs voice (fit in Hour 16–20 if scoring/memo green)
- P0: `/api/brief` + “Play investment brief” on diligence page
- Optional P1: voice intake on `/apply` writing the same schema
- Pre-render one demo brief audio for the hero opportunity

### M6 — Polish + Demo (Hour 20–24)
- Demo script, video (MP4 H.264), README, submit on platform
- Attribution NOTICE for UA
- In pitch: one line on ElevenLabs voice brief (sponsor visibility)

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

POST /api/chat
  body: { opportunityId, message }
  → { answer, citations: [{ nodeId, quote }] }

POST /api/decide
  body: { opportunityId, decision: 'invest'|'pass'|'more_info', note? }
  → { ok }

POST /api/brief
  body: { opportunityId }
  → { script, audioUrl }   // ElevenLabs TTS; text-only fallback if no key

POST /api/intake/voice  (optional P1)
  body: { audio | agentSessionId }
  → { draftApplication fields for user confirm }

GET /api/pipeline?thesisId=
  → { inbound[], outbound[] }

GET /api/opportunities/:id
  → full diligence payload
```

---

## 9. Agent / LLM prompts (roles)

| Agent | Job | Inputs | Outputs |
|-------|-----|--------|---------|
| Ingest Normalizer | Structure deck + repo meta | files, urls | Opportunity + raw artifacts |
| Graph Summarizer | Plain-English node/domain summaries | graph skeleton | enriched graph |
| Claim Extractor | Extract verifiable claims | deck text, graph | Claim[] |
| Trust Validator | Attach evidence / contradictions | Claim[], graph, web? | trustScore, status |
| Axis Scorer | Score 3 axes + trends | Memory, thesis, claims | AxisScore[] |
| Founder Score Updater | Update persistent person score | history + new evidence | founderScore |
| Memo Writer | Investor memo with gaps flagged | all above | Memo |
| Chat Retriever | Answer with citations | question + graph | answer + evidenceIds |

Keep prompts in `packages/scoring/prompts/` and `packages/memo/prompts/` for iteration.

---

## 10. UI map

1. **Home / Thesis** — set fund lens; CTA “Open Pipeline”
2. **Pipeline** — two columns: Outbound | Inbound; cards show Founder Score + thesis fit
3. **Opportunity Diligence**
   - Header: company, source, status, Founder Score sparkline
   - Tabs: Overview | Graph | Claims | Chat | Memo
4. **Graph** — React Flow; filters by type/domain; node detail drawer
5. **Claims** — table: claim · trust · evidence · status
6. **Memo** — required sections + recommendation CTA
7. **Apply (public-lite)** — minimal founder form for inbound demo

Design notes for hackathon: clear hierarchy, evidence click-through, no vanity dashboards. Avoid looking like a generic purple AI SaaS clone; brand for “investor OS.”

---

## 11. Demo dataset

Prepare offline:
1. Strong technical founder — rich public GitHub (prebuilt graph)
2. Cold-start founder — little social, solid small repo + deck
3. Contradiction case — deck claims traction unsupported by evidence
4. Off-thesis company — should fail thesis filter
5. Optional: second application by same person → Founder Score trend

Store under `data/demo/` with decks, repo mirrors or git submodules, and precomputed `knowledge-graph.json`.

---

## 12. Evaluation checklist (map to judging %)

### Data Architecture & Intelligence — 30%
- [ ] Ingest GitHub + deck into Memory
- [ ] Deduplicate person across opportunities
- [ ] Outbound sourcing story with channels
- [ ] Cold-start path explicit

### Intelligent Analysis & Trust — 25%
- [ ] Per-claim Trust Scores with evidence
- [ ] Contradictions flagged
- [ ] Graph-grounded chat citations
- [ ] Chat streams in real time; node-click and text-highlight pre-scope the question
- [ ] Gaps marked, not fabricated

### Investment Utility & Execution — 30%
- [ ] Thesis-filtered recommendations
- [ ] 3 axes separate + trends
- [ ] Memo usable for 24h decision
- [ ] Invest / Pass / More info

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
| DB | SQLite (better-sqlite3 / Prisma) for speed; Postgres if hosted |
| LLM | OpenAI or Anthropic |
| PDF | pdf-parse or LlamaParse |
| Deploy | Vercel + local analyze scripts; or Railway |
| Package mgr | pnpm |

---

## 14. Env vars

```
OPENAI_API_KEY=
# or ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=        # voice brief (P0) + optional intake agent (P1)
ELEVENLABS_VOICE_ID=       # optional
ELEVENLABS_AGENT_ID=       # optional — voice intake
DATABASE_URL=file:./data/vcbrain.db
GITHUB_TOKEN=          # optional, rate limits
NEXT_PUBLIC_APP_URL=
```

Never commit secrets. Demo mode works with precomputed graphs + mocked LLM fixtures + pre-rendered brief audio if keys missing.

---

## 15. Pitch (3 minutes)

1. **Problem (20s):** Great founders invisible; diligence weeks; capital = networks  
2. **Insight (20s):** Code + claims can be a living graph — structure beats vibes  
3. **Product (60s):** Live demo — source → graph → trust → memo → decision → **Play investment brief** (ElevenLabs)  
4. **Differentiation (30s):** Persistent Founder Score + per-claim Trust + technical graph + voice brief for the investor  
5. **Ask (20s):** Built for Challenge 02 (VC Brain); shaped for Venture Track upside  

---

## 16. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Live analyze too slow | Precompute demo graphs; live on one tiny repo |
| Looks like UA clone | Own UX + VC workflow; attribution only in README |
| Hallucinated diligence | Trust status `unavailable`; never invent ARR |
| Scope creep | Cut channel ML, real email send, fund ops |
| Voice steals Challenge 02 time | Ship P0 TTS brief only; cut P1/P2 |
| Looks like Negotiator entry | No price haggling; voice = diligence brief/intake only |
| License | Read UA LICENSE; NOTICE for adapted files |

---

## 17. Definition of Done (submit)

- [ ] End-to-end demo: apply/source → analyze → score → memo → decide  
- [ ] 3-axis + Founder Score + Trust claims visible  
- [ ] Graph explorer + at least one cited chat answer  
- [ ] Chat UX: streaming responses; “Ask about this” from node click; highlight-to-ask from selected text  
- [ ] Cold-start founder in demo set  
- [ ] ElevenLabs P0: Play investment brief (or pre-rendered demo audio)  
- [ ] ElevenLabs P2: realtime voice chat over graph (fallback: cut to P0 brief per §0 rule if core loop at risk)  
- [ ] README + PLAN + DEMO_SCRIPT  
- [ ] Attribution for Understand-Anything if code adapted  
- [ ] Demo video MP4 H.264  
- [ ] Project submitted under **Challenge 02 — The VC Brain** before deadline  

---

## 18. Immediate next actions

1. Create repo `foundergraph` (or team name) from this plan  
2. Scaffold Next.js + Memory schema  
3. Vendor/adapt graph schema + React Flow shell from Understand-Anything patterns  
4. Seed demo data + precompute 3 graphs  
5. Implement score → memo → decision  
6. Film demo + submit  

---

## 19. References

- Challenge brief (submit under this): `Topics/1784381921507-02-Maschmeyer-Group-The-VC-Brain.docx.pdf`
- ElevenLabs challenge (do **not** submit under; voice ideas only): `Topics/1784382172163-01-ElevenLabs-The-Negotiator.docx.pdf`
- Understand-Anything: https://github.com/Egonex-AI/Understand-Anything  
- Product site (inspiration only): https://understand-anything.com/  
- ElevenLabs docs: https://elevenlabs.io/docs  
- Hack-Nation showcase: https://projects.hack-nation.ai/#/

# VC Brain — Hackathon Product Spec & Architecture Plan

**Hackathon:** Hack Nation 6th Global AI Hackathon  
**Challenge:** 02 — The VC Brain (Maschmeyer Group)  
**Submission platform:** https://projects.hack-nation.ai/#/  
**Event:** https://luma.com/8rfryv5k  
**Deadline:** Sunday, July 19, 2026 — 9:00 AM ET  

**Product working name:** FounderGraph (TBD — pick before demo)  
**One-liner:** An AI operating system that sources founders, builds a living technical + claim graph from GitHub and decks, scores them on three axes with Trust Scores, and produces a 24-hour investment decision memo.

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
├── LICENSE
├── NOTICE                             # Understand-Anything attribution if adapted
├── docs/
├── VC-BRAIN-PLAN.md                   # THIS FILE (repo root)
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
- Graph UI: pan/zoom, click node → summary + source ref
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

### M6 — Polish + Demo (Hour 20–24)
- Demo script, video (MP4 H.264), README, submit on platform
- Attribution NOTICE for UA

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
DATABASE_URL=file:./data/vcbrain.db
GITHUB_TOKEN=          # optional, rate limits
NEXT_PUBLIC_APP_URL=
```

Never commit secrets. Demo mode works with precomputed graphs + mocked LLM fixtures if keys missing.

---

## 15. Pitch (3 minutes)

1. **Problem (20s):** Great founders invisible; diligence weeks; capital = networks  
2. **Insight (20s):** Code + claims can be a living graph — structure beats vibes  
3. **Product (60s):** Live demo — source → graph → trust → memo → decision  
4. **Differentiation (30s):** Persistent Founder Score + per-claim Trust + technical graph  
5. **Ask (20s):** Why this wins Challenge 02 / venture track  

---

## 16. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Live analyze too slow | Precompute demo graphs; live on one tiny repo |
| Looks like UA clone | Own UX + VC workflow; attribution only in README |
| Hallucinated diligence | Trust status `unavailable`; never invent ARR |
| Scope creep | Cut channel ML, real email send, fund ops |
| License | Read UA LICENSE; NOTICE for adapted files |

---

## 17. Definition of Done (submit)

- [ ] End-to-end demo: apply/source → analyze → score → memo → decide  
- [ ] 3-axis + Founder Score + Trust claims visible  
- [ ] Graph explorer + at least one cited chat answer  
- [ ] Cold-start founder in demo set  
- [ ] README + PLAN + DEMO_SCRIPT  
- [ ] Attribution for Understand-Anything if code adapted  
- [ ] Demo video MP4 H.264  
- [ ] Project submitted on Hack-Nation platform before deadline  

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

- Challenge brief: `Topics/1784381921507-02-Maschmeyer-Group-The-VC-Brain.docx.pdf`
- Understand-Anything: https://github.com/Egonex-AI/Understand-Anything  
- Product site (inspiration only): https://understand-anything.com/  
- Hack-Nation showcase: https://projects.hack-nation.ai/#/

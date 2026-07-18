# FounderGraph — Lovable frontend build brief

Purpose: hand this WHOLE document to Lovable (or any external UI builder) to build the full interactive frontend prototype with static mock data. It is self-contained — the builder does not need repo access. A Claude session supervising the build should also read `docs/product/05-screen-map.md`, `02-user-journeys.md`, and `docs/ops/DESIGN.md` for source-of-truth detail.

Status: design direction FROZEN 2026-07-19 00:05 BST (human picks). Scope locked per VC-BRAIN-PLAN v3.

---

## 1. What this app is

FounderGraph is an AI diligence tool for a solo VC investor. One-liner: **"Turns 3 weeks of vibes into 24 hours of evidence."** The investor sets an investment thesis; startups enter a pipeline (sourced outbound, or inbound via a public apply form); the app analyzes each founder's real GitHub repo + pitch deck into a knowledge graph, scores three axes (Founder / Market / Idea-vs-Market), flags contradicted claims with clickable evidence, writes an investment memo with disclosed gaps, and lets the investor record a decision. Audience for the demo: hackathon judges watching on a projector.

This build is the **interactive prototype**: every screen, every state, full navigation — but ALL data is static mock JSON and all "analysis" is simulated (timed state transitions). No backend, no API calls, no LLM. It must feel real when clicked through.

## 2. Design direction (FROZEN — do not deviate)

- **Mood:** calm, professional, evidence-first. This is an "investor OS", not a flashy AI toy.
- **Register:** Linear (linear.app) is the reference — crisp, fast, dense-but-clean, quiet chrome, strong keyboard-feeling UI. "Linear's cousin for VC diligence."
- **Theme: LIGHT only.** Stage projector rule. Do not build a dark mode.
- **Density:** data-dense operator dashboard. Tight rows, more per screen, small labels — never cramped chaos.
- **Anti-slop bans:** no purple-to-blue gradient heroes, no emoji section markers, no stock illustrations, no big rounded marketing cards, no generic "AI magic sparkle" iconography.
- **Numbers are product:** all scores/counts in tabular mono, right-aligned, consistent decimals.
- **Trust surfaces are first-class:** evidence citations, provenance labels ("replay of captured run 2026-07-18"), contradiction flags, and the decision control get the most design care, not the least.
- **The wow moment gets the best design:** the red contradicted claim on the Diligence page, and its click-jump to the exact deck slide + graph node. Most polished interaction in the app.

### Tokens

```css
--bg: #FAFAFA;          /* near-white, slight cool bias */
--surface: #FFFFFF;
--border: #E4E4E9;
--text: #17171C;
--muted: #6E6E7A;
--accent: #4F46E5;      /* indigo — links, primary buttons, selected states */
--positive: #0F7B4D;    /* verified / invest */
--negative: #C92A2A;    /* contradicted / fails thesis */
--warning: #B7791F;     /* unsupported / not disclosed */
```

- Type: Inter (UI), JetBrains Mono (all numbers, scores, IDs, code refs). Scale: 24px page title / 16px section / 14px body / 13px mono data / 11px uppercase labels with letter-spacing.
- Spacing: 4px base unit. Radius: 6px max. Shadows: minimal, borders do the separation.
- Component library: shadcn/ui + Tailwind (Lovable default is fine).

## 3. Routes and wireflow

```
/login  (demo-lite gate)          /apply  (public, no login)
    |                                 |
    v                                 v
/  Pipeline  --->  /opportunities/[id]  Diligence  --->  /opportunities/[id]/graph  Graph
   ^                        |                                     |
   |                        +-- decision + voice brief            +-- streaming cited chat (simulated)
   |                        +-- contradiction click-jump ---------+-- "Start here" guided tour
   +---------------------------- back to pipeline
```

- `/login`: single demo credential (email + password prefilled hint "investor@foundergraph.demo / demo"). Any submit succeeds → sets fake session → Pipeline. Public `/apply` never sees the gate.
- Transitions between golden-path screens must be instant (no artificial spinners between routes).

## 4. Mock data (ship as `src/data/*.json`)

Four opportunities. All numbers synthetic.

1. **ECC (hero, inbound)** — "ECC — agent harness performance optimization system." Founder: Supawich (solo builder). Rich repo. Founder Score 82. Thesis fit: pass. Carries the ONE red contradicted claim: deck says "sub-100ms agent routing in production"; repo evidence says benchmark README reports 340ms median. Claims list ~8 items: mix of verified (green), unsupported (amber), one contradicted (red). Has prior-application history row ("Applied Oct 2025 — passed; score then 61 → now 82, +21").
2. **Lattice-DB (outbound showcase)** — rich-GitHub infra startup, precomputed graph only, Founder Score 74, all-verified claims.
3. **BrightCart (outbound, off-thesis)** — greyed card with chip "fails thesis: check size" (raising $2M, thesis cap $100K). Founder Score 68.
4. **PipeWarden (live inbound demo beat)** — arrives via simulated Scan/Apply during demo; card pops into Outbound with "crossed conviction threshold" highlight. Founder Score 71.

Also ship: `thesis.json` (stages: pre-seed/seed; check size $100K; geo US/EU; focus "AI infra"; technical bar: high), one knowledge graph (~40 nodes/60 edges for ECC: files, claims, concepts; each node has `id, type, name, summary, sourceRef {file, lines | slide}`), `memo-ecc.json` (sections: thesis fit, team, market, product, risks; two rows marked "Not disclosed — founder did not provide"), `tour-ecc.json` (7 ordered steps, each: node id + one-sentence teaching caption).

## 5. Screens (full spec in repo `docs/product/05-screen-map.md` — states below are mandatory)

### 5.1 Pipeline `/`
Two columns **Outbound | Inbound**, thesis summary bar on top (opens thesis drawer with all fields + live check-size toggle — toggling to $2M un-greys BrightCart in real time). Cards: company, source channel badges (GitHub / hackathon / apply), Founder Score (mono), thesis-fit chips, "why surfaced" evidence line. Top bar: NL query box ("show founders with rising commit velocity" → simulated ranked results with citation chips) + **Scan button** → replay progress ("replaying captured scan from 2026-07-18") → PipeWarden card pops in with threshold animation. A "signal → decision" timer chip lives on cards (e.g. "4h 12m from signal").
States: loading / ready / query running / query empty ("No cited matches") / scan replay running / no opportunities (honest empty, no fake cards) / data error (named source + seeded fallback) / off-thesis grey.

### 5.2 Diligence `/opportunities/[id]`
ONE scrolling page: header (company, source, status, Founder Score, timer chip, **"Play investment brief"** audio control) → Overview → three SEPARATE axis scores (Founder / Market / Idea-vs-Market, each with a one-line "because" + evidence count — never one blended number) → Claims list with trust states (verified green / unsupported amber / **contradicted red**) → Memo (with "Not disclosed" gap rows) → decision CTA (Invest / Pass / More info + note field).
**Wow moment:** clicking the red contradicted claim opens a split evidence view: exact deck slide (image placeholder with highlighted sentence) AND the graph node with the conflicting benchmark line. Make this transition beautiful.
"Show reasoning" opens a step timeline drawer (staged pipeline steps with timestamps from provenance metadata — never raw JSON).
States: loading / staged analysis (stage-by-stage progress, cached stages shown) / replay mode (provenance label) / ready / no memo yet / missing info ("Not disclosed") / contradicted claim / unsupported claim / decision saving / decision saved (distinct from AI recommendation) / audio loading / audio unavailable (falls back to printed script) / not found.

### 5.3 Graph `/opportunities/[id]/graph`
React Flow (or equivalent) canvas: pan/zoom, ~40 nodes typed by color-coded category (file / claim / concept), node click → right drawer (name, summary, type, sourceRef, "Ask about this" button, text-selection → "ask about selection"). Chat panel: streaming simulated answers that ALWAYS end with node citations (chips that focus the cited node) or a clean refusal ("No citable evidence for that — try narrower"). **"Start here" tour button**: steps through 7 precomputed nodes with captions, prev/next, highlights current node, dims rest.
States: loading (with graph-source/replay status) / ready no-selection / node selected / empty graph / parse error / chat streaming / chat cited / chat refuses / chat unavailable (offers rehearsed replay Q&A) / source target missing (honest broken-locator error) / tour active.

### 5.4 Apply `/apply` (public)
Minimal form: company name*, repo URL*, deck upload (OPTIONAL — label it "Optional — we can start from your repo alone"), founder name (optional), links (optional). Submit → success with created opportunity ID. No investor chrome on this page.
States: initial / file selected (sanitized name) / validation error (field-level, values preserved) / upload rejected (type/size) / submitting (double-submit disabled) / success / server failure (text preserved).

### Drawers recap
Thesis drawer (Pipeline) · Node drawer (Graph) · Reasoning timeline (Diligence) · Evidence split-view (Diligence→deck+graph) · Audio control (Diligence) · Tour overlay (Graph) · Login gate.

## 6. Golden path (design screens in THIS walk order — it is the 3-min demo)

1. Pipeline: thesis bar → hero ECC card in Inbound (history row visible: "score 61 → 82")
2. Card → Diligence: axes → claims → **click red contradicted claim → evidence split view** (wow)
3. → Graph: node drawer → "Start here" tour (2 steps) → one chat question with citations
4. Back → Diligence: play brief (audio control) → Memo gaps → **Invest** decision saved
5. Pipeline: Scan replay → PipeWarden card pops in over threshold
6. Thesis drawer: check-size toggle → BrightCart un-greys live

## 7. Out of scope — do NOT build

Dark mode · settings/profile/multi-user · portfolio-wide chat · additional dashboards, onboarding, fund-ops, outreach screens · real auth · any real network call · voice recording (audio is a local MP3 play control with script fallback) · mobile-first layouts (desktop projector is the target; don't break at 1280px).

## 8. Engineering constraints (so the prototype ports into the real app)

- Vite + React + Tailwind + shadcn is fine (Lovable default). Keep ALL mock data in `src/data/*.json` — never inline in components.
- Component per screen section; screens must not import each other's internals. The real app is Next.js App Router — keep components framework-portable (no Vite-specific magic in components).
- Every state listed above must be reachable via a small dev-only "state switcher" control (bottom-right, collapsible) so the human can review every state without a backend.
- Honest states everywhere: replay/simulated things are LABELED as replay ("replaying captured run"), never presented as live.

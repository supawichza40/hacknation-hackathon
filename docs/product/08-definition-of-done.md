# FounderGraph definition of done

FounderGraph is done only when every committed and never-cut check below passes, every retained cuttable feature passes its requirement, every formally cut feature passes its named fallback, and the Challenge 02 submission artifacts are present. Stretch realtime voice never blocks done.

Per the suite design §6, Layer 1 **extends** `VC-BRAIN-PLAN.md` §12 (evaluation checklist) and §17 (submit DoD) — it links back rather than replacing them; read those sections alongside this doc. Rubric wording: `docs/ops/RUBRIC.md` §1–2.

## Layer 1: judge checklist (rubric rows expanded)

### Data Architecture and Intelligence — 30% (plan §12 first block)

- [x] A real repository + hero deck were ingested during Wave 0, with precomputed/replay fallbacks preserved. — Evidence: precomputed graph in `data/graphs/` + `data/demo/repos/ecc/` (commit fa92d3c); deck claims extracted via real `claude -p` (a9df838); smoke `graph-ecc-42-nodes` (42n/49e) + `contradiction-resolves-slide4-graph`.
- [x] Memory stores structured Person, Opportunity, ScreeningFacts, Evidence, Claim, AxisScore, Memo data. — Evidence: `src/lib/db.ts` tables `person`/`opportunity`/`screening_facts`/`evidence`/`claim`/`axis_score`/`memo` (+ `decision` in `src/lib/decision.ts`).
- [x] Normalized GitHub URL or email deduplicates the returning founder across opportunities. — Evidence: `normalizeRepoUrl` (`src/lib/thesis.ts`, plan §5) + deterministic dedup in `src/lib/apply.ts`; returning-founder delta line in `src/lib/scoring.ts`.
- [x] Founder Score history persists across applications — never resets. — Evidence: smoke `r1-query-improving` cites `score-history://opp-ecc/2025-10-01`; `FounderObservation` history in `src/lib/scoring.ts`.
- [x] Every known screening fact is evidence-backed; unknowns stay explicit. — Evidence: smoke `diligence-memo-not-disclosed` (7 gaps) + check:done `artifacts` gate (no dangling Evidence IDs).
- [ ] **Cold-start caveat (rubric §1 note — a tiebreaker, never silently dropped):** the hero demonstrates the pre-track-record case through inspectable public artifacts. — Open: no explicit cold-start / pre-track-record demonstration verified this pass (inbound/outbound/off-thesis/returning states confirmed in `PipelineBoard.tsx`; cold-start absent) — M-lane/human to confirm or close as a real gap.
- [x] Outbound cards keep source-channel context; R3 evidence depth shown if retained. — Evidence: `source` + `source_channel` in `src/lib/db.ts` and `src/lib/diligence.ts`; outbound query lane in `src/lib/query.ts`.
- [x] R1 cross-founder query returns ranked cited results if retained. — Evidence: smoke `r1-query-improving` (ECC cited); ranked query lanes in `src/lib/query.ts`.
- [x] R7 captured scan pops the recorded threshold-crossing candidate if retained — labeled replay, never live. — Evidence: smoke `scan-reveals-pipewarden` (topScore 0.8112; visible 0→1); `src/app/api/scan/route.ts` + `data/replay/scan/` (Tavily, commit 4062322).
- [x] Replays identify their real provenance; nothing is a mocked fixture. — Evidence: `data/replay/**/provenance.json` + `data/replay/scan/metadata.json`; honest-provenance precompute (fa92d3c).

Source: plan §0.5 d3–d5, d12; §2; §5; §7 M1/M2/M4; §11; §12.

### Intelligent Analysis and Trust — 25% (plan §12 second block)

- [x] Every claim shows Trust Score, confidence, status, evidence. — Evidence: `claim` table (`src/lib/db.ts`) carries all four fields; smoke `diligence-one-contradiction` (1 contradicted); FR-TRUST-02.
- [x] Supported / unsupported / contradicted / unavailable follow the locked epistemic rules. — Evidence: smoke `diligence-one-contradiction` (exactly 1 contradicted) + `diligence-memo-not-disclosed`; FR-TRUST-01.
- [x] **Wow moment:** the hero's red contradicted claim opens the exact deck slide + graph node with incompatible cited facts. — Evidence: smoke `contradiction-resolves-slide4-graph` resolves to `deck://ecc/slide/4` + graph `...the-longform-guide.md:99-101`.
- [x] Every axis rationale and material memo conclusion resolves to Evidence. — Evidence: check:done `artifacts` gate (no dangling Evidence IDs) + smoke three-axes / contradiction beats.
- [x] Chat streams a cited answer or refuses; node-click and highlight context use the same grounded path. — Evidence: smoke `chat-cited-or-refusal` (3 rehearsed cited; ungrounded refused); shared path in `src/lib/chat.ts`; FR-CHAT-02/03.
- [x] Missing memo information is "unavailable" / "not disclosed" — never fabricated. — Evidence: smoke `diligence-memo-not-disclosed` (7 not-disclosed gaps); `CANONICAL_CATEGORIES` in `src/lib/memo.ts`.
- [x] R5 (if retained) shows provenance as a step timeline, never raw model JSON. — Evidence: R5 reasoning drawer + provenance steps / empty state in `src/app/opportunities/[id]/DiligenceClient.tsx:443`; `loadProvenance` on graph page.
- [x] Invalid structured output gets one repair, then captured replay. — Evidence: ingest pipeline `flatten → claude -p → zod → repair → fallback` (fa92d3c) with real captured claims (a9df838).

Source: plan §0.5 d2–d7, d12; §2; §5; §7 M2–M4; §9; §12.

### Investment Utility and Execution — 30% (plan §12 third block)

- [x] Thesis configuration filters every recommendation; R4 live check-size works if retained. — Evidence: smoke `thesis-toggle-brightcart` (off-thesis on checkSize; widening un-greys); `src/lib/thesis.ts`.
- [x] Founder / Market / Idea-vs-Market scores are separate, evidence-backed, never averaged. — Evidence: smoke `diligence-three-axes` (3 separate axes); `computeAxisScores` in `src/lib/scoring.ts` (no averaging).
- [x] Trends use two dated observations or stay baseline. — Evidence: `Trend` + `FounderObservation` in `src/lib/scoring.ts`; smoke dated observation (2025-10-01); FR-SCORE-03.
- [x] Memo contains the planned sections, recommendation, thesis fit, explicit gaps (R6 auto-"not disclosed"). — Evidence: `CANONICAL_CATEGORIES` in `src/lib/memo.ts`; smoke `diligence-memo-not-disclosed`.
- [x] The human records Invest / Pass / More info; the decision survives reload. — Evidence: smoke `decision-invest-persists` (verdict read back from DB); `decision` table in `src/lib/decision.ts`.
- [x] The human decision is visibly distinct from the memo's generated recommendation. — Evidence: `DiligenceClient.tsx:216` "Recommendation is deferred to your decision below" + `:353` "This is your recorded decision (read back from the database) — not an AI recommendation."
- [x] R2 shows first-signal→decision elapsed time from a human-approved timestamp formula. — Evidence: R2 open→save timer `DiligenceClient.tsx:79` (`fmtElapsed`); formula chosen by M3 (RESOLVED-by-implementation).
- [ ] The pre-rendered investment brief plays with no live TTS dependency and has a text fallback. — Open: text fallback present (`DiligenceClient.tsx:204` "Voice unavailable — script:"); pre-rendered ElevenLabs MP3 not yet built (HUMAN TODO — needs live key/credits).
- [x] The never-cut hero path works with outbound network disabled. — Evidence: `smoke:golden` disables `globalThis.fetch` and passes 13/13 offline; check:done gate (d).

Source: plan §0.5 d4/d5/d8/d12 + never-cut list; §1b; §2; §5; §7 M3–M5b; §8; §12; §17.

### UX and Design — 15% (plan §12 fourth block)

- [x] Pipeline, Diligence, and Graph tell one investor narrative; optional Apply never blocks it. — Evidence: three surfaces wired (`PipelineBoard.tsx`, `DiligenceClient.tsx`, `graph/GraphClient.tsx`); Apply is a separate public route (`src/app/apply/page.tsx`) that never gates the investor path (smoke `apply-creates-inbound`). Narrative cohesion still owned by the human UX eyeball below.
- [ ] Pipeline distinguishes inbound, outbound, off-thesis, cold-start, returning-founder states. — Open: 4/5 confirmed in `PipelineBoard.tsx` (Inbound + Outbound columns, off-thesis greying/badge, returning-founder beat); cold-start state not verified — see cold-start caveat above.
- [x] Diligence is one scrolling page: overview → claims → memo → decision. — Evidence: single `<section>` in `DiligenceClient.tsx` scrolls Overview (:223) → claims → memo → Decision (:341).
- [x] Graph gives a non-technical investor pan/zoom, node summary, sourceRef, grounded chat. — Evidence: SVG graph canvas (d6951a4); smoke `graph-ecc-42-nodes` + `contradiction-resolves-slide4-graph` (sourceRef resolves) + `chat-cited-or-refusal`.
- [x] R8 guided tour steps run prev/next from precomputed JSON, highlighting the current node; a broken locator shows an honest error, never a crash — if retained (committed by human ruling 2026-07-19 00:05 BST, plan §0.5 d14; T-4h ladder placement). — Evidence: smoke `tour-ordered-steps` (7 ordered steps); `loadTour` on graph page.
- [ ] Loading, empty, error, replay, unavailable, and fallback states are explicit. — Open: replay/unavailable/empty confirmed (provenance label, "No provenance steps captured", "Voice unavailable", "No memo generated"); loading/error states not verified this pass — human UX eyeball.
- [ ] Evidence links and the contradiction jump are understandable without documentation. — Open: human comprehension judgment (UX eyeball).
- [ ] No vanity dashboard; evidence and decisions stay visually dominant; "investor OS" brand, not a generic AI-SaaS clone. — Open: human design judgment (UX eyeball).
- [ ] A human verifies the final presentation against the rubric wording "intuitive, clear, and beautifully designed." — Open: HUMAN TODO — eyeball all four surfaces at demo viewport (see manual table).

Source: plan §0.5 d6/d7/d11; §10; §12; §15.

> Event-wide layer (rubric §1 note): the two ≤60-sec videos and the docs are themselves a scored axis (Communication). Video quality checks live in the manual table below — treat them as rubric points, not packaging. The other two event-wide axes (Technical depth, Innovation & creativity) are judged from the whole submission — no single check carries them.

> Winner layer (rubric §5 — decides who wins): real niche with a face, agentic framing, sourced problem statistics, and 3-minute comprehension are pitch-layer gates owned by `docs/ops/PITCH.md` (script beats 0:00–0:20 hook stats, 0:20–0:45 the face, 2:15–2:40 agentic + sponsor tools, 2:40–3:00 track-sentence close) — deliberately not duplicated as product checks here. Human-in-the-loop and sponsor-tool visibility already appear above as functional checks; the pitch must present them as strengths, never apologies.

## Layer 2: functional-requirement traceability

Every FR from 03-functional-requirements.md appears exactly once. No FR without a check; no product check without an FR.

| FR | Verify method | Done when |
|---|---|---|
| FR-THESIS-01 | Automated thesis fixture test + Pipeline inspection | Stored thesis fields load and deterministically change fit without inventing missing facts |
| FR-THESIS-02 | SMK-M1-05 + screenshot if retained | R4 greys the check-size card, or read-only fallback formally recorded |
| FR-PIPE-01 | `npm run smoke:golden` Pipeline step | The 3 shown cards land in correct columns with required fields; PipeWarden stays hidden until the scan (demo set = 3 shown + 1 hidden inbound) |
| FR-PIPE-02 | SMK-M1-04 + evidence-integrity test | R3 reason resolves to Evidence, or badge-only fallback recorded |
| FR-PIPE-03 | SMK-M4-07 | Retained R1 returns ranked cited results; else cut status recorded |
| FR-PIPE-04 | SMK-M2-05 with network disabled + SMK-W0-TV / SMK-W0-SRC-FB capture proof | Retained R7 deterministically pops the captured candidate; else seeded fallback passes |
| FR-PIPE-05 | Golden-smoke hero assertion + manual screenshot | Cold-start hero surfaced through public-artifact evidence |
| FR-APPLY-01 | Optional Apply smoke + traversal/validation tests | Valid retained Apply creates one Inbound record; invalid input creates none; or seeded fallback recorded |
| FR-AUTH-01 | Manual check: fresh browser hits `/` and `/apply` | `/apply` public; investor surfaces gated behind the single demo login |
| FR-AUTH-02 | Cookie present/absent check on investor surfaces | Session cookie separates roles; no signup flow exists |
| FR-MEM-01 | DB restart integration test | Required records survive restart |
| FR-MEM-02 | SMK-M1-02 | Returning fixture resolves to one Person |
| FR-MEM-03 | SMK-M1-03 | Prior Founder Score/history remains; new dated row appended |
| FR-MEM-04 | SMK-M3-05 | No material record has a dangling Evidence ID |
| FR-ANALYZE-01 | SMK-M2-02 + SMK-M2-03 | Stages report progress, cache completed work, recover via replay |
| FR-ANALYZE-02 | SMK-W0-LLM, SMK-W0-GH, SMK-W0-PDF, SMK-W0-PDF-FB, SMK-M2-01 | Repo/deck inputs produce graph, claims, locators via live or planned fallback |
| FR-ANALYZE-03 | SMK-W0-LLM-FB | One repair, then the real captured replay with provenance |
| FR-GRAPH-01 | SMK-M2-01 + screenshot | Graph interactive; selected node sourceRef resolves |
| FR-GRAPH-02 | SMK-M2-04 if retained | Timeline from provenance metadata, no raw JSON; or R5 cut recorded |
| FR-TRUST-01 | SMK-M3-01 | All four Trust states match the locked rules |
| FR-TRUST-02 | Claims UI test + SMK-M3-05 | Every claim shows all required fields with valid evidence links |
| FR-TRUST-03 | SMK-M3-02 + screenshot/video timestamp | Red contradiction opens both exact evidence targets |
| FR-SCORE-01 | SMK-M3-03 | Exactly three separate evidence-backed axes, no average |
| FR-SCORE-02 | Determinism test in SMK-M3-03 | Repeated stored inputs give identical thesis/axis/Founder/Trust outputs |
| FR-SCORE-03 | SMK-M3-04 | One observation stays baseline; two dated observations follow the approved rule |
| FR-CHAT-01 | SMK-M4-04 + SMK-M4-05 | Cited response streams; unanswerable query refuses; any last-resort cut disclosed |
| FR-CHAT-02 | SMK-M4-06 node case | Node ID reaches the shared chat path; answer cites or refuses |
| FR-CHAT-03 | SMK-M4-06 selection case | Selected text + node ID reach the shared chat path; answer cites or refuses |
| FR-MEMO-01 | SMK-M4-01 | Hero memo passes schema; material conclusions cite or show unavailable |
| FR-MEMO-02 | SMK-M4-02 | Each absent R6 category appears as "not disclosed" |
| FR-DECIDE-01 | SMK-M4-03 | Each decision persists after reload; distinct from generated recommendation |
| FR-DECIDE-02 | SMK-M4-08 | R2 renders from persisted timestamps per the human-approved formula |
| FR-VOICE-01 | SMK-W0-VOICE / SMK-W0-VOICE-FB capture proof + SMK-M5B-01 through SMK-M5B-03 | Local MP3 plays/pauses; script matches Memory; missing audio shows text fallback |
| FR-DEMO-01 | Full `npm run smoke:golden` with network disabled | The planned demo set (3 shown + 1 hidden inbound PipeWarden) completes the retained golden path offline |
| FR-ATTR-01 | Manual LICENSE/NOTICE/README audit + adapted-file inventory | License decision recorded; all adapted code attributed, or self-written path used |

## Layer 3: automated gate

Required future command (a specification, not evidence it exists):

```sh
npm run check:done
```

`npm run check:done` shall:

1. Run the project's test, typecheck, lint, and build commands. Exact script names TBD (owner: human).
2. Invoke `npm run smoke:golden` with outbound network disabled.
3. Validate all graph, claim, Evidence, score, memo, replay, scan, slides, and brief artifacts used by the retained demo.
4. Fail on any dangling Evidence ID, invalid schema, missing required fallback, uncited completed chat answer, or a demo set other than the planned set (3 shown + 1 hidden inbound: `opp-ecc`, `opp-lattice`, `opp-brightcart`, `opp-pipewarden`).
5. Confirm each retained cuttable feature passes and each formally cut feature has a passing fallback. Machine-readable cut-status format TBD (owner: human).
6. Verify required submission files via the manifest below.
7. Verify no configured secret appears in client assets, logs, replay/demo data, or submitted files.
8. Verify the repository state is pushed to the intended remote/branch (Law 1: push == done). Remote/branch + non-interactive check method TBD (owner: human).
9. Print a concise pass/fail report; exit non-zero on any failed committed gate.

### Required-file manifest

| Artifact | Requirement | Path/status |
|---|---|---|
| Product README | Pitch, setup, track framing, conditional UA attribution | `README.md` |
| Locked plan | Scope source included in submission | `VC-BRAIN-PLAN.md` |
| Requirements suite | Product docs 01–08 plus Lovable-track 09–10 (09 = prototype brief; 10 = prototype-only build gate for `lovable/Founder Graph Core/` — it never gates this product DoD) | `docs/product/01…10` |
| Demo script | Rehearsed flow (plan §17 DEMO_SCRIPT) | `docs/ops/DEMO-SCRIPT.md` — created at feature freeze from PITCH.md + SUBMISSION.md shot list |
| License | Repo license present | `LICENSE` (plan §6) |
| NOTICE | Present when UA code adapted | `NOTICE`, conditional |
| Hero graph + claims | Validated precomputed artifacts | `data/graphs/` + `data/demo/repos/ecc/` — present (ECC 42n/49e graph + claims) |
| Provenance replay | Real captured LLM run | `data/replay/memo/provenance.json` + `raw-model-output.json` — present |
| Scan replay | Real captured Tavily sourcing scan | `data/replay/scan/` |
| Voice brief | Pre-rendered hero MP3 + text script | Path TBD (owner: human) |
| Demo video | ≤60 sec, MP4 H.264 | Path TBD (owner: human) |
| Tech video | ≤60 sec (stack, highlights, limitations) | Path TBD (owner: human) |

## Manual-only release and submission checks

| Check | Owner | Verify step | Source |
|---|---|---|---|
| UX/design quality | TBD (owner: human) | Review all four surfaces at demo viewport; capture Pipeline, contradiction, Graph/chat, memo/decision, voice states | Rubric §1 UX |
| Contradiction truth | TBD (owner: human) | Read both cited source facts; confirm genuine incompatibility | Plan §0.5 d6 |
| External preflight | TBD (owner: human) | Inspect real-call proof + fallback for LLM, ElevenLabs, GitHub, Tavily, PDF parser (capture smokes: SMK-W0-VOICE, SMK-W0-VOICE-FB, SMK-W0-TV, SMK-W0-SRC-FB, SMK-W0-PDF-FB) | Design §5; plan §0.5 Wave 0 |
| Offline rehearsal | TBD (owner: human) | Run the retained golden path 3× with network disabled; log pass/fail | Plan §0.5 freeze |
| Voice brief content | TBD (owner: human) | Listen once; compare every spoken value with Memory/Memo | Plan §1b P0 |
| License decision | TBD (owner: human) | Read the actual UA LICENSE/NOTICE requirements; approve adapted or self-written path | Plan §0.5 d10; §1 |
| Platform URL requirement | TBD (owner: human) | Check the submission form at M0 draft; record whether a live URL is required | Plan §0.5 open items/M0 |
| Demo + tech videos | TBD (owner: human) | Play both final ≤60s H.264 MP4s end-to-end; wow moment + voice closer visible/audible; recorded at feature freeze, not the final hour | Plan §0.5 packaging; §15; rubric §1 event-wide Communication axis; §4 |
| Team video | TBD (owner: human) | Present per kickoff deck p38 | Rubric §4 |
| 1-page PDF report + zip + summary + dataset field | TBD (owner: human) | Per docs/ops/SUBMISSION.md checklist (150–300-word summary; dataset link or "N/A") | Plan §0.5 packaging; §17; rubric §4 |
| Remote state | TBD (owner: human) | Open the submitted remote repo; confirm commits/files visible (push == done) | Plan §0.5 block-boundary rule; §17; CLAUDE.md Law 1 |
| Challenge submission | TBD (owner: human) | Confirm submitted under Challenge 02 before Sun Jul 19 09:00 ET; save receipt | Plan §0; §17; §18; rubric §2/§4 |

## Open questions — status at final reconcile (2026-07-19)

Resolved tonight (human rulings + implementation):

- Auth: **RESOLVED** — demo-lite is the locked contract (plan §0.5 d13); `/apply` public, investor surfaces gated behind the single demo login (FR-AUTH-01/02); no signup flow.
- Demo-set counting: **RESOLVED** — 3 shown + 1 hidden inbound PipeWarden (plan §0.5 d5). check:done `PLANNED_OPPS` = `opp-ecc`/`opp-lattice`/`opp-brightcart`/`opp-pipewarden`; seed prints "4 opportunities (3 visible)"; smoke reveals PipeWarden on scan.
- Apply payload: **RESOLVED** — minimum payload is repo-URL-derived (`src/lib/apply.ts`); deck attachment optional (plan §3); seeded inbound stays the never-cut fallback.
- R2 formula: **RESOLVED-by-implementation** — first-signal→decision = analyst open → save (chosen by M3); `DiligenceClient.tsx:79` timer.
- Score math: **RESOLVED-by-implementation** — deterministic `computeAxisScores` + Founder/Trend formulas in `src/lib/scoring.ts`; determinism enforced by check:done `artifacts` + smoke.
- Cut-status + script names: **RESOLVED-by-implementation** — concrete `test`/`build`/`smoke:golden`/`check:done` scripts exist; retained-vs-fallback enforced by the smoke + artifacts gates.
- Pushed-state contract: **RESOLVED-by-implementation** — check:done gate (g) asserts a clean tree AND `HEAD == origin/dispatch/lovable-frontend`.
- Artifact paths: **PARTIAL** — demo script (`docs/ops/DEMO-SCRIPT.md`), replay (`data/replay/`), scan replay (`data/replay/scan/`), graph (`data/graphs/`, `data/demo/`) all exist; MP3 + videos pending (below).

Still open — genuinely block a literal done verdict (HUMAN):

- ElevenLabs voice-brief MP3 not built (needs live key/credits); text-script fallback already present.
- Demo + tech videos not recorded (≤60s each).
- Live-URL submission requirement unconfirmed against the platform form.
- Final UX eyeball at demo viewport (rubric "intuitive, clear, beautifully designed").
- Performance + spend budgets have no numeric targets (non-blocking effort-cap axis).

## Traceability-rule note

The suite design says "no check without an FR." Plan §17 additionally requires README, demo script, attribution, videos, remote push, and submission — packaging gates, not product FRs. This doc keeps them in the judge/automated/manual layers without inventing product FRs for packaging. Whether the design phrase applies only to the Layer-2 table: TBD (owner: human).

## Out of scope for done

- Realtime conversational voice, voice intake, outbound voice notes, live stage-time sourcing, actual outreach sending, validator agent, sourcing-channel graph.
- Portfolio monitoring, fund ops, personal workspace, idea-to-scaffold, browser extension, local-LLM mode.
- A mandatory live Apply path — seeded inbound remains the never-cut fallback.
